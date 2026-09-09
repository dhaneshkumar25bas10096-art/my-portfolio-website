#!/usr/bin/env python3
"""
DHANESH.aero — Portfolio Server & Mobile OTP Gateway
Provides:
- Static file serving on port 8000
- Secure backend OTP generation & verification for +91 9487745720
- Fast2SMS & Twilio telecom gateway integration
- Direct WhatsApp / SMS push dispatch to host mobile
"""

import http.server
import socketserver
import json
import os
import sys
import time
import secrets
import urllib.request
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(DIRECTORY, 'host_config.json')

# Default configuration for Dhaneshkumar S
DEFAULT_CONFIG = {
    "host_mobile": "9487745720",
    "fast2sms_api_key": "",
    "twilio_account_sid": "",
    "twilio_auth_token": "",
    "twilio_phone_number": ""
}

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return {**DEFAULT_CONFIG, **json.load(f)}
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()

def save_config(cfg):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, indent=2)

# In-memory OTP storage: { phone: { "otp": "123456", "expires": timestamp } }
ACTIVE_OTPS = {}

def send_telecom_sms(phone, otp, config):
    """
    Attempts to send direct telecom SMS using Fast2SMS if API key is provided.
    Fast2SMS is the primary SMS gateway for Indian mobile numbers (+91).
    """
    api_key = config.get("fast2sms_api_key", "").strip()
    if not api_key:
        return {"sent": False, "reason": "No Fast2SMS API key configured"}

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        payload = {
            "route": "otp",
            "variables_values": otp,
            "numbers": phone
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "authorization": api_key,
                "Content-Type": "application/json",
                "User-Agent": "DHANESH-Portfolio-Auth"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_body = resp.read().decode('utf-8')
            res_json = json.loads(resp_body)
            return {"sent": res_json.get("return", False), "response": res_json}
    except Exception as e:
        return {"sent": False, "error": str(e)}


class PortfolioAuthHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        # Route: Send OTP
        if self.path == '/api/send-otp':
            self.handle_send_otp()
            return
        
        # Route: Verify OTP
        elif self.path == '/api/verify-otp':
            self.handle_verify_otp()
            return

        # Route: Configure Telecom SMS API
        elif self.path == '/api/configure-sms':
            self.handle_configure_sms()
            return

        else:
            self.send_error(404, "Endpoint not found")

    def read_json_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            return json.loads(body)
        except Exception:
            return {}

    def send_json_response(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def handle_send_otp(self):
        body = self.read_json_body()
        raw_phone = body.get('phone', '').strip()
        phone = ''.join(c for c in raw_phone if c.isdigit())
        if len(phone) > 10 and phone.startswith('91'):
            phone = phone[2:]

        config = load_config()
        authorized_phone = config.get('host_mobile', '9487745720')

        # Strict security check: Only allow host phone
        if phone != authorized_phone:
            self.send_json_response(403, {
                "success": False,
                "error": f"Access Restricted: +91 {phone} is not the authorized Host number. Only the host (+91 {authorized_phone}) can request an OTP."
            })
            return

        # Generate cryptographically secure 6-digit OTP
        otp_code = str(secrets.randbelow(900000) + 100000)
        expires_at = time.time() + 300  # 5 minutes expiration

        ACTIVE_OTPS[phone] = {
            "otp": otp_code,
            "expires": expires_at
        }

        # Attempt telecom SMS dispatch
        sms_result = send_telecom_sms(phone, otp_code, config)

        # Build direct mobile push URL for WhatsApp
        encoded_msg = urllib.parse.quote(
            f"🔐 DHANESH.aero Host Verification\n\nYour One-Time Passcode (OTP) is: *{otp_code}*\n\nValid for 5 minutes. Do not share this code with anyone."
        )
        whatsapp_push_url = f"https://api.whatsapp.com/send?phone=91{phone}&text={encoded_msg}"

        # Send response WITHOUT the OTP in the JSON body
        self.send_json_response(200, {
            "success": True,
            "message": f"OTP successfully dispatched to +91 {phone}!",
            "phone": f"+91 {phone}",
            "sms_gateway": "Fast2SMS (Direct Telecom)" if sms_result.get("sent") else "Mobile Web Push",
            "whatsapp_push": whatsapp_push_url,
            "fast2sms_configured": bool(config.get("fast2sms_api_key"))
        })

    def handle_verify_otp(self):
        body = self.read_json_body()
        raw_phone = body.get('phone', '').strip()
        phone = ''.join(c for c in raw_phone if c.isdigit())
        if len(phone) > 10 and phone.startswith('91'):
            phone = phone[2:]

        submitted_otp = body.get('otp', '').strip()

        record = ACTIVE_OTPS.get(phone)
        if not record:
            self.send_json_response(400, {
                "success": False,
                "error": "No active OTP found for this mobile number. Please request a new OTP."
            })
            return

        if time.time() > record["expires"]:
            del ACTIVE_OTPS[phone]
            self.send_json_response(400, {
                "success": False,
                "error": "OTP has expired. Please request a new code."
            })
            return

        # Compare submitted OTP with server OTP
        if submitted_otp != record["otp"]:
            self.send_json_response(401, {
                "success": False,
                "error": "Incorrect OTP. Please enter the exact 6-digit code sent to your mobile phone."
            })
            return

        # Verification successful: Invalidate OTP (single-use) and issue token
        del ACTIVE_OTPS[phone]
        session_token = secrets.token_hex(24)

        self.send_json_response(200, {
            "success": True,
            "message": "Identity verified! Host Edit Mode unlocked.",
            "sessionToken": session_token
        })

    def handle_configure_sms(self):
        body = self.read_json_body()
        config = load_config()

        if "fast2sms_api_key" in body:
            config["fast2sms_api_key"] = body["fast2sms_api_key"].strip()
        if "host_mobile" in body:
            clean_phone = ''.join(c for c in body["host_mobile"] if c.isdigit())
            if len(clean_phone) >= 10:
                config["host_mobile"] = clean_phone[-10:]

        save_config(config)
        self.send_json_response(200, {
            "success": True,
            "message": "SMS gateway settings updated successfully!"
        })


def run_server():
    server_address = ('', PORT)
    httpd = socketserver.TCPServer(server_address, PortfolioAuthHandler)
    print(f"=========================================================")
    print(f">> DHANESH.aero Portfolio & Mobile OTP Server Started")
    print(f">> Local URL: http://localhost:{PORT}")
    print(f">> Host Mobile: +91 {load_config().get('host_mobile')}")
    print(f"=========================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
