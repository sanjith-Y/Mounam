# MOUNAM

> **Tagline:** *Every Voice Deserves to Be Heard.*

**Project Type:** AI-Powered Assistive Communication Platform

---

## 1. Project Overview

**MOUNAM** (meaning *Silence*) is an intelligent assistive communication platform designed for people with speech disabilities, ALS, stroke recovery, cerebral palsy, temporary communication trauma, and elderly individuals who struggle to express their thoughts.

The platform transforms simple touch inputs, contactless hand gestures, and concise keywords into complete, courteous, and articulate spoken sentences across multiple regional languages.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Voice Engine:** Web Speech API (`SpeechSynthesis`)
- **PWA & Offline:** Service Workers, IndexedDB, Web App Manifest (Phases 6-7)

### Backend
- **Framework:** Python FastAPI
- **Web Server:** Uvicorn (ASGI)
- **Validation:** Pydantic v2
- **CORS:** Configured for local frontend development

### Assistive AI & Perception (Phases 4-6)
- **AI Intelligence:** Google Gemini API
- **Gesture Recognition:** MediaPipe Hands via Browser Camera API
- **Database & Auth:** Firebase Authentication & Cloud Firestore

---

## 3. Directory Structure

```
mounam/
├── frontend/
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Illustration.tsx
│   │   │   └── Navbar.tsx
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   └── RootLayout.tsx
│   │   ├── pages/
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── health.py
│   │   ├── services/
│   │   ├── __init__.py
│   │   └── main.py
│   └── requirements.txt
├── README.md
└── .gitignore
```

---

## 4. Getting Started

### Prerequisites
- **Node.js** (v18 or newer recommended, tested on v24)
- **Python** (3.10+ recommended, tested on 3.14)
- **npm** or **pnpm**

---

### Running the Backend (FastAPI)

1. Open a terminal in `mounam/backend`:
   ```bash
   cd mounam/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
4. Verification endpoints:
   - Root: `http://localhost:8000/`
   - Health check: `http://localhost:8000/api/health`
   - Interactive Swagger docs: `http://localhost:8000/docs`

---

### Running the Frontend (React + Vite)

1. Open a terminal in `mounam/frontend`:
   ```bash
   cd mounam/frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web app at:
   ```
   http://localhost:5173
   ```

---

## 5. Supported Pages & Navigation in Step 1

| Route | Page | Purpose |
|---|---|---|
| `/` | **Home** | Hero section with tagline, interactive voice flow illustration, 6 feature cards, 4-step pipeline, and preview CTAs |
| `/features` | **Features** | Comprehensive breakdown of touch tiles, AI expansion, gestures, 6 regional languages, vocabulary, and emergency modes |
| `/how-it-works` | **How It Works** | 4-step interactive pipeline walkthrough, AI safety protocol, and speech synthesis architecture |
| `/about` | **About** | The story of MOUNAM, mission statement, target patient groups, and ethical principles |
| `/contact` | **Contact** | Inquiry form for caregivers, clinics, hospitals, speech therapists, and FAQs |
| `/login` | **Login** | Individual vs Caregiver authentication portal |
| `/register` | **Register** | Account creation with preferred regional language selection |
| `/dashboard` | **Communication Dashboard** | Working communication board with Daily Needs, Health, Emotions, Social, Web Speech playback, and Emergency SOS |

---

## 6. Accessibility & Language Matrix

- **Supported Regional Languages:** English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളம்), and Kannada (ಕನ್ನಡ).
- **Universal Modes:** High contrast colors, large touch targets (WCAG 2.1 AAA), responsive mobile one-handed navigation, screen reader semantic structure.
# Mounam
