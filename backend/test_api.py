import requests
import json

payload = {
    "text": "Employee Rajesh Sharma (Aadhaar: 8492 1204 9912, PAN: ABCDE1234F) was born on 14/08/1988 and lives at 45 MG Road, Bengaluru, Karnataka. Contact: rajesh.sharma@enterprise.com, Phone: +91 98241 12049.",
    "masking_mode": "UIDAI_STANDARD"
}

r = requests.post("http://127.0.0.1:8000/api/process/text", json=payload)
data = r.json()

print(f"STATUS: {r.status_code}")
print(f"DECISION: {data.get('decision')}")
print(f"RISK SCORE: {data.get('risk_score')}")
print()
print("MASKED TEXT:")
print(data.get("masked_text", ""))
print()
print(f"DETECTED ENTITIES ({len(data.get('detected_entities', []))}):")
print("-" * 110)
for e in data.get("detected_entities", []):
    print(f"  {e['type']:15s} | {e['label']:30s} | {e['sensitivity']:8s} | Raw: {e['raw_value']:25s} -> {e['masked_value']}")
