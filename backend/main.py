"""
SentinelX - Smart Anti-Theft Device Security System
Main FastAPI Backend Server
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os
import datetime
from pathlib import Path
import sys

# Add backend directory to sys.path so local imports work when run from root
sys.path.append(str(Path(__file__).parent))

# Import SentinelX modules
from webcam import capture_intruder_image
from encryption import encrypt_folder, decrypt_folder
from tracker import get_ip_location
from wipe import wipe_demo_files

app = FastAPI(title="SentinelX API", version="1.0.0")

# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve intruder images as static files
INTRUDER_DIR = Path(__file__).parent.parent / "intruder_images"
INTRUDER_DIR.mkdir(exist_ok=True)
app.mount("/intruder_images", StaticFiles(directory=str(INTRUDER_DIR)), name="intruder_images")

# Paths
BASE_DIR = Path(__file__).parent.parent
LOG_FILE = BASE_DIR / "backend" / "logs" / "intrusion_log.json"
LOG_FILE.parent.mkdir(exist_ok=True)

# State
login_attempts = {}
device_locked = False
CORRECT_PASSWORD = "sentinel123"  # Demo password


# ─── Models ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    password: str
    user_id: str = "default"

class StatusResponse(BaseModel):
    locked: bool
    threat_level: str
    message: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_logs():
    """Load intrusion logs from file."""
    if LOG_FILE.exists():
        with open(LOG_FILE, "r") as f:
            return json.load(f)
    return []

def save_log(entry: dict):
    """Append a log entry to the log file."""
    logs = load_logs()
    logs.append(entry)
    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=2)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "SentinelX API running", "version": "1.0.0"}


@app.post("/api/login")
def login(req: LoginRequest):
    """
    Handle login attempt.
    After 3 failed attempts: capture image, log intrusion, raise alert.
    """
    global device_locked
    uid = req.user_id

    if uid not in login_attempts:
        login_attempts[uid] = 0

    if req.password == CORRECT_PASSWORD:
        login_attempts[uid] = 0
        return {"success": True, "message": "Access granted", "attempts": 0}
    else:
        login_attempts[uid] += 1
        attempts = login_attempts[uid]

        log_entry = {
            "type": "FAILED_LOGIN",
            "timestamp": datetime.datetime.now().isoformat(),
            "attempts": attempts,
            "image": None,
        }

        image_path = None
        if attempts >= 3:
            # Capture intruder image
            image_filename = capture_intruder_image()
            log_entry["type"] = "INTRUSION_DETECTED"
            log_entry["image"] = image_filename
            save_log(log_entry)
            login_attempts[uid] = 0  # Reset after capture
            return {
                "success": False,
                "message": "INTRUSION DETECTED — Image captured",
                "attempts": attempts,
                "alert": True,
                "image": image_filename,
            }

        save_log(log_entry)
        return {
            "success": False,
            "message": f"Invalid credentials. Attempt {attempts}/3",
            "attempts": attempts,
            "alert": False,
        }


@app.get("/api/status")
def get_status():
    """Return current device security status."""
    logs = load_logs()
    intrusions = [l for l in logs if l.get("type") == "INTRUSION_DETECTED"]
    threat_level = "HIGH" if len(intrusions) > 0 else "LOW"

    return {
        "locked": device_locked,
        "threat_level": threat_level,
        "total_intrusions": len(intrusions),
        "total_logs": len(logs),
        "message": "Device compromised" if intrusions else "All systems normal",
    }


@app.post("/api/lock")
def lock_device():
    """Remotely lock the device interface."""
    global device_locked
    device_locked = True
    save_log({
        "type": "DEVICE_LOCKED",
        "timestamp": datetime.datetime.now().isoformat(),
    })
    return {"success": True, "message": "Device locked successfully"}


@app.post("/api/unlock")
def unlock_device():
    """Unlock the device."""
    global device_locked
    device_locked = False
    return {"success": True, "message": "Device unlocked"}


@app.post("/api/encrypt")
def encrypt_files():
    """Encrypt all demo sensitive files."""
    try:
        result = encrypt_folder(str(BASE_DIR / "demo_sensitive_files"))
        save_log({
            "type": "FILES_ENCRYPTED",
            "timestamp": datetime.datetime.now().isoformat(),
            "files": result["files"],
        })
        return {"success": True, "message": "Files encrypted successfully", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/decrypt")
def decrypt_files():
    """Decrypt all demo sensitive files."""
    try:
        result = decrypt_folder(str(BASE_DIR / "demo_sensitive_files"))
        save_log({
            "type": "FILES_DECRYPTED",
            "timestamp": datetime.datetime.now().isoformat(),
            "files": result["files"],
        })
        return {"success": True, "message": "Files decrypted successfully", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/wipe")
def wipe_files():
    """Securely wipe all demo sensitive files."""
    try:
        result = wipe_demo_files(str(BASE_DIR / "demo_sensitive_files"))
        save_log({
            "type": "FILES_WIPED",
            "timestamp": datetime.datetime.now().isoformat(),
            "files_wiped": result["wiped"],
        })
        return {"success": True, "message": "Demo files wiped securely", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/location")
def get_location():
    """Get current IP-based geolocation."""
    return get_ip_location()


@app.get("/api/logs")
def get_logs():
    """Return all intrusion logs."""
    return {"logs": load_logs()}


@app.get("/api/images")
def get_images():
    """Return list of captured intruder images."""
    images = []
    if INTRUDER_DIR.exists():
        for f in sorted(INTRUDER_DIR.iterdir()):
            if f.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                images.append({
                    "filename": f.name,
                    "url": f"/intruder_images/{f.name}",
                    "timestamp": datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                })
    return {"images": images}


@app.delete("/api/logs/clear")
def clear_logs():
    """Clear all logs (demo utility)."""
    with open(LOG_FILE, "w") as f:
        json.dump([], f)
    return {"success": True, "message": "Logs cleared"}


@app.post("/api/restore-demo")
def restore_demo_files_endpoint():
    """Re-create demo sensitive files after wipe (for re-demonstration)."""
    from wipe import restore_demo_files
    try:
        result = restore_demo_files(str(BASE_DIR / "demo_sensitive_files"))
        return {"success": True, "message": "Demo files restored", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
