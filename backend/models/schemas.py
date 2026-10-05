from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Dict, Any

class DetectedEntity(BaseModel):
    type: str = Field(..., description="Entity category: AADHAAR, PAN, EMAIL, PHONE, FINANCIAL, etc.")
    label: str = Field(..., description="Human-readable label")
    raw_value: str = Field(..., description="Original raw detected value")
    masked_value: str = Field(..., description="Masked/redacted replacement")
    sensitivity: str = Field(..., description="Low, Medium, High, Critical")
    confidence: float = Field(..., description="Detection confidence 0.0-1.0")
    start: Optional[int] = None
    end: Optional[int] = None

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int
    label: str
    sensitivity: str

class TextProcessRequest(BaseModel):
    text: str = Field(..., description="Raw text payload to analyze and mask")
    subject_id: Optional[str] = Field("SUB-20491", description="Subject identifier")
    policy_id: Optional[str] = Field("POL-01", description="Governance policy identifier")
    masking_mode: Optional[str] = Field("UIDAI_STANDARD", description="UIDAI_STANDARD, HARD_REDACT, SURROGATE")

class TextProcessResponse(BaseModel):
    success: bool
    original_text: str
    masked_text: str
    detected_entities: List[DetectedEntity]
    risk_score: float
    credible_interval: Tuple[float, float]
    decision: str
    policy_enforced: str
    execution_time_ms: float
    transformation_signature: str

class DocumentProcessResponse(BaseModel):
    success: bool
    filename: str
    file_type: str
    detected_entities: List[DetectedEntity]
    bounding_boxes: List[BoundingBox]
    original_image_url: Optional[str] = None
    masked_image_url: Optional[str] = None
    extracted_text: str
    sanitized_text: str
    risk_score: float
    decision: str
    policy_enforced: str
    execution_time_ms: float
    transformation_signature: str
