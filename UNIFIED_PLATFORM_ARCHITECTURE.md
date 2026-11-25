# MOUNAM — Unified Platform Architecture

**Tagline:** *Every Voice Deserves to Be Heard.*  
**Status:** Phases 1–14 Implemented & Integrated (Pilot Testing Ready — Not Yet Production-Deployed)

---

## 1. Single Entry Point & Routing Architecture

MOUNAM runs as a single React 18 + Vite Single-Page Application (SPA) served from one unified origin, backed by a FastAPI API service.

### Frontend Routes (`frontend/src/App.tsx`)
All routes are wrapped in `<AccessibilityProvider>` → `<AuthProvider>` → `<BrowserRouter>`:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Home` | Public landing page & platform overview |
| `/about`, `/features`, `/how-it-works`, `/contact` | Informational pages | Platform documentation & accessibility mission |
| `/login`, `/register`, `/forgot-password` | Auth pages | Email/password & guest session access |
| `/dashboard` | `Dashboard` | **Unified Platform Hub** hosting all assistive modules |
| `/dashboard?mode=emergency` | `Dashboard` (`emergency` tab) | Direct SOS Emergency Mode entry |
| `/dashboard?tab=<tabId>` | `Dashboard` | Deep-link to any Dashboard module |
| `/communication` | `Communication` | Dedicated Touch Board & Token Sentence Builder |
| `/privacy`, `/terms` | Legal pages | Privacy policy & terms |
| `*` | 404 fallback | Clean recovery link back to `/` |

### SPA Refresh & Single-URL Hosting
- [`frontend/vercel.json`](file:///Users/sanjith/Titans/mounam/frontend/vercel.json) and [`frontend/public/_redirects`](file:///Users/sanjith/Titans/mounam/frontend/public/_redirects) rewrite all paths to `/index.html` so refreshing `/dashboard` or `/communication` in production never returns 404.

---

## 2. Unified Navigation System

### Desktop
- Persistent left sidebar (`Dashboard.tsx`) with 17 unified entries:
  `Dashboard`, `My Communication`, `Voice-to-Text`, `Voice-to-Sign`, `Gesture Camera`, `SOS Emergency`, `Caregiver Portal`, `Accessibility Center`, `Quick Phrases`, `Smart Quick Access`, `My Vocabulary`, `My Favorites`, `Communication History`, `Privacy & Personalization`, `Pilot Feedback`, `Settings`, `Help & Support`.
- Sticky topbar with:
  - `Simple Mode` toggle
  - Shared Language Selector (`en`, `ta`, `hi`, `ml`, `te`, `kn`) synced to `AccessibilityContext`
  - Notifications dropdown
  - Quick Speech & Accessibility Settings modal
  - Authenticated User Profile pill (from `AuthContext`)

### Mobile
- Collapsible slide-out drawer for all 17 modules
- Fixed **Mobile Bottom Navigation Bar** (`Home`, `Phrases`, `Voice`, `Sign`, `SOS`) with ≥48px touch targets for one-handed operation and `pb-24` main content clearance.

---

## 3. Shared Services & State Architecture

| Service / Context | File | Responsibility | Persistence |
|-------------------|------|----------------|-------------|
| `AccessibilityContext` | `frontend/src/context/AccessibilityContext.tsx` | Global text size, high contrast, reduced motion, button size, haptic, `speechRate`, `preferredLanguage` | `localStorage` (`mounam_accessibility_settings`, `mounam_communication_preferences`) |
| `AuthContext` | `frontend/src/context/AuthContext.tsx` | User profile, guest session, login/logout | `localStorage` (`mounam_user_profile`) + optional Firebase Auth |
| `VoiceEngine` | `frontend/src/services/voiceEngine.ts` | Centralized Web Speech API TTS, queue cancellation, regional locale mapping | In-memory |
| `SpeechToTextEngine` | `frontend/src/services/speechToTextEngine.ts` | Web Speech API STT with interim results & permission/error handling | In-memory |
| `HandLandmarkService` | `frontend/src/services/handLandmarkService.ts` | MediaPipe `@mediapipe/tasks-vision` 21-point hand landmark detection | Client-side GPU/WASM |
| `GestureRecognitionService` | `frontend/src/services/gestureRecognitionService.ts` | Geometric classification + 6-frame stability + custom gesture mapping | `localStorage` (`mounam_gesture_mappings`, `mounam_gesture_history`) |
| `SignLanguageEngine` | `frontend/src/services/signLanguageEngine.ts` | Normalized landmark classifier + 20-frame `TemporalSequenceBuffer` | Client-side |
| `VerifiedSignLibraryService` | `frontend/src/services/verifiedSignLibraryService.ts` | Verified ISL/ASL lexical metadata & sentence tokenizer | Static verified dictionary |
| `PersonalizationService` | `frontend/src/services/personalizationService.ts` | Usage-based scoring (`pinned=100`, `favorite=50`, `freq×10`, 7-day decay), history toggle | `localStorage` (`mounam_personalization_data`, `mounam_history_settings`) |
| `PersonalVocabularyService` | `frontend/src/services/personalVocabularyService.ts` | Custom collections & messages CRUD, search, reorder, JSON import/export | `localStorage` (`mounam_personal_vocabulary`) |
| `EmergencyContactService` | `frontend/src/services/emergencyContactService.ts` | Prioritized emergency contacts + `tel:` dialing | `localStorage` (`mounam_emergency_contacts`) |
| `CaregiverService` | `frontend/src/services/caregiverService.ts` | `MN-XXXXXX` expiring linking codes & granular permissions | `localStorage` (`mounam_caregiver_links`) |
| `FeedbackService` | `frontend/src/services/feedbackService.ts` | Pilot usability feedback capture with local queue + backend sync | `localStorage` (`mounam_pilot_feedback`) + `POST /api/feedback` |

---

## 4. Connected End-to-End Communication Workflows

- **Workflow A (Express → Favorites → Smart Quick):** Dashboard card/phrase → Edit sentence → `VoiceEngine.speak()` → `toggleFavorite()` syncs `mounam_favorites` & `personalizationService.setFavorite()` → Ranked in `SmartQuickCommunication`.
- **Workflow B (Voice → Text → AI → Speak):** `VoiceToTextSection` → `SpeechToTextEngine` (synced to shared language) → Editable transcript → Optional Gemini AI (`/api/ai/generate-sentence`) → User-confirmed `VoiceEngine.speak()` → Recorded in `PersonalizationService`.
- **Workflow C (Gesture → Confirm → Speak → History):** `GestureRecognition` → MediaPipe landmarks → Stability filter → Editable confirmation box → `VoiceEngine.speak()` → Saved to both Gesture History & `mounam_history` + `PersonalizationService`.
- **Workflow D & E (Text / Voice → Sign):** `VoiceToSignCommunication` → `SpeechToTextEngine` or typed text → `VerifiedSignLibraryService.matchSentenceToSigns()` → Sequential chip playback with speed & step controls.
- **Workflow F (Emergency Broadcast):** `/dashboard?mode=emergency` or SOS button → `EmergencyMode` → One-tap urgent message → Edit/Copy/`VoiceEngine.speak()` + `tel:` emergency contact dialing.
- **Workflow G (Personal Vocabulary):** `PersonalVocabularyPanel` → Create collection/message → Speak → Increments usage & updates `SmartQuickCommunication`.

---

## 5. Backend API & Firebase Integration

FastAPI app (`backend/app/main.py`) mounts:
- `/api/health` — Health check
- `/api/auth/*` — Auth routes
- `/api/dashboard` — Dashboard metadata
- `/api/communication/*` — Predefined phrases
- `/api/languages/*` — Language options
- `/api/ai/*` — `GET /api/ai/status`, `POST /api/ai/generate-sentence`, `POST /api/ai/translate` (API key strictly server-side; returns HTTP 500/503 if unconfigured — never fabricates responses)
- `/api/feedback` — `POST /api/feedback`, `GET /api/feedback/summary` (Phase 14 pilot feedback)

CORS is configured via `FRONTEND_URL` environment variable plus localhost origins.

---

## 6. Known Limitations

1. **Firebase not configured by default:** Auth, caregiver links, vocabulary, and personalization run local-first in `localStorage`. Cloud sync requires setting `VITE_FIREBASE_*` and deploying `firestore.rules`.
2. **Gemini AI requires `GEMINI_API_KEY`:** Without it (or `google-genai` package), AI endpoints return HTTP 500 cleanly; manual sentence editing and offline TTS continue working.
3. **Sign Language Scope:** `GestureRecognition` supports 6 static candidate gestures and 8 vocabulary signs; `VoiceToSignCommunication` displays verified lexical metadata (no bundled ISLRTC video files yet).
4. **Automated E2E Browser Suite:** No Playwright/Cypress browser runner is installed; frontend verification currently relies on TypeScript compilation (`tsc`), production bundling (`vite build`), and manual testing (`TESTING_PLAN.md`).
