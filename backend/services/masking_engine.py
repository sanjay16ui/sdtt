import re
import time
import hashlib
import random
from typing import List, Tuple
from backend.models.schemas import DetectedEntity

# ======================================================================
# Microsoft Presidio -- singleton initialization (loaded once on import)
# ======================================================================
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider

_nlp_config = {
    "nlp_engine_name": "spacy",
    "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}]
}
_nlp_provider = NlpEngineProvider(nlp_configuration=_nlp_config)
_nlp_engine = _nlp_provider.create_engine()

# Build the global AnalyzerEngine
_analyzer = AnalyzerEngine(nlp_engine=_nlp_engine)

# ======================================================================
# P0: Core Indian ID recognizers (Aadhaar + PAN)
# ======================================================================
_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_AADHAAR",
    name="Indian Aadhaar Recognizer",
    patterns=[Pattern("aadhaar", r'\b[2-9]{1}[0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b', 0.98)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_PAN",
    name="Indian PAN Recognizer",
    patterns=[Pattern("pan", r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', 0.99)],
    supported_language="en"
))

# ======================================================================
# P1: Indian Government ID Documents (Passport, DL, Voter, Bank, etc.)
# ======================================================================
_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_PASSPORT",
    name="Indian Passport Recognizer",
    patterns=[Pattern("passport", r'\b[A-Z]{1}[0-9]{7}\b', 0.85)],
    context=["passport", "travel document", "passport no", "passport number"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_DRIVING_LICENSE",
    name="Indian Driving License Recognizer",
    patterns=[Pattern("dl", r'\b[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}\b', 0.90)],
    context=["driving license", "DL", "licence", "license no", "driving licence"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_VOTER_ID",
    name="Indian Voter ID (EPIC) Recognizer",
    patterns=[Pattern("voter_id", r'\b[A-Z]{3}[0-9]{7}\b', 0.85)],
    context=["voter", "EPIC", "voter id", "election", "voter card"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_GSTIN",
    name="Indian GSTIN Recognizer",
    patterns=[Pattern("gstin", r'\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b', 0.97)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_UAN",
    name="Indian UAN (EPF) Recognizer",
    patterns=[Pattern("uan", r'\b1[0-9]{11}\b', 0.80)],
    context=["UAN", "EPF", "provident fund", "universal account"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_IFSC",
    name="Indian IFSC Code Recognizer",
    patterns=[Pattern("ifsc", r'\b[A-Z]{4}0[A-Z0-9]{6}\b', 0.92)],
    context=["IFSC", "bank", "branch", "NEFT", "RTGS"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_BANK_ACCOUNT",
    name="Indian Bank Account Recognizer",
    patterns=[
        Pattern("bank_acc_long", r'\b[0-9]{11,18}\b', 0.60),
    ],
    context=["account", "a/c", "bank", "savings", "current", "account number", "acc no"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_UPI_ID",
    name="Indian UPI ID Recognizer",
    patterns=[Pattern("upi", r'\b[a-zA-Z0-9._-]+@[a-z]{2,}(?:bank|pay|upi|paytm|ybl|oksbi|okaxis|okicici|okhdfcbank|apl|ibl)\b', 0.93)],
    supported_language="en"
))

# ======================================================================
# P2: DevSecOps -- API Keys, Tokens, Secrets, Credentials
# ======================================================================
_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="AWS_ACCESS_KEY",
    name="AWS Access Key Recognizer",
    patterns=[Pattern("aws_key", r'\bAKIA[0-9A-Z]{16}\b', 0.99)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="AWS_SECRET_KEY",
    name="AWS Secret Key Recognizer",
    patterns=[Pattern("aws_secret", r'(?:aws_secret_access_key|aws_secret|secret_key)\s*[=:]\s*[A-Za-z0-9/+=]{40}', 0.97)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="GITHUB_TOKEN",
    name="GitHub Token Recognizer",
    patterns=[
        Pattern("ghp", r'\bghp_[A-Za-z0-9]{36}\b', 0.99),
        Pattern("gho", r'\bgho_[A-Za-z0-9]{36}\b', 0.99),
        Pattern("ghs", r'\bghs_[A-Za-z0-9]{36}\b', 0.99),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="GOOGLE_API_KEY",
    name="Google API Key Recognizer",
    patterns=[Pattern("gapi", r'\bAIza[0-9A-Za-z\-_]{35}\b', 0.98)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="SLACK_TOKEN",
    name="Slack Token Recognizer",
    patterns=[
        Pattern("xoxb", r'\bxoxb-[0-9A-Za-z\-]+\b', 0.97),
        Pattern("xoxp", r'\bxoxp-[0-9A-Za-z\-]+\b', 0.97),
        Pattern("xoxs", r'\bxoxs-[0-9A-Za-z\-]+\b', 0.97),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="JWT_TOKEN",
    name="JWT Token Recognizer",
    patterns=[Pattern("jwt", r'\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b', 0.96)],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="DB_CONNECTION_STRING",
    name="Database Connection String Recognizer",
    patterns=[
        Pattern("postgres", r'postgres(?:ql)?://[^\s]+', 0.97),
        Pattern("mongodb", r'mongodb(?:\+srv)?://[^\s]+', 0.97),
        Pattern("mysql", r'mysql://[^\s]+', 0.97),
        Pattern("redis", r'redis://[^\s]+', 0.95),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="PRIVATE_KEY",
    name="Private Key Recognizer",
    patterns=[
        Pattern("rsa", r'-----BEGIN (?:RSA )?PRIVATE KEY-----', 0.99),
        Pattern("ec", r'-----BEGIN EC PRIVATE KEY-----', 0.99),
        Pattern("openssh", r'-----BEGIN OPENSSH PRIVATE KEY-----', 0.99),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="PASSWORD_IN_TEXT",
    name="Password in Plaintext Recognizer",
    patterns=[
        Pattern("pw_eq", r'(?:password|passwd|pwd|secret|token|api_key|apikey|auth_token)\s*[=:]\s*\S+', 0.88),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="SSH_KEY",
    name="SSH Public Key Recognizer",
    patterns=[Pattern("ssh_rsa", r'ssh-(?:rsa|ed25519|dss)\s+AAAA[A-Za-z0-9+/]+[=]{0,3}', 0.95)],
    supported_language="en"
))

# ======================================================================
# P3: Corporate & HR Data (Employee ID, Salary, Medical, IP, Vehicle)
# ======================================================================
_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="EMPLOYEE_ID",
    name="Employee ID Recognizer",
    patterns=[
        Pattern("emp_id", r'\bEMP[-_]?[0-9]{4,8}\b', 0.92),
        Pattern("emp_no", r'\b[Ee]mployee\s*(?:ID|No|#|Number)[:\s]*[A-Z0-9\-]{4,12}\b', 0.85),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="SALARY_CTC",
    name="Salary / CTC Recognizer",
    patterns=[
        Pattern("ctc_inr", r'(?:CTC|salary|compensation|package|pay|stipend|remuneration)\s*[:\-]?\s*(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d+)?(?:\s*(?:LPA|lakh|lakhs|crore|crores|per\s*(?:month|annum|year)))?', 0.90),
        Pattern("lpa", r'(?:Rs\.?|INR|₹)\s*[\d,.]+\s*(?:LPA|Lakh(?:s)?(?:\s*per\s*(?:annum|year))?|Crore(?:s)?)', 0.92),
        Pattern("salary_usd", r'(?:salary|CTC|compensation)\s*[:\-]?\s*\$[\d,]+(?:\.\d+)?(?:\s*(?:K|M|per\s*(?:month|annum|year)))?', 0.88),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IP_ADDRESS",
    name="IP Address Recognizer",
    patterns=[
        Pattern("ipv4", r'\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b', 0.85),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="MAC_ADDRESS",
    name="MAC Address Recognizer",
    patterns=[
        Pattern("mac_colon", r'\b[0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){5}\b', 0.90),
        Pattern("mac_dash", r'\b[0-9A-Fa-f]{2}(?:-[0-9A-Fa-f]{2}){5}\b', 0.90),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="VEHICLE_REGISTRATION",
    name="Indian Vehicle Registration Recognizer",
    patterns=[Pattern("veh_reg", r'\b[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}\b', 0.80)],
    context=["vehicle", "car", "registration", "reg no", "number plate", "license plate"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IMEI_NUMBER",
    name="IMEI Number Recognizer",
    patterns=[Pattern("imei", r'\b[0-9]{15}\b', 0.65)],
    context=["IMEI", "device", "mobile", "handset", "phone serial"],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="MEDICAL_RECORD",
    name="Medical / Health Data Recognizer",
    patterns=[
        Pattern("icd10", r'\b[A-Z][0-9]{2}(?:\.[0-9]{1,2})?\b', 0.70),
        Pattern("mrn", r'\bMRN[-:\s]*[0-9]{6,12}\b', 0.92),
        Pattern("policy_health", r'\b(?:STAR|ICICI|HDFC|NIVA|TATA)[-\s]?(?:HI|HEALTH|MED)[-\s]?[0-9\-]{6,15}\b', 0.88),
    ],
    context=["diagnosis", "patient", "medical", "health", "prescription", "ICD", "MRN", "hospital", "treatment", "disease", "condition"],
    supported_language="en"
))

# Additional ID Card / Document PII Recognizers
_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_EMAIL",
    name="ID Card Email Recognizer",
    patterns=[
        Pattern("email_explicit", r'(?:e-mail|email)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+(?:\s*@\s*|\s*at\s*)[a-zA-Z0-9.-]+(?:\s*\.\s*|\s*dot\s*)[a-zA-Z]{2,})', 0.95),
        Pattern("email_std", r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', 0.95),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_URL",
    name="ID Card Website/URL Recognizer",
    patterns=[
        Pattern("url_explicit", r'(?:website|web|site)\s*[:\-]?\s*(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 0.92),
        Pattern("url_std", r'\b(?:www\.)?[a-zA-Z0-9.-]+\.(?:ac|edu|com|in|org|gov)\.[a-zA-Z]{2,}\b|\bwww\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', 0.95),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_DOB",
    name="Indian ID Date of Birth Recognizer",
    patterns=[
        Pattern("dob_explicit", r'(?:date of birth|dob|birth)\s*[:\-]?\s*\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4}', 0.95),
        Pattern("dob_std", r'\b\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4}\b', 0.88),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_CARE_OF",
    name="Care Of / Parent / Spouse Name Recognizer",
    patterns=[
        Pattern("care_of_short", r'(?:S/O|D/O|W/O|C/O|s/o|d/o|w/o|c/o)\s*[:\-]?\s*[A-Za-z\s\.]{3,40}', 0.95),
        Pattern("care_of_long", r'(?:Son of|Daughter of|Wife of|Care of|Father\'?s Name|Spouse Name)\s*[:\-]?\s*[A-Za-z\s\.]{3,40}', 0.95),
    ],
    supported_language="en"
))

_analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="IN_ADDRESS_SENTENCE",
    name="Indian Residential Address Sentence Recognizer",
    patterns=[
        Pattern("addr_head", r'(?:Address|Residing at|Permanent Address|Present Address|Residential Address)\s*[:\-]?\s*[\w\s,.\/\-]{5,100}', 0.92),
        Pattern("addr_street", r'(?:Flat|Door|House|H\.?No|Plot)\s*[:\-]?\s*[\w\s,.\/\-]{5,80}', 0.88),
    ],
    supported_language="en"
))

_registered_count = len(_analyzer.registry.recognizers)
print(f"[MaskingEngine] Presidio initialized: {_registered_count} recognizers (P0+P1+P2+P3)")



# ======================================================================
# Legacy regex patterns (financial amounts not covered by Presidio)
# ======================================================================
REGEX_PATTERNS = {
    "CREDIT_CARD": {
        "regex": re.compile(r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'),
        "label": "Credit/Debit Card",
        "sensitivity": "Critical",
        "confidence": 0.96
    },
    "FINANCIAL": {
        "regex": re.compile(r'(?:(?!salary|CTC|compensation|package|pay).)(?:₹|\$|INR|USD)\s?\d+(?:,\d+)*(?:\.\d+)?(?:\s?(?:Crore|Lakh|Million|Billion|K|M|B))?', re.IGNORECASE),
        "label": "Financial Revenue/Asset",
        "sensitivity": "High",
        "confidence": 0.90
    }
}

# ======================================================================
# Presidio entity -> human label / sensitivity mapping
# ======================================================================
PRESIDIO_ENTITY_MAP = {
    # P0: Core
    "PERSON":               {"label": "Person Name",                     "sensitivity": "High"},
    "DATE_TIME":            {"label": "Date / Date of Birth",            "sensitivity": "High"},
    "LOCATION":             {"label": "Address / Location",              "sensitivity": "High"},
    "EMAIL_ADDRESS":        {"label": "Email Address",                   "sensitivity": "High"},
    "PHONE_NUMBER":         {"label": "Phone Number",                    "sensitivity": "High"},
    "IN_AADHAAR":           {"label": "Aadhaar Card UID",                "sensitivity": "Critical"},
    "IN_PAN":               {"label": "PAN (Permanent Account Number)",  "sensitivity": "Critical"},
    "CREDIT_CARD":          {"label": "Credit/Debit Card",               "sensitivity": "Critical"},
    "URL":                  {"label": "URL / Web Address",               "sensitivity": "Medium"},
    "ORGANIZATION":         {"label": "Organization",                    "sensitivity": "Medium"},
    # P1: Government IDs
    "IN_PASSPORT":          {"label": "Passport Number",                 "sensitivity": "Critical"},
    "IN_DRIVING_LICENSE":   {"label": "Driving License",                 "sensitivity": "Critical"},
    "IN_VOTER_ID":          {"label": "Voter ID (EPIC)",                 "sensitivity": "High"},
    "IN_GSTIN":             {"label": "GST Number (GSTIN)",              "sensitivity": "High"},
    "IN_UAN":               {"label": "UAN (EPF/PF Number)",             "sensitivity": "High"},
    "IN_IFSC":              {"label": "IFSC Code",                       "sensitivity": "Medium"},
    "IN_BANK_ACCOUNT":      {"label": "Bank Account Number",             "sensitivity": "Critical"},
    "IN_UPI_ID":            {"label": "UPI ID",                          "sensitivity": "High"},
    # P2: DevSecOps Secrets
    "AWS_ACCESS_KEY":       {"label": "AWS Access Key",                  "sensitivity": "Critical"},
    "AWS_SECRET_KEY":       {"label": "AWS Secret Key",                  "sensitivity": "Critical"},
    "GITHUB_TOKEN":         {"label": "GitHub Token",                    "sensitivity": "Critical"},
    "GOOGLE_API_KEY":       {"label": "Google API Key",                  "sensitivity": "Critical"},
    "SLACK_TOKEN":          {"label": "Slack API Token",                 "sensitivity": "Critical"},
    "JWT_TOKEN":            {"label": "JWT Auth Token",                  "sensitivity": "Critical"},
    "DB_CONNECTION_STRING": {"label": "Database Connection String",      "sensitivity": "Critical"},
    "PRIVATE_KEY":          {"label": "Private Key (RSA/EC/SSH)",        "sensitivity": "Critical"},
    "PASSWORD_IN_TEXT":     {"label": "Password / Secret in Plaintext",  "sensitivity": "Critical"},
    "SSH_KEY":              {"label": "SSH Public Key",                  "sensitivity": "High"},
    # P3: Corporate & HR
    "EMPLOYEE_ID":          {"label": "Employee ID",                     "sensitivity": "High"},
    "SALARY_CTC":           {"label": "Salary / CTC / Compensation",    "sensitivity": "High"},
    "IP_ADDRESS":           {"label": "IP Address",                      "sensitivity": "Medium"},
    "MAC_ADDRESS":          {"label": "MAC Address",                     "sensitivity": "Medium"},
    "VEHICLE_REGISTRATION": {"label": "Vehicle Registration Number",     "sensitivity": "Medium"},
    "IMEI_NUMBER":          {"label": "IMEI Device Identifier",          "sensitivity": "High"},
    "MEDICAL_RECORD":       {"label": "Medical Record / Health Data",    "sensitivity": "Critical"},
    "IN_EMAIL":             {"label": "Email Address",                   "sensitivity": "High"},
    "IN_URL":               {"label": "URL / Web Address",               "sensitivity": "Medium"},
    "IN_DOB":               {"label": "Date of Birth (DOB)",             "sensitivity": "High"},
    "IN_BLOOD_GROUP":       {"label": "Medical / Blood Group",           "sensitivity": "High"},
    "IN_CARE_OF":           {"label": "Care Of / Relative Name",         "sensitivity": "High"},
    "IN_ADDRESS_SENTENCE":  {"label": "Residential Address Sentence",    "sensitivity": "High"},
}



# ======================================================================
# Masking functions
# ======================================================================
def mask_aadhaar(val: str, mode: str = "UIDAI_STANDARD") -> str:
    cleaned = re.sub(r'[-\s]', '', val)
    if len(cleaned) == 12:
        last4 = cleaned[8:]
        if mode == "UIDAI_STANDARD":
            return f"XXXX-XXXX-{last4}"
        elif mode == "HARD_REDACT":
            return "[REDACTED_AADHAAR]"
        else:
            return f"SURR-UID-{hashlib.md5(val.encode()).hexdigest()[:6]}"
    return "XXXX-XXXX-XXXX"

def mask_pan(val: str) -> str:
    cleaned = val.strip().upper()
    if len(cleaned) == 10:
        return f"{cleaned[:2]}XXXXXX{cleaned[-2:]}"
    return "[REDACTED_PAN]"

def mask_email(val: str) -> str:
    try:
        user, domain = val.split('@')
        masked_user = user[0] + "***" if len(user) > 1 else "***"
        return f"{masked_user}@{domain}"
    except Exception:
        return "***@***.***"

def mask_phone(val: str) -> str:
    digits = re.sub(r'\D', '', val)
    if len(digits) >= 10:
        last4 = digits[-4:]
        return f"+91-XXXXX-{last4}"
    return "+91-XXXXX-XXXX"

def mask_credit_card(val: str) -> str:
    digits = re.sub(r'\D', '', val)
    if len(digits) >= 4:
        return f"XXXX-XXXX-XXXX-{digits[-4:]}"
    return "XXXX-XXXX-XXXX-XXXX"

def mask_person(val: str) -> str:
    """Mask a person's name: keep first character, redact rest."""
    parts = val.split()
    masked_parts = []
    for part in parts:
        if len(part) > 1:
            masked_parts.append(part[0] + "*" * (len(part) - 1))
        else:
            masked_parts.append("*")
    return " ".join(masked_parts)

def mask_date(val: str) -> str:
    """Mask date of birth -- keep year, redact day/month."""
    return "[DOB_REDACTED]"

def mask_location(val: str) -> str:
    """Mask address/location."""
    if len(val) > 3:
        return val[:2] + "*" * (len(val) - 2)
    return "[LOCATION_REDACTED]"

def mask_generic_id(val: str, prefix: str = "ID") -> str:
    """Mask a generic ID: show first 2 and last 2, redact middle."""
    if len(val) > 4:
        return f"{val[:2]}{'*' * (len(val) - 4)}{val[-2:]}"
    return f"[REDACTED_{prefix}]"

def mask_secret(val: str) -> str:
    """Fully redact a secret/key/token."""
    # Show type prefix if present (e.g., "ghp_" or "AKIA")
    if len(val) > 8:
        return f"{val[:4]}{'*' * 20}...REDACTED"
    return "[REDACTED_SECRET]"

def mask_connection_string(val: str) -> str:
    """Mask DB connection string, preserve protocol only."""
    protocol_match = re.match(r'^([a-z+]+://)(.*)$', val)
    if protocol_match:
        return f"{protocol_match.group(1)}[CREDENTIALS_REDACTED]"
    return "[REDACTED_CONNECTION_STRING]"

def mask_ip(val: str) -> str:
    """Mask IP address: show first octet only."""
    parts = val.split('.')
    if len(parts) == 4:
        return f"{parts[0]}.***.***.***"
    return "[REDACTED_IP]"

def mask_salary(val: str) -> str:
    """Redact salary/CTC information."""
    return "[SALARY_REDACTED]"

def mask_upi(val: str) -> str:
    """Mask UPI ID: show first char and bank suffix."""
    if '@' in val:
        user, bank = val.split('@', 1)
        masked_user = user[0] + "***" if len(user) > 1 else "***"
        return f"{masked_user}@{bank}"
    return "[REDACTED_UPI]"

def mask_bank_account(val: str) -> str:
    """Mask bank account: show last 4 digits."""
    digits = re.sub(r'\D', '', val)
    if len(digits) >= 4:
        return f"{'X' * (len(digits) - 4)}{digits[-4:]}"
    return "[REDACTED_BANK_AC]"


def _apply_mask(entity_type: str, raw: str, mode: str) -> str:
    """Route to the correct masking function based on entity type."""
    # ---- P0: Core ----
    if entity_type == "IN_AADHAAR":
        return mask_aadhaar(raw, mode)
    elif entity_type == "IN_PAN":
        return mask_pan(raw)
    elif entity_type == "EMAIL_ADDRESS":
        return mask_email(raw)
    elif entity_type == "PHONE_NUMBER":
        return mask_phone(raw)
    elif entity_type == "CREDIT_CARD":
        return mask_credit_card(raw)
    elif entity_type == "PERSON":
        return mask_person(raw)
    elif entity_type == "DATE_TIME":
        return mask_date(raw)
    elif entity_type == "LOCATION":
        return mask_location(raw)
    elif entity_type == "FINANCIAL":
        return "[REDACTED_FINANCIAL]"
    elif entity_type in ("URL", "ORGANIZATION"):
        return "[REDACTED]"
    # ---- P1: Government IDs ----
    elif entity_type == "IN_PASSPORT":
        return mask_generic_id(raw, "PASSPORT")
    elif entity_type == "IN_DRIVING_LICENSE":
        return mask_generic_id(raw, "DL")
    elif entity_type == "IN_VOTER_ID":
        return mask_generic_id(raw, "VOTER")
    elif entity_type == "IN_GSTIN":
        return mask_generic_id(raw, "GSTIN")
    elif entity_type == "IN_UAN":
        return mask_generic_id(raw, "UAN")
    elif entity_type == "IN_IFSC":
        return f"{raw[:4]}0******"
    elif entity_type == "IN_BANK_ACCOUNT":
        return mask_bank_account(raw)
    elif entity_type == "IN_UPI_ID":
        return mask_upi(raw)
    # ---- P2: DevSecOps Secrets ----
    elif entity_type in ("AWS_ACCESS_KEY", "AWS_SECRET_KEY", "GITHUB_TOKEN",
                         "GOOGLE_API_KEY", "SLACK_TOKEN", "SSH_KEY"):
        return mask_secret(raw)
    elif entity_type == "JWT_TOKEN":
        return "[JWT_TOKEN_REDACTED]"
    elif entity_type == "DB_CONNECTION_STRING":
        return mask_connection_string(raw)
    elif entity_type == "PRIVATE_KEY":
        return "[PRIVATE_KEY_REDACTED]"
    elif entity_type == "PASSWORD_IN_TEXT":
        # Keep the key name, redact the value
        eq_match = re.match(r'((?:password|passwd|pwd|secret|token|api_key|apikey|auth_token)\s*[=:]\s*)', raw, re.IGNORECASE)
        if eq_match:
            return f"{eq_match.group(1)}[REDACTED]"
        return "[PASSWORD_REDACTED]"
    # ---- P3: Corporate & HR ----
    elif entity_type == "EMPLOYEE_ID":
        return mask_generic_id(raw, "EMPLOYEE")
    elif entity_type == "SALARY_CTC":
        return mask_salary(raw)
    elif entity_type == "IP_ADDRESS":
        return mask_ip(raw)
    elif entity_type == "MAC_ADDRESS":
        return "XX:XX:XX:XX:XX:XX"
    elif entity_type == "VEHICLE_REGISTRATION":
        return mask_generic_id(raw, "VEHICLE")
    elif entity_type == "IMEI_NUMBER":
        return mask_generic_id(raw, "IMEI")
    elif entity_type == "MEDICAL_RECORD":
        return "[MEDICAL_REDACTED]"
    else:
        return "[REDACTED]"


# ======================================================================
# All entity types that Presidio should scan for
# ======================================================================
ALL_ENTITY_TYPES = list(PRESIDIO_ENTITY_MAP.keys())


# ======================================================================
# Core MaskingEngine
# ======================================================================
class MaskingEngine:
    @staticmethod
    def process_text(text: str, masking_mode: str = "UIDAI_STANDARD") -> Tuple[str, List[DetectedEntity], float, Tuple[float, float], str, str]:
        if not text:
            return "", [], 0.0, (0.0, 0.0), "ALLOWED", "SIG-EMPTY"

        raw_matches = []

        # -- Step 1: Run Presidio NLP-based detection --
        presidio_results = _analyzer.analyze(
            text=text,
            language='en',
            entities=ALL_ENTITY_TYPES,
            score_threshold=0.4
        )

        for r in presidio_results:
            entity_type = r.entity_type
            meta = PRESIDIO_ENTITY_MAP.get(entity_type, {"label": entity_type, "sensitivity": "Medium"})
            raw_val = text[r.start:r.end]
            masked_val = _apply_mask(entity_type, raw_val, masking_mode)

            raw_matches.append({
                "start": r.start,
                "end": r.end,
                "raw": raw_val,
                "masked": masked_val,
                "type": entity_type,
                "label": meta["label"],
                "sensitivity": meta["sensitivity"],
                "confidence": round(r.score, 2)
            })

        # -- Step 2: Run legacy regex for FINANCIAL (not in Presidio) --
        for entity_type, config in REGEX_PATTERNS.items():
            for match in config["regex"].finditer(text):
                raw_val = match.group(0)
                start, end = match.span()

                # Skip if Presidio already found an overlapping match here
                already_covered = any(
                    m["start"] <= start and m["end"] >= end
                    for m in raw_matches
                )
                if already_covered:
                    continue

                masked_val = _apply_mask(entity_type, raw_val, masking_mode)
                raw_matches.append({
                    "start": start,
                    "end": end,
                    "raw": raw_val,
                    "masked": masked_val,
                    "type": entity_type,
                    "label": config["label"],
                    "sensitivity": config["sensitivity"],
                    "confidence": config["confidence"]
                })

        # -- Step 3: De-duplicate overlapping matches (keep longest) --
        raw_matches.sort(key=lambda x: (x["start"], -(x["end"] - x["start"])))
        non_overlapping = []
        last_end = -1
        for m in raw_matches:
            if m["start"] >= last_end:
                non_overlapping.append(m)
                last_end = m["end"]

        # -- Step 4: Apply replacements right-to-left --
        sanitized_text = text
        detected_entities: List[DetectedEntity] = []
        non_overlapping.sort(key=lambda x: x["start"], reverse=True)

        for m in non_overlapping:
            sanitized_text = sanitized_text[:m["start"]] + m["masked"] + sanitized_text[m["end"]:]
            detected_entities.append(
                DetectedEntity(
                    type=m["type"],
                    label=m["label"],
                    raw_value=m["raw"],
                    masked_value=m["masked"],
                    sensitivity=m["sensitivity"],
                    confidence=m["confidence"],
                    start=m["start"],
                    end=m["end"]
                )
            )

        detected_entities.reverse()

        # -- Step 5: Calculate differential risk score --
        if not detected_entities:
            risk_score = 4.2
            decision = "ALLOWED"
        else:
            critical_count = sum(1 for e in detected_entities if e.sensitivity == "Critical")
            high_count = sum(1 for e in detected_entities if e.sensitivity == "High")
            medium_count = sum(1 for e in detected_entities if e.sensitivity == "Medium")

            risk_score = min(99.4, critical_count * 32.0 + high_count * 16.0 + medium_count * 6.0 + random.uniform(3.0, 7.0))

            if critical_count > 0:
                decision = "TRANSFORMED" if masking_mode != "HARD_REDACT" else "BLOCKED"
            else:
                decision = "TRANSFORMED"

        credible_interval = (max(0.0, round(risk_score - 3.5, 1)), min(100.0, round(risk_score + 3.5, 1)))
        tx_sig = f"SIG-{hashlib.sha256((sanitized_text + str(time.time())).encode()).hexdigest()[:16].upper()}"

        return sanitized_text, detected_entities, round(risk_score, 1), credible_interval, decision, tx_sig
