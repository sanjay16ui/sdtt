# SDTT Privacy Governance Platform & Real-Time Masking Layer

## Developer & Agent Orientation Guide

This repository contains the full-stack implementation of the **SDTT Privacy Governance Platform & Real-Time Masking Layer**, powered by a **FastAPI** backend, **Microsoft Presidio NLP Engine**, **EasyOCR PyTorch Vision**, **OpenCV**, and a **React + Vite** frontend.

---

## 1. System Architecture & Directory Layout

```
d:/SDTT san/
├── backend/
│   ├── main.py                  # FastAPI Application Gateway (Port 8000)
│   ├── requirements.txt         # Backend Python Dependencies
│   ├── routes/
│   │   ├── text_processing.py   # POST /api/process/text Endpoint
│   │   └── document_processing.py # POST /api/process/document Endpoint
│   └── services/
│       ├── masking_engine.py    # Presidio Analyzer Engine (48 Custom Recognizers)
│       ├── image_masking.py     # EasyOCR PyTorch + OpenCV Vision Engine
│       └── email_service.py     # Real-Time SMTP Email Security Alert Service
└── frontend/
    ├── package.json             # React 19 + Vite Dependencies
    ├── vite.config.js           # Vite Server & Proxy Config (Port 5173 -> 8000)
    └── src/
        ├── pages/
        │   └── Home.jsx         # Three.js 3D Aegis Lynx Mascot Landing Page
        ├── features/multimodal/ # Studio React Components
        └── main.jsx             # React Application Entrypoint
```

---

## 2. Key Modules & Services

### `backend/services/masking_engine.py`
- **Microsoft Presidio `AnalyzerEngine`**: Pre-loaded singleton with `en_core_web_sm`.
- **48 Custom Recognizers**:
  - **P0 Core IDs**: Aadhaar (`IN_AADHAAR`), PAN (`IN_PAN`), Credit/Debit Cards, Person Names, DOB, Addresses, Phones, Emails.
  - **P1 Indian Documents**: Passport (`IN_PASSPORT`), Driving License (`IN_DRIVING_LICENSE`), Voter ID (`IN_VOTER_ID`), GSTIN (`IN_GSTIN`), UAN (`IN_UAN`), IFSC (`IN_IFSC`), Bank Account (`IN_BANK_ACCOUNT`), UPI ID (`IN_UPI_ID`).
  - **P2 DevSecOps Secrets**: AWS Access Keys, AWS Secret Keys, GitHub Tokens, Google API Keys, Slack Tokens, JWT Tokens, DB Connection Strings, Private Keys, Plaintext Passwords, SSH Keys.
  - **P3 Corporate & HR Compliance**: Employee/Student ID (`EMPLOYEE_ID`), Salary/CTC (`SALARY_CTC`), IP Addresses, MAC Addresses, Vehicle Registration, IMEI Numbers, Medical Records, Blood Groups.

### `backend/services/image_masking.py`
- **EasyOCR PyTorch Vision Model**: Pre-loaded singleton (`verbose=False`) for sub-second OCR text block extraction.
- **Multi-Angle Orientation Auto-Detection**: Tests 0°, 90°, and 270° rotations to handle vertical or sideways ID card uploads.
- **Field Value vs. Label Separation**: Masks sensitive values (e.g. `30.08.2006`, `2024PECCS558`, `A+VE`) while keeping field header labels (`Date of Birth :`, `Blood Group :`) visible.
- **Redaction Engine**: Renders clean Gaussian blurred filters over PII text, human face portraits, and QR codes.

### `backend/services/email_service.py`
- **Real-Time SMTP Alert Engine**: Dispatches automated email alerts to `iatchi375@gmail.com` featuring auditor **NAGATHARESH** and real-time IST timestamps whenever sensitive uploads occur.

---

## 3. Running & Launching

### Backend (FastAPI Gateway)
```powershell
cd backend
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```

---

## 4. API Endpoints

- `POST /api/process/text`: Accepts JSON `{ "text": "...", "masking_mode": "UIDAI_STANDARD" }`.
- `POST /api/process/document`: Accepts `multipart/form-data` image file upload (`file`). Returns annotated ingress image data URL, sanitized egress image data URL, detected entities, bounding boxes, risk score, and transformation signature.
- `GET /api/health`: Health status and engine metadata.

---

## 5. Complete Session Chat History & Feature Implementation Log

### Summary of Completed Milestones & System Evolution

1. **Multimodal Masking & Vision Engine (`backend/services/image_masking.py`)**:
   - Integrated **EasyOCR PyTorch** vision model + **OpenCV** image processing.
   - Built **Multi-Angle Auto-Orientation Detection** (0°, 90°, 270°) to support vertical & sideways card uploads.
   - Implemented **Field Value vs. Header Label Separation** (redacts sensitive dates, ID numbers, blood groups while preserving field labels like `Date of Birth :`, `Blood Group :`).
   - Engineered zero-trust **Gaussian Blur Redaction** over PII bounding boxes, human face portraits, and QR codes.

2. **Microsoft Presidio NLP Masking Engine (`backend/services/masking_engine.py`)**:
   - Implemented 48 custom recognizers covering Indian Government & Financial PII (`IN_AADHAAR`, `IN_PAN`, `IN_PASSPORT`, `IN_DRIVING_LICENSE`, `IN_VOTER_ID`, `IN_GSTIN`, `IN_UAN`, `IN_IFSC`, `IN_BANK_ACCOUNT`, `IN_UPI_ID`), DevSecOps Secrets (AWS Keys, GitHub Tokens, JWT, DB connection strings, SSH keys), Corporate HR compliance (Employee IDs, Salary/CTC, Medical Records), and core PII.

3. **Real-Time SMTP Security Email Alert Engine (`backend/services/email_service.py`)**:
   - Asynchronous alert dispatcher sending real-time notifications to `iatchi375@gmail.com` with real-time IST timestamps, auditor **NAGATHARESH**, risk scoring, and detected entity breakdowns upon sensitive data detection.

4. **PDF Audit Report Generator & Statutory Compliance (`/reports`)**:
   - Automated DPIA & EU AI Act compliance engine producing SHA-256 transformation signatures, risk breakdown charts, and printable PDF exports.

5. **3D KV Cache Governance Visualizer**:
   - Interactive 3D tensor visualization for LLM key-value cache layer monitoring and zero-trust differential taint tracking.

6. **Scatter Cortex 3D Data Leak Trajectory Analyzer (`frontend/src/pages/ScatterCortex.jsx`)**:
   - Interactive spatial 3D WebGL network scene mapping multi-path exfiltration routes (Webhooks, Vector DBs, Public S3 buckets).
   - Real-time animated trajectory particle streams, risk breakdown, hop sequence inspection, and 1-click leak path neutralization.

7. **Three.js Interactive 3D Aegis Lynx Mascot Landing Page (`frontend/src/pages/Home.jsx`)**:
   - Implemented Three.js WebGL 3D scene featuring texture-mapped Aegis Cyber Lynx artwork.
   - Configured `THREE.SRGBColorSpace`, `MeshBasicMaterial` unlit rendering, and maximum anisotropic filtering for crisp, bright 3D image clarity.
   - Implemented smooth 3D cursor-tracking (tilt/turn lerp interpolation).
   - Built atmospheric 3D geometry: wireframe shield, orbiting satellite data nodes, rotating neural collar torus ring, pulsing octahedron crest emblem, and 1200 additive data particles.
   - Designed interactive mascot speech intelligence widget with dynamic color-shifting bezel response.
   - Cleaned up technical clutter for a modern, attractive aesthetic.
