import time
from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.models.schemas import TextProcessRequest, TextProcessResponse
from backend.services.masking_engine import MaskingEngine
from backend.services.email_service import EmailAlertService

router = APIRouter(prefix="/process", tags=["Text Processing"])

@router.post("/text", response_model=TextProcessResponse)
async def process_text_payload(
    request: TextProcessRequest,
    background_tasks: BackgroundTasks
):
    """
    Process raw text payload:
    - Real-time regex & pattern detection of Aadhaar UID, PAN, Email, Phone, Financials.
    - Applies UIDAI standard masking (XXXX-XXXX-1234) or hard redaction.
    - Computes differential privacy risk scores and credible intervals.
    - Triggers SMTP email alerts asynchronously when sensitive data is detected.
    """
    t0 = time.time()
    try:
        sanitized_text, detected, risk_score, credible_int, decision, tx_sig = MaskingEngine.process_text(
            request.text, 
            request.masking_mode or "UIDAI_STANDARD"
        )
        latency = round((time.time() - t0) * 1000, 2)

        # Trigger SMTP email alert if sensitive data was detected
        if detected:
            background_tasks.add_task(
                EmailAlertService.send_sensitive_data_alert,
                filename="text_payload.txt",
                detected_entities=detected,
                risk_score=risk_score,
                transformation_signature=tx_sig,
                file_type="Raw Text Submission"
            )

        return TextProcessResponse(
            success=True,
            original_text=request.text,
            masked_text=sanitized_text,
            detected_entities=detected,
            risk_score=risk_score,
            credible_interval=credible_int,
            decision=decision,
            policy_enforced=request.policy_id or "POL-01 (UIDAI Safe Harbor)",
            execution_time_ms=latency,
            transformation_signature=tx_sig
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
