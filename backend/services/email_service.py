import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta

# Load .env / .env.local dynamically from project root or current working directory
try:
    from dotenv import load_dotenv
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    load_dotenv(os.path.join(base_dir, ".env.local"))
    load_dotenv(os.path.join(base_dir, ".env"))
    load_dotenv(".env.local")
    load_dotenv(".env")
except ImportError:
    pass

logger = logging.getLogger("EmailAlertService")

class EmailAlertService:
    @staticmethod
    def send_sensitive_data_alert(
        filename: str,
        detected_entities: list,
        risk_score: float,
        transformation_signature: str,
        file_type: str = "Unstructured Document/Text",
        auditor_name: str = None
    ):
        """
        Dispatches a real-time SMTP alert email when sensitive data is detected in uploaded documents.
        Features real-time IST timestamp and responsible auditor (NAGATHARESH).
        """
        recipient_email = os.getenv("ALERT_RECIPIENT_EMAIL", "iatchi375@gmail.com").strip('"\' ')
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip('"\' ')
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587").strip('"\' '))
        except ValueError:
            smtp_port = 587
        smtp_user = os.getenv("SMTP_USER", "nareshkottees@gmail.com").strip('"\' ')
        smtp_password = os.getenv("SMTP_PASSWORD", "").strip('"\' ').replace(" ", "")
        
        # Auditor name defaulting to NAGATHARESH
        person_name = (auditor_name or os.getenv("AUDITOR_NAME", "NAGATHARESH")).strip('"\' ')

        # Current time in IST (UTC + 5:30) and UTC
        utc_now = datetime.now(timezone.utc)
        ist_now = utc_now + timedelta(hours=5, minutes=30)
        formatted_ist_time = ist_now.strftime("%d-%b-%Y %I:%M:%S %p IST")
        formatted_utc_time = utc_now.strftime("%Y-%m-%d %H:%M:%S UTC")

        # Count total items detected
        entity_count = len(detected_entities)
        entity_summary = {}
        for ent in detected_entities:
            # handle dict or pydantic model
            entity_type = ent.get("type") if isinstance(ent, dict) else getattr(ent, "type", "UNKNOWN")
            entity_label = ent.get("label") if isinstance(ent, dict) else getattr(ent, "label", entity_type)
            entity_summary[entity_label] = entity_summary.get(entity_label, 0) + 1

        entity_rows_html = "".join([
            f"<tr><td style='padding:8px 12px; border-bottom:1px solid #e2e8f0;'><b>{k}</b></td><td style='padding:8px 12px; border-bottom:1px solid #e2e8f0; color:#e11d48; font-weight:bold;'>{v} detected</td></tr>"
            for k, v in entity_summary.items()
        ])

        subject = f"🚨 REAL-TIME PRIVACY ALERT: [{filename}] Upload Intercepted by {person_name}"

        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #0f172a;">
            <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
              
              <!-- Header Banner -->
              <div style="background: linear-gradient(135deg, #e11d48 0%, #991b1b 100%); color: #ffffff; padding: 20px 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <h2 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">🚨 SDTT REAL-TIME PRIVACY ALERT</h2>
                </div>
                <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Sensitive Document Upload Intercepted & Masked Prior to Egress</p>
              </div>
              
              <!-- Body Content -->
              <div style="padding: 24px;">
                
                <!-- Notice Banner -->
                <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #9f1239; font-weight: 600;">
                    Real-time Security Trigger: A document uploaded by <b>{person_name}</b> triggered the Presidio + OpenCV privacy protection layer.
                  </p>
                </div>

                <!-- Event Details Table -->
                <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;">📊 Real-time Upload Metadata:</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; background: #f8fafc; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; width: 40%;"><b>Person / Process User</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-weight: bold; font-size: 15px;">{person_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>Exact Event Time (IST)</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #d97706; font-weight: bold;">{formatted_ist_time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>UTC Timestamp</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">{formatted_utc_time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>Uploaded File Name</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: 600;">{filename}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>File Classification</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">{file_type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>Differential Risk Score</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #e11d48; font-weight: bold; font-size: 15px;">{risk_score}% High Risk</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;"><b>Transformation Signature</b></td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #475569; font-size: 13px;">{transformation_signature}</td>
                  </tr>
                </table>

                <!-- Entities Intercepted -->
                <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;">🛡️ Entities Intercepted ({entity_count} Total):</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; background: #ffffff; border: 1px solid #e2e8f0;">
                  <tr style="background-color: #f1f5f9;">
                    <th style="text-align: left; padding: 8px 12px; border-bottom: 2px solid #cbd5e1;">Sensitive Category / Recognizer</th>
                    <th style="text-align: left; padding: 8px 12px; border-bottom: 2px solid #cbd5e1;">Detection Count</th>
                  </tr>
                  {entity_rows_html}
                </table>

                <!-- Action Enforced Footer -->
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; color: #166534; font-size: 14px; line-height: 1.5;">
                  ✅ <b>Automated Governance Action Enforced:</b> All detected sensitive values were masked with dynamic Gaussian blur & safe replacement tokens before leaving the system. Zero raw PII persisted.
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                SDTT Real-Time Privacy Governance Platform & Compliance Monitor • Responsible Auditor: <b>{person_name}</b>
              </div>
            </div>
          </body>
        </html>
        """

        # Log event to backend console always
        print(f"[EMAIL ALERT] Sensitive data in {filename} uploaded by {person_name}! Dispatching alert to {recipient_email} at {formatted_ist_time}...")
        logger.info(f"Triggering SMTP alert for {filename} ({entity_count} entities) -> {recipient_email}")

        # Send via SMTP if credentials provided or test log
        if not smtp_user or not smtp_password:
            print(f"[SMTP NOTICE] SMTP_USER / SMTP_PASSWORD not set in environment. Alert simulation logged for {recipient_email}.")
            return

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = recipient_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, [recipient_email], msg.as_string())
            
            print(f"[SMTP SUCCESS] Alert email sent to {recipient_email} (Auditor: {person_name})")
        except Exception as e:
            print(f"[SMTP ERROR] Failed to dispatch email to {recipient_email}: {str(e)}")
            logger.error(f"Failed to send email alert: {str(e)}")
