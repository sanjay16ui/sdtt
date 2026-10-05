# SDTT Privacy Governance Platform & Real-Time Masking Layer

A high-performance, real-time Privacy Governance platform and multimodal data masking system. Built with **FastAPI**, **Microsoft Presidio NLP Engine**, **EasyOCR (PyTorch Vision)**, **OpenCV**, and **React + Vite**.

---

## 🏗️ Modular Architecture Overview

The repository is organized into distinct, decoupled `frontend/` and `backend/` modules:

```
d:/SDTT san/
├── backend/
│   ├── main.py                  # FastAPI Application Gateway & Middleware
│   ├── requirements.txt         # Python Backend Dependencies
│   ├── models/schemas.py        # Pydantic Response Schemas
│   ├── routes/
│   │   ├── text_processing.py   # POST /api/process/text Endpoint
│   │   └── document_processing.py # POST /api/process/document Endpoint
│   └── services/
│       ├── masking_engine.py    # Microsoft Presidio Analyzer Engine (48 Recognizers)
│       ├── image_masking.py     # EasyOCR PyTorch + OpenCV Multi-Angle Vision Engine
│       └── email_service.py     # Real-Time SMTP Email Security Alert Service
├── frontend/
│   ├── package.json             # React 19 + Vite Dependencies & Scripts
│   ├── vite.config.js           # Vite Server & Proxy Configuration (Port 5173 -> 8000)
│   ├── index.html               # Frontend HTML Entrypoint
│   └── src/
│       ├── features/multimodal/ # Document & Text Masking Studio Components
│       ├── store/               # Audit Ledger & Global State Management
│       └── main.jsx             # React Application Entrypoint
├── .env.local                   # Local Environment Variables & SMTP Config
├── AGENTS.md                    # Developer & Agent Architecture Guide
└── README.md                    # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+

---

### 1. Launching the Backend (FastAPI Gateway)

Open a terminal window and navigate into the `backend/` directory:

```powershell
# Step 1: Navigate to the backend directory
cd backend

# Step 2: Install Python dependencies
py -m pip install -r requirements.txt

# Step 3: Start the FastAPI uvicorn server with hot-reload
py -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

> **API Server Running**: `http://127.0.0.1:8000`  
> **Swagger API Docs**: `http://127.0.0.1:8000/docs`

---

### 2. Launching the Frontend (React + Vite)

Open a **second** terminal window and navigate into the `frontend/` directory:

```powershell
# Step 1: Navigate to the frontend directory
cd frontend

# Step 2: Install Node modules
npm install

# Step 3: Start the Vite development server
npm run dev
```

> **Web App UI Running**: `http://localhost:5173`

---

## 📧 Real-Time SMTP Security Email Alerts

When sensitive data (Aadhaar, PAN, Credit Cards, Medical Records, DevSecOps Secrets) is uploaded, SDTT asynchronously dispatches a real-time SMTP security alert email to the auditor.

### Configuration (`.env.local`)
Create or edit `.env.local` in your root directory:

```env
ALERT_RECIPIENT_EMAIL="iatchi375@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="nareshkottees@gmail.com"
SMTP_PASSWORD="your-16-char-gmail-app-password"
AUDITOR_NAME="NAGATHARESH"
```

---

## 🛡️ Recognizer & Redaction Coverage

| Category | Supported Entities |
| :--- | :--- |
| **P0: Core Indian IDs & PII** | Person Name, Date of Birth, Address, Email, Phone, Aadhaar Card (`IN_AADHAAR`), PAN Card (`IN_PAN`), Credit/Debit Cards |
| **P1: Government Documents** | Passport (`IN_PASSPORT`), Driving License (`IN_DRIVING_LICENSE`), Voter ID (`IN_VOTER_ID`), GSTIN (`IN_GSTIN`), UAN (`IN_UAN`), IFSC Code (`IN_IFSC`), Bank Account (`IN_BANK_ACCOUNT`), UPI ID (`IN_UPI_ID`) |
| **P2: DevSecOps Secrets** | AWS Access Key, AWS Secret Key, GitHub Token, Google API Key, Slack Token, JWT Token, DB Connection String, Private Keys, Plaintext Passwords, SSH Keys |
| **P3: Corporate & HR** | Employee / Student ID, Salary / CTC, IP Address, MAC Address, Vehicle Registration, IMEI Number, Medical Records, Blood Group, Website URLs |

---

## ⚡ Features & Capabilities

- **Separated Frontend/Backend Workspace**: Clean modular layout for easy scaling and deployment.
- **Interactive Three.js 3D Mascot Landing Page**: High-performance WebGL 3D Aegis Cyber Lynx mascot with real-time mouse tracking, rotating neural collar ring, orbiting data nodes, ambient particle stream, and sRGB high-clarity texture rendering.
- **Scatter Cortex 3D Data Leak Trajectory Analyzer**: Spatial WebGL network graph visualizer tracking multi-path exfiltration routes, vector DB taint propagation, unshielded S3 dumps, and instant 1-click leak path neutralization.
- **Multimodal Masking**: Supports real-time redaction across unstructured text payloads and identity document images (Aadhaar cards, PAN cards, Student ID cards, Driver's Licenses, Passports, Corporate HR records).
- **Microsoft Presidio Integration**: Built-in NLP-based entity resolution powered by spaCy (`en_core_web_sm`) and 48 custom recognizers.
- **Multi-Angle Vision Engine**: EasyOCR PyTorch vision pipeline with automatic orientation detection (0°, 90°, 270°) for vertical/rotated card uploads.
- **Value vs. Label Separation**: Automatically masks sensitive values (`30.08.2006`, `2024PECCS558`, `A+VE`, phone numbers) while keeping metadata field headers readable.
- **Clean Gaussian Blur Redaction**: Renders zero-trust Gaussian blur filters over PII text blocks, human face portraits, and QR codes without ugly black bars.
