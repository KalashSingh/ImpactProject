# 🛡️ SentinelX — Smart Anti-Theft Device Security System

<div align="center">

![SentinelX Banner](https://img.shields.io/badge/SentinelX-v1.0.0-00d4ff?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-30-47848F?style=for-the-badge&logo=electron&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A smart anti-theft cybersecurity prototype that detects unauthorized access, captures intruder images, encrypts sensitive data, and enables remote device lockdown.**

*Final Year B.Tech CSE — Cybersecurity Project Prototype*

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technologies Used](#-technologies-used)
4. [Architecture](#-architecture)
5. [Folder Structure](#-folder-structure)
6. [Installation Guide](#-installation-guide)
7. [Running the Project](#-running-the-project)
8. [Demo Workflow](#-demo-workflow)
9. [API Routes](#-api-routes)
10. [Future Improvements](#-future-improvements)
11. [Screenshots](#-screenshots)
12. [Security Disclaimer](#-security-disclaimer)
13. [Authors](#-authors)

---

## 🔍 Project Overview

**SentinelX** is a desktop-based anti-theft security system prototype designed to protect sensitive data on laptops and personal devices. Instead of physically destroying the device when theft or tampering is detected, SentinelX:

- **Detects** unauthorized access through failed login attempts
- **Captures** intruder photos using the webcam (via OpenCV)
- **Tracks** the device location using IP geolocation
- **Encrypts** sensitive files using AES-128 (Fernet)
- **Remotely locks** the device interface
- **Securely wipes** demo sensitive files using 3-pass overwrite

The system is built as a cross-platform desktop application using **Electron** (for the desktop shell), **React** (for the UI), and **FastAPI + Python** (for the security backend).

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Login with Intrusion Detection** | 3 failed attempts trigger webcam capture + alert |
| 📸 **Intruder Image Capture** | Uses OpenCV to photograph unauthorized users |
| 📊 **Security Dashboard** | Real-time threat monitoring and event logs |
| 🔒 **Remote Device Lock** | Full-screen lockdown overlay with warning message |
| 🔑 **AES File Encryption** | Encrypt/decrypt files using Fernet (AES-128) |
| 🗑️ **Secure File Wipe** | 3-pass random overwrite before deletion |
| 🌍 **IP Geolocation Tracking** | Displays IP, city, country, ISP in real time |
| 📋 **Intrusion Logs** | Full event log with timestamps and image links |
| 🖥️ **Desktop App** | Electron wrapper for native desktop experience |

---

## 🛠️ Technologies Used

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.3.1 | UI framework |
| Tailwind CSS | 3.x | Styling and theming |
| Axios | 1.6.8 | API communication |
| Lucide React | 0.383.0 | Icons |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Backend language |
| FastAPI | 0.111.0 | REST API server |
| Uvicorn | 0.29.0 | ASGI web server |
| OpenCV | 4.9.0 | Webcam capture |
| Cryptography | 42.0.5 | AES encryption (Fernet) |
| Requests | 2.31.0 | HTTP / IP geolocation |

### Desktop
| Technology | Version | Purpose |
|---|---|---|
| Electron.js | 30.0.1 | Desktop app wrapper |
| Electron Builder | 24.x | App packaging |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON SHELL                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │              REACT FRONTEND (Port 3000)           │   │
│  │                                                   │   │
│  │  LoginScreen → Dashboard → LockScreen             │   │
│  │  ┌──────────┐ ┌────────┐ ┌──────────┐            │   │
│  │  │  Login   │ │ Status │ │   Logs   │            │   │
│  │  │  Screen  │ │ Cards  │ │  Images  │            │   │
│  │  └──────────┘ └────────┘ └──────────┘            │   │
│  └───────────────────┬───────────────────────────────┘   │
│                      │ HTTP/REST API (Axios)              │
│  ┌───────────────────▼───────────────────────────────┐   │
│  │           FASTAPI BACKEND (Port 8000)             │   │
│  │                                                   │   │
│  │  /api/login    → webcam.py (OpenCV capture)       │   │
│  │  /api/encrypt  → encryption.py (Fernet AES)       │   │
│  │  /api/wipe     → wipe.py (3-pass overwrite)       │   │
│  │  /api/location → tracker.py (ipapi.co)            │   │
│  │  /api/logs     → logs/intrusion_log.json          │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  FILE SYSTEM:                                             │
│  ├── intruder_images/     (captured photos)              │
│  ├── demo_sensitive_files/ (AES encrypted/wiped)         │
│  └── backend/logs/        (JSON event log)               │
└─────────────────────────────────────────────────────────┘
```

**Flow summary:**
1. User opens app (Electron loads React UI)
2. Login screen checks password via FastAPI
3. 3 failed attempts → OpenCV captures webcam image → saved to `intruder_images/`
4. Dashboard shows real-time status, logs, images, location
5. Control buttons trigger encrypt / wipe / lock via API
6. Lock button → React overlays a full-screen lock screen

---

## 📁 Folder Structure

```
SentinelX/
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # FastAPI app, all API routes
│   ├── webcam.py               # OpenCV webcam capture
│   ├── encryption.py           # AES-128 Fernet encrypt/decrypt
│   ├── tracker.py              # IP geolocation (ipapi.co)
│   ├── wipe.py                 # 3-pass secure file wipe
│   ├── sentinel.key            # Generated encryption key (auto-created)
│   └── logs/
│       └── intrusion_log.json  # All security events (auto-created)
│
├── frontend/                   # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js            # Entry point
│   │   ├── index.css           # Global styles + Tailwind
│   │   ├── api.js              # Axios API service layer
│   │   └── components/
│   │       ├── LoginScreen.jsx # Login + intrusion detection UI
│   │       ├── Dashboard.jsx   # Main security dashboard
│   │       └── LockScreen.jsx  # Remote lock overlay
│   ├── package.json
│   └── tailwind.config.js
│
├── electron/                   # Electron desktop wrapper
│   ├── main.js                 # Main process (window + backend spawning)
│   └── preload.js              # Secure context bridge
│
├── intruder_images/            # Captured intruder photos (auto-created)
│
├── demo_sensitive_files/       # Demo files for encrypt/wipe demo
│   ├── employee_records.txt
│   ├── financial_data.txt
│   └── access_credentials.txt
│
├── package.json                # Root (Electron) package.json
├── requirements.txt            # Python dependencies
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|---|---|---|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| Git | Any | https://git-scm.com |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/SentinelX.git
cd SentinelX
```

---

### Step 2 — Set Up Python Backend

```bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

> **Note on OpenCV:** If `opencv-python` fails, try `pip install opencv-python-headless`

---

### Step 3 — Set Up React Frontend

```bash
cd frontend
npm install
cd ..
```

---

### Step 4 — Set Up Electron

```bash
# In the root SentinelX directory:
npm install
```

---

## ▶️ Running the Project

### Option A — Run Frontend + Backend Separately (Recommended for Development)

**Terminal 1 — Start the Python backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Terminal 2 — Start the React frontend:**
```bash
cd frontend
npm start
```

React will open at `http://localhost:3000`

---

### Option B — Run as Electron Desktop App

```bash
# Terminal 1: Start backend
cd backend && uvicorn main:app --port 8000

# Terminal 2: Start Electron (it will start React automatically)
npm run electron-dev
```

---

### Option C — Browser Only (No Electron)

Just run the backend and frontend separately and open `http://localhost:3000` in your browser.

---

## 🎬 Demo Workflow

Follow these steps to demonstrate the full project:

### 1. Launch Application
- Start backend + frontend
- You'll see the SentinelX login screen with boot animation

### 2. Demonstrate Intrusion Detection
- Enter any **wrong password** 3 times: `wrongpass1`, `wrongpass2`, `wrongpass3`
- On the 3rd attempt:
  - Webcam captures intruder photo
  - Red alert banner appears: "INTRUSION DETECTED"
  - Image saved to `intruder_images/`

### 3. Login Successfully
- Enter correct password: **`sentinel123`**
- Dashboard loads with threat level, stats, location

### 4. View Intruder Images
- Click **"Images"** tab
- Captured intruder photos are displayed

### 5. Encrypt Sensitive Files
- Go to **Overview** tab
- Click **"ENCRYPT"** button
- Files in `demo_sensitive_files/` are AES-encrypted (`.enc` extension added)
- Verify: check the folder — original `.txt` files are now `.txt.enc`

### 6. Decrypt Files
- Click **"DECRYPT"** button
- Files restored to original

### 7. Remote Lock Device
- Click **"LOCK DEVICE"** button
- Full-screen red lock overlay appears with warning message
- Enter `sentinel123` to unlock

### 8. Secure File Wipe
- Click **"WIPE FILES"** button (requires confirmation)
- Files are overwritten 3 times then deleted
- Verify: `demo_sensitive_files/` is now empty

### 9. View Logs
- Click **"Logs"** tab
- All events are displayed with timestamps

---

## 🔌 API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/login` | Login attempt (triggers capture on 3rd fail) |
| `GET` | `/api/status` | Device security status |
| `POST` | `/api/lock` | Lock the device |
| `POST` | `/api/unlock` | Unlock the device |
| `POST` | `/api/encrypt` | Encrypt demo sensitive files |
| `POST` | `/api/decrypt` | Decrypt demo sensitive files |
| `POST` | `/api/wipe` | Securely wipe demo files |
| `GET` | `/api/location` | IP geolocation data |
| `GET` | `/api/logs` | All intrusion logs |
| `GET` | `/api/images` | List of captured intruder images |
| `DELETE` | `/api/logs/clear` | Clear all logs |

### Interactive API Docs
FastAPI auto-generates interactive docs. With backend running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🔮 Future Improvements

| Feature | Description |
|---|---|
| 📧 Email Alerts | Send intruder photo to owner's email via SMTP |
| 📱 Mobile Companion | React Native app for remote control |
| 🗺️ Map Visualization | Show device location on interactive map |
| 🤖 Face Recognition | OpenCV face detection on intruder images |
| ☁️ Cloud Sync | Sync logs and images to Firebase/AWS S3 |
| 🔊 Audio Alert | Play alarm sound on intrusion detection |
| 📦 Auto-start | Run on system startup using OS services |
| 🔐 Multi-user | Support multiple user accounts |
| 🧬 Keystroke Logger | Detect suspicious typing patterns |
| 💻 OS-level Lock | Integrate with Windows/macOS lock APIs |

---

## 📸 Screenshots

> Replace with actual screenshots after running the application.

| Screen | Description |
|---|---|
| `screenshots/login.png` | Login screen with boot animation |
| `screenshots/intrusion.png` | Intrusion alert after 3 failed attempts |
| `screenshots/dashboard.png` | Main security dashboard |
| `screenshots/lockscreen.png` | Remote lock overlay |
| `screenshots/images.png` | Captured intruder images tab |
| `screenshots/logs.png` | Security event logs |

---

## ⚠️ Security Disclaimer

> **IMPORTANT — PLEASE READ**

This project is a **prototype/demo for academic purposes only**. It is **NOT production-ready** and should **NOT be used for actual security**:

- The encryption key (`sentinel.key`) is stored locally unprotected
- The demo password (`sentinel123`) is hardcoded
- No OS-level security is implemented
- The "secure wipe" is not cryptographically certified
- No network security (HTTPS, tokens) is implemented

This prototype is designed to **demonstrate concepts** for a B.Tech final year project presentation. It simulates how a real anti-theft system would behave.

**Do not use this on real sensitive data.**

---

## 👨‍💻 Authors

**SentinelX Team — Final Year B.Tech CSE**

| Name | Role |
|---|---|
| [Your Name] | Full Stack Developer, System Architecture |
| [Teammate 2] | Backend Developer, Encryption Module |
| [Teammate 3] | Frontend Developer, UI/UX Design |

---

**Institution:** [Your College Name]  
**Department:** Computer Science & Engineering  
**Academic Year:** 2023–24  
**Project Guide:** [Professor Name]

---

<div align="center">

Made with ❤️ and ☕ for the B.Tech Final Year Cybersecurity Project

⭐ **Star this repo if it helped you!** ⭐

</div>
