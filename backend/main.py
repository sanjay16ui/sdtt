import os
import sys

# Ensure root directory is in sys.path for backend module imports
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.text_processing import router as text_router
from backend.routes.document_processing import router as doc_router

app = FastAPI(
    title="SDTT Privacy Governance API",
    description="Differential Taint Tracking & Real-Time Masking Layer",
    version="1.0.0"
)

# Enable CORS for React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(text_router, prefix="/api")
app.include_router(doc_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "SDTT Privacy Governance Gateway",
        "version": "1.0.0",
        "engine": "FastAPI + Pillow Real-Time Masking",
        "supported_modalities": ["TEXT", "DOCUMENT_IMAGE", "AADHAAR_CARD"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
