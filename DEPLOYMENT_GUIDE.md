# MOUNAM Deployment Guide

## Overview

MOUNAM is a full-stack assistive communication platform:

- **Frontend**: React 18 + Vite + Tailwind CSS (served as static files or via CDN)
- **Backend**: Python 3.11+ FastAPI application
- **Database**: Firebase Firestore (optional — platform degrades gracefully without it)
- **AI**: Google Gemini API (optional — backend shows clear offline status if unconfigured)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend build |
| npm | 9+ | Package management |
| Python | 3.11+ | Backend runtime |
| pip | 23+ | Python package management |

---

## Environment Variables

### Frontend (`frontend/.env`)

> [!IMPORTANT]
> Never commit real credentials. All `VITE_*` variables are exposed in the browser bundle. Copy `frontend/.env.example` as a starting point.

```env
# Backend API base URL — no trailing slash
VITE_API_URL=http://localhost:8000

# Firebase (optional — app works without Firebase)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (`backend/.env`)

```env
# Google Gemini AI (optional — AI endpoints return clear error if missing)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT=30

# Firebase Admin SDK (optional — required only for server-side auth verification)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

---

## Local Development

### Frontend

```bash
cd mounam/frontend
npm install
cp .env.example .env        # fill in values
npm run dev                  # starts at http://localhost:5173
```

### Backend

```bash
cd mounam/backend
python3 -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # fill in values
uvicorn app.main:app --reload --port 8000
```

---

## Production Build

### Frontend

```bash
cd mounam/frontend
npm run build
# Output: frontend/dist/  — deploy these static files
```

### Backend

```bash
cd mounam/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Deployment Options

### Option A — Static Frontend + Cloud Backend (Recommended)

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend | Vercel / Netlify / Firebase Hosting | Deploy `frontend/dist/` |
| Backend | Google Cloud Run / Railway / Render | Containerise with Dockerfile below |
| Database | Firebase Firestore | Enable in Firebase Console |

**Minimal Dockerfile for backend:**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Option B — Self-Hosted (VPS/Server)

1. Build frontend: `npm run build` → serve `dist/` via nginx or Caddy
2. Run backend via `uvicorn` behind a reverse proxy (nginx/Caddy)
3. Configure SSL/TLS via Let's Encrypt (Certbot or Caddy auto-TLS)

---

## Firebase Setup (Optional)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password provider
3. Create a **Firestore** database in production mode
4. Set **Security Rules** from the project's `firestore.rules` file
5. Register a Web App → copy config values to `frontend/.env`
6. For backend: generate a service account key → paste into `backend/.env`

---

## Health Check

```bash
# Backend health
curl http://localhost:8000/api/health

# AI status (shows graceful degradation if key missing)
curl http://localhost:8000/api/ai/status
```

---

## Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| MediaPipe requires WebAssembly | Gesture recognition unavailable on old browsers | Graceful fallback message shown |
| Web Speech API varies by browser | TTS/STT quality differs | Chrome recommended; fallback text input always available |
| ISL sign videos not bundled | Voice-to-Sign shows verified metadata only | Integrate ISLRTC video library when licensed |
| Gemini AI requires API key | AI sentence generation offline | Clear setup message shown; manual editing always works |
| Firebase optional | Cloud sync, multi-device not available | Full local-only functionality preserved |

---

## Performance Notes

- **Bundle**: ~646 kB JS (Lucide + MediaPipe). Split into 4 chunks via `vite.config.ts` manual chunks: `mediapipe`, `lucide`, `firebase`, `vendor`.
- **MediaPipe WASM**: Downloaded on first gesture camera use — ~8 MB. Cached by browser thereafter.
- **Local-first**: All personalization, vocabulary, gesture mappings, accessibility settings use `localStorage` — zero network latency for most features.

---

*Last updated: Phase 12 — MOUNAM Production Readiness*
