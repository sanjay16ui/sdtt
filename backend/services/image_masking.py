import io
import re
import sys
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from typing import List, Tuple
from backend.models.schemas import BoundingBox, DetectedEntity
from backend.services.masking_engine import MaskingEngine, _analyzer, ALL_ENTITY_TYPES, PRESIDIO_ENTITY_MAP

# OpenCV for computer vision / barcode / QR code / face detection / image rotation
try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

# Open-Source EasyOCR benchmark model singleton
_ocr_reader = None
HAS_EASYOCR = False

def get_ocr_reader():
    global _ocr_reader, HAS_EASYOCR
    if _ocr_reader is None:
        try:
            import easyocr
            _ocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
            HAS_EASYOCR = True
            print("[ImageMaskingService] EasyOCR PyTorch benchmark vision model loaded into memory.")
        except Exception as e:
            print(f"[ImageMaskingService] EasyOCR load notice: {e}")
            HAS_EASYOCR = False
    return _ocr_reader


# Safe PIL rectangle drawing helper
def safe_draw_rect(draw_obj, p1, p2, fill=None, outline=None, width=1):
    x0, y0 = p1
    x1, y1 = p2
    rx0 = max(0, min(int(x0), int(x1)))
    rx1 = max(rx0 + 5, max(int(x0), int(x1)))
    ry0 = max(0, min(int(y0), int(y1)))
    ry1 = max(ry0 + 5, max(int(y0), int(y1)))
    draw_obj.rectangle([(rx0, ry0), (rx1, ry1)], fill=fill, outline=outline, width=width)


# Safe Gaussian blur crop-and-paste helper (the ONLY masking method used on egress)
def blur_region(pil_img, x1, y1, x2, y2, radius=20):
    """Crop region, apply Gaussian blur, paste back. No boxes, no labels, just blur."""
    x1 = max(0, int(x1))
    y1 = max(0, int(y1))
    x2 = min(pil_img.width, max(x1 + 10, int(x2)))
    y2 = min(pil_img.height, max(y1 + 10, int(y2)))
    if x2 <= x1 or y2 <= y1:
        return pil_img
    crop = pil_img.crop((x1, y1, x2, y2))
    blurred = crop.filter(ImageFilter.GaussianBlur(radius=radius))
    pil_img.paste(blurred, (x1, y1))
    return pil_img


# OpenCV Haar Cascade for Face Detection (ONLY frontal face cascades, no upperbody/fullbody)
_face_cascades = None

def get_face_cascades():
    global _face_cascades
    if _face_cascades is None and HAS_OPENCV:
        try:
            cascade_files = [
                'haarcascade_frontalface_default.xml',
                'haarcascade_frontalface_alt2.xml',
                'haarcascade_profileface.xml'
            ]
            _face_cascades = []
            for cf in cascade_files:
                path = cv2.data.haarcascades + cf
                cascade = cv2.CascadeClassifier(path)
                if not cascade.empty():
                    _face_cascades.append(cascade)
            print(f"[ImageMaskingService] Loaded {len(_face_cascades)} OpenCV Haar face cascade models.")
        except Exception as e:
            print(f"[ImageMaskingService] Error loading Haar face cascades: {e}")
            _face_cascades = []
    return _face_cascades or []


def detect_human_faces(cv_img, orig_w, orig_h) -> List[BoundingBox]:
    """Detect real human faces only. No upperbody/fullbody, no skin contour, no fallback."""
    face_boxes = []
    if not HAS_OPENCV:
        return face_boxes

    cascades = get_face_cascades()
    if not cascades:
        return face_boxes

    detected_rects = []

    # Only scan original orientation (0 deg) for face detection
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    for cascade in cascades:
        rects = cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        for (rx, ry, rw, rh) in rects:
            # Expand by 25% to cover hair, chin, ears
            pad_w = int(rw * 0.25)
            pad_h = int(rh * 0.30)
            exp_x = max(0, rx - pad_w)
            exp_y = max(0, ry - pad_h)
            exp_w = min(orig_w - exp_x, rw + 2 * pad_w)
            exp_h = min(orig_h - exp_y, rh + 2 * pad_h)

            overlap = False
            for bx, by, bw, bh in detected_rects:
                if abs(exp_x - bx) < 50 and abs(exp_y - by) < 50:
                    overlap = True
                    break

            if not overlap:
                detected_rects.append((exp_x, exp_y, exp_w, exp_h))
                face_boxes.append(BoundingBox(
                    x=exp_x, y=exp_y, width=exp_w, height=exp_h,
                    label="Human Photo / Face Identification",
                    sensitivity="Critical"
                ))

    return face_boxes


def merge_contiguous_boxes(boxes: List[BoundingBox], max_x_gap: int = 35) -> List[BoundingBox]:
    if not boxes:
        return []

    special_boxes = [b for b in boxes if "Photo" in b.label or "Face" in b.label or "QR" in b.label or "Barcode" in b.label or "UID" in b.label]
    text_boxes = [b for b in boxes if b not in special_boxes]

    if not text_boxes:
        return special_boxes

    sorted_boxes = sorted(text_boxes, key=lambda b: (b.y, b.x))
    merged: List[BoundingBox] = []

    for b in sorted_boxes:
        if not merged:
            merged.append(b)
            continue

        prev = merged[-1]
        same_line = abs(b.y - prev.y) < max(14, int(prev.height * 0.65))
        close_x = (b.x - (prev.x + prev.width)) <= max_x_gap

        if same_line and close_x:
            new_x = min(prev.x, b.x)
            new_y = min(prev.y, b.y)
            max_x2 = max(prev.x + prev.width, b.x + b.width)
            max_y2 = max(prev.y + prev.height, b.y + b.height)
            
            sens_order = {"Critical": 3, "High": 2, "Medium": 1, "Low": 0}
            prev_s = sens_order.get(prev.sensitivity, 1)
            b_s = sens_order.get(b.sensitivity, 1)
            final_sens = prev.sensitivity if prev_s >= b_s else b.sensitivity

            merged[-1] = BoundingBox(
                x=new_x, y=new_y,
                width=max_x2 - new_x, height=max_y2 - new_y,
                label=prev.label, sensitivity=final_sens
            )
        else:
            merged.append(b)

    return special_boxes + merged


class ImageMaskingService:
    @staticmethod
    def process_image(image_bytes: bytes, filename: str) -> Tuple[str, str, List[DetectedEntity], List[BoundingBox], str, str]:
        img = None
        is_synthetic = False

        # 1. Open uploaded image (Optimal 800px max dimension for sub-second CPU PyTorch OCR)
        if image_bytes and len(image_bytes) > 0:
            try:
                img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            except Exception:
                img = None

        # 2. Fallback to synthetic Aadhaar card template
        if img is None:
            is_synthetic = True
            img = Image.new("RGB", (700, 440), color=(248, 250, 252))
            draw = ImageDraw.Draw(img)
            draw.rectangle([(0, 0), (700, 50)], fill=(224, 231, 255))
            draw.text((180, 16), "Government of India / Unique Identification Authority", fill=(30, 41, 59))
            draw.rectangle([(40, 90), (180, 260)], fill=(203, 213, 225), outline=(148, 163, 184))
            draw.text((80, 165), "[PHOTO]", fill=(100, 116, 139))
            draw.text((220, 95), "Name: Rajesh Kumar Sharma", fill=(15, 23, 42))
            draw.text((220, 130), "DOB: 14/08/1988 | Male", fill=(15, 23, 42))
            draw.text((220, 165), "Address: Flat 402, Green Valley Apartments, Bengaluru", fill=(51, 65, 85))
            draw.text((220, 192), "PIN: 560100 | Phone: +91 98241 12049", fill=(51, 65, 85))
            draw.text((230, 310), "8492 1204 9912", fill=(185, 28, 28))
            draw.rectangle([(520, 85), (660, 225)], fill=(15, 23, 42))

        width, height = img.size
        boxes: List[BoundingBox] = []

        # 3. OpenCV: QR Code Detection & Face Detection
        qr_detected = False
        if HAS_OPENCV:
            cv_base = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

            # QR Code Detection
            try:
                detector = cv2.QRCodeDetector()
                retval, decoded_info, points, _ = detector.detectAndDecodeMulti(cv_base)
                if retval and points is not None and len(points) > 0:
                    for pts in points:
                        pts = pts.astype(int)
                        min_x, max_x = np.min(pts[:, 0]), np.max(pts[:, 0])
                        min_y, max_y = np.min(pts[:, 1]), np.max(pts[:, 1])
                        w = max(15, max_x - min_x)
                        h = max(15, max_y - min_y)
                        boxes.append(BoundingBox(
                            x=int(min_x), y=int(min_y), width=int(w), height=int(h),
                            label="Secure QR Code", sensitivity="High"
                        ))
                        qr_detected = True
            except Exception as e:
                print(f"[ImageMaskingService] OpenCV QR detection notice: {e}")

            # Face Detection (only real faces, no upperbody/fullbody/skin contour)
            try:
                face_boxes = detect_human_faces(cv_base, width, height)
                boxes.extend(face_boxes)
            except Exception as e:
                print(f"[ImageMaskingService] Face detection notice: {e}")

        # 4. Smart Early-Exit EasyOCR + Presidio NLP Engine
        full_document_text = ""
        if not is_synthetic:
            reader = get_ocr_reader()
            if reader:
                try:
                    cv_base = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                    
                    # Pass 1: Test standard 0 degree orientation first
                    best_results = reader.readtext(cv_base)
                    best_angle = 0
                    max_text_score = sum(len(t[1].strip()) * t[2] for t in best_results if t[2] > 0.15)

                    # Early exit: If 0 degree angle detected readable text (score > 3.0), skip 90/270 degree passes!
                    if max_text_score < 3.0 and HAS_OPENCV:
                        rot_angles = [
                            (90, cv2.rotate(cv_base, cv2.ROTATE_90_CLOCKWISE)),
                            (270, cv2.rotate(cv_base, cv2.ROTATE_90_COUNTERCLOCKWISE))
                        ]
                        for angle, cv_rotated in rot_angles:
                            res = reader.readtext(cv_rotated)
                            score = sum(len(t[1].strip()) * t[2] for t in res if t[2] > 0.15)
                            if score > max_text_score:
                                max_text_score = score
                                best_results = res
                                best_angle = angle

                    rot_img_h, rot_img_w = cv_base.shape[:2]
                    ocr_items = []
                    text_parts = []
                    current_offset = 0

                    for bbox, text, prob in best_results:
                        clean_t = text.strip()
                        if prob < 0.15 or not clean_t:
                            continue

                        pts = np.array(bbox, dtype=int)
                        rx_min, rx_max = np.min(pts[:, 0]), np.max(pts[:, 0])
                        ry_min, ry_max = np.min(pts[:, 1]), np.max(pts[:, 1])
                        rw = max(10, rx_max - rx_min)
                        rh = max(10, ry_max - ry_min)

                        if best_angle == 90:
                            x, y, w, h = int(ry_min), int(rot_img_w - rx_max), int(rh), int(rw)
                        elif best_angle == 270:
                            x, y, w, h = int(rot_img_h - ry_max), int(rx_min), int(rh), int(rw)
                        else:
                            x, y, w, h = int(rx_min), int(ry_min), int(rw), int(rh)

                        start_pos = current_offset
                        end_pos = start_pos + len(clean_t)

                        ocr_items.append({
                            "bbox": bbox, "text": clean_t,
                            "start": start_pos, "end": end_pos,
                            "x": max(0, x), "y": max(0, y), "w": w, "h": h
                        })

                        text_parts.append(clean_t)
                        current_offset = end_pos + 1

                    full_document_text = " ".join(text_parts)

                    # A) Presidio NLP over Full Document Text
                    presidio_results = _analyzer.analyze(
                        text=full_document_text, language='en',
                        entities=ALL_ENTITY_TYPES, score_threshold=0.25
                    )

                    for p_res in presidio_results:
                        meta = PRESIDIO_ENTITY_MAP.get(
                            p_res.entity_type,
                            {"label": p_res.entity_type, "sensitivity": "Medium"}
                        )
                        matching_items = [
                            item for item in ocr_items
                            if not (item["end"] <= p_res.start or item["start"] >= p_res.end)
                        ]
                        for item in matching_items:
                            already_added = any(
                                abs(b.x - item["x"]) < 8 and abs(b.y - item["y"]) < 8
                                for b in boxes
                            )
                            if not already_added:
                                boxes.append(BoundingBox(
                                    x=item["x"], y=item["y"], width=item["w"], height=item["h"],
                                    label=meta["label"], sensitivity=meta["sensitivity"]
                                ))

                    # B) Field Rule Resolver
                    for item in ocr_items:
                        txt = item["text"]
                        t_upper = txt.upper()
                        already_added = any(
                            abs(b.x - item["x"]) < 8 and abs(b.y - item["y"]) < 8
                            for b in boxes
                        )
                        if already_added:
                            continue

                        if re.search(r'\b(?:S/O|D/O|W/O|C/O|Son of|Daughter of|Wife of|Care of)\b', txt, re.I):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Care Of / Parent Name", sensitivity="High"))

                        elif re.search(r'\b(?:Address|Residing|Street|Nagar|Colony|District|Pincode|PIN|Flat|Door|H\.?No|Plot)\b', txt, re.I):
                            if not any(w in t_upper for w in ["GOVERNMENT", "AUTHORITY", "COLLEGE", "ENGINEERING"]):
                                boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Residential Address", sensitivity="High"))

                        elif re.search(r'\b[A-Z]{3,15}\s+[A-Z]{1,12}(?:\s+[A-Z]{1,5})*\b', txt) and len(txt) >= 5:
                            if not any(w in t_upper for w in ["PANIMALAR", "ENGINEERING", "COLLEGE", "GOVERNMENT", "INDIA", "AUTHORITY", "OVERLEAF", "STUDENT SIGN", "PRINCIPAL", "BATCH", "INTERNSHIP", "COMPLETION", "CERTIFICATE", "DOMAIN", "DESIGNATION", "SINCERELY"]):
                                boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Person Name (Name)", sensitivity="High"))

                        elif re.search(r'\b[0-9]{4}[A-Z]{3,7}[0-9]{3,6}\b|\bEMP[-_]?[0-9]{3,8}\b', txt, re.I):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Employee / Student ID", sensitivity="High"))

                        elif re.search(r'\bBATCH[:\s]*\d{4}\s*-\s*\d{4}\b|\b\d{4}\s*-\s*\d{4}\b', t_upper):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Academic Batch / Years", sensitivity="High"))

                        elif re.search(r'\b\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4}\b', txt):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Date of Birth (DOB)", sensitivity="High"))

                        elif '@' in txt or re.search(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', txt):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Email Address", sensitivity="High"))

                        elif any(kw in txt.lower() for kw in ["www.", ".ac.in", ".edu", "website"]) or re.search(r'\b[a-zA-Z0-9.-]+\.(?:ac|edu|com|in)\b', txt, re.I):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="URL / Web Address", sensitivity="Medium"))

                        elif re.search(r'\b[6-9]\d{9}\b|\b0\d{2,4}[-\s]?\d{6,8}\b|\+91[-\s]?\d{10}', txt):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Phone Number", sensitivity="High"))

                        elif re.search(r'\b(?:A|B|AB|O)[+-]\s*(?:VE|POS|NEG)?\b', t_upper):
                            boxes.append(BoundingBox(x=item["x"], y=item["y"], width=item["w"], height=item["h"], label="Medical / Blood Group", sensitivity="High"))

                except Exception as e:
                    print(f"[ImageMaskingService] Multi-angle EasyOCR + Presidio error: {e}")

        # 5. Synthetic Template Boxes
        if is_synthetic:
            boxes.append(BoundingBox(x=int(width * 0.05), y=int(height * 0.20), width=int(width * 0.22), height=int(height * 0.40), label="Human Photo / Face Identification", sensitivity="Critical"))
            if not qr_detected:
                boxes.append(BoundingBox(x=int(width * 0.74), y=int(height * 0.19), width=int(width * 0.20), height=int(height * 0.32), label="Secure QR Code", sensitivity="High"))
            boxes.append(BoundingBox(x=int(width * 0.31), y=int(height * 0.21), width=int(width * 0.40), height=int(height * 0.07), label="Person Name (Name)", sensitivity="High"))
            boxes.append(BoundingBox(x=int(width * 0.31), y=int(height * 0.29), width=int(width * 0.35), height=int(height * 0.07), label="Date of Birth (DOB)", sensitivity="High"))
            boxes.append(BoundingBox(x=int(width * 0.31), y=int(height * 0.37), width=int(width * 0.42), height=int(height * 0.14), label="Home Address & Phone", sensitivity="High"))
            boxes.append(BoundingBox(x=int(width * 0.32), y=int(height * 0.70), width=int(width * 0.45), height=int(height * 0.11), label="Aadhaar UID (12 Digits)", sensitivity="Critical"))

        # 6. Merge Contiguous Boxes
        boxes = merge_contiguous_boxes(boxes, max_x_gap=35)
        boxes.sort(key=lambda b: (b.y, b.x))

        # 7. Generate Annotated Ingress Image (bounding boxes for visualization only)
        annotated_img = img.copy()
        draw_annotated = ImageDraw.Draw(annotated_img)
        for box in boxes:
            color = (239, 68, 68) if box.sensitivity == "Critical" else (245, 158, 11)
            bx1 = max(0, int(box.x))
            by1 = max(0, int(box.y))
            bx2 = min(width, max(bx1 + 15, int(box.x + box.width)))
            by2 = min(height, max(by1 + 15, int(box.y + box.height)))

            safe_draw_rect(draw_annotated, (bx1, by1), (bx2, by2), outline=color, width=3)
            tag_width = max(90, int(len(box.label) * 7.2))
            tag_y0 = max(0, by1 - 18)
            tag_y1 = max(tag_y0 + 15, by1 + 2)
            tag_x2 = min(width, max(bx1 + 30, bx1 + tag_width))
            safe_draw_rect(draw_annotated, (bx1, tag_y0), (tag_x2, tag_y1), fill=color)
            draw_annotated.text((bx1 + 4, tag_y0 + 2), box.label, fill=(255, 255, 255))

        # 8. Generate Masked Egress Image — BLUR ONLY, no boxes, no labels, no solid bars
        masked_img = img.copy()

        for box in boxes:
            x1 = max(0, int(box.x))
            y1 = max(0, int(box.y))
            x2 = min(width, max(x1 + 10, int(box.x + box.width)))
            y2 = min(height, max(y1 + 10, int(box.y + box.height)))

            if "QR" in box.label or "Barcode" in box.label:
                # QR code: strong blur
                masked_img = blur_region(masked_img, x1, y1, x2, y2, radius=22)
            elif "Photo" in box.label or "Face" in box.label:
                # Human face: heavy blur
                masked_img = blur_region(masked_img, x1, y1, x2, y2, radius=30)
            elif "UID" in box.label or "Aadhaar" in box.label:
                # Aadhaar UID: blur first 68%
                mask_x2 = min(width, x1 + max(10, int(box.width * 0.68)))
                masked_img = blur_region(masked_img, x1, y1, mask_x2, y2, radius=20)
            else:
                # All text PII (names, DOB, addresses, emails, phones, IDs): blur
                masked_img = blur_region(masked_img, x1, y1, x2, y2, radius=18)

        # 9. Encode images to base64 Data URLs
        def to_data_url(image_obj):
            buffered = io.BytesIO()
            image_obj.save(buffered, format="PNG")
            b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/png;base64,{b64_str}"

        original_data_url = to_data_url(annotated_img)
        masked_data_url = to_data_url(masked_img)

        # Extracted OCR text & Presidio Sanitization
        extracted_text = full_document_text if full_document_text else "Name: Rajesh Kumar Sharma | DOB: 14/08/1988 | UID: 8492 1204 9912 | Address: Flat 402, Green Valley Apartments, Bengaluru PIN 560100 Phone: +91 98241 12049"
        sanitized_text, detected_entities, _, _, _, _ = MaskingEngine.process_text(extracted_text)

        return original_data_url, masked_data_url, detected_entities, boxes, extracted_text, sanitized_text
