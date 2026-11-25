# MOUNAM Testing Plan

## Overview

This document defines the end-to-end testing strategy for MOUNAM across all 12 phases.

> [!NOTE]
> Tests are categorised as: **Manual** (UI walkthrough), **Automated** (backend pytest), or **Accessibility** (screen reader / keyboard).

---

## Phase 1–2: Foundation & Express Communication Dashboard

### Manual Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1 | Open `http://localhost:5173` | Home page renders without errors | |
| 2 | Navigate to `/dashboard` | Dashboard renders with sidebar | |
| 3 | Click each category tab (Food, Health, Emotions, Daily, People, Emergency) | Phrases filter correctly | |
| 4 | Select 3 phrase tokens, click Speak | Sentence is vocalized | |
| 5 | Edit sentence manually, click Speak | Edited sentence is vocalized | |
| 6 | Click Copy | Clipboard contains sentence text | |
| 7 | Click Star/Favorite | Phrase added to Favorites tab | |
| 8 | Resize window to 375 px width | Layout adjusts, sidebar collapses | |

---

## Phase 3: Voice Engine

| # | Test | Expected Result |
|---|------|-----------------|
| 9 | Select Tamil from language dropdown, click Speak | Tamil voice used (or falls back to available voice) |
| 10 | Adjust Speech Rate to 0.5×, click Speak | Noticeably slower playback |
| 11 | Click Stop mid-speech | Speech stops immediately |
| 12 | Click Speak twice rapidly | No audio overlap — second cancels first |

---

## Phase 4: Authentication

| # | Test | Expected Result |
|---|------|-----------------|
| 13 | Click "Continue as Guest" | Guest session created, dashboard accessible |
| 14 | Register with email (if Firebase configured) | Account created, redirected to dashboard |
| 15 | Log in with wrong password | Error message shown; no crash |
| 16 | Refresh page while logged in | Session persists (localStorage auth) |

---

## Phase 5: Gemini AI Backend

### Automated (pytest)

```bash
cd mounam/backend
python3 -m pytest tests/ -v
```

| # | Test | Expected Result |
|---|------|-----------------|
| 17 | `GET /api/health` | `{"status": "healthy"}` |
| 18 | `GET /api/ai/status` | `{"configured": false/true, "model": "..."}` |
| 19 | `POST /api/ai/generate-sentence` with empty tokens | 422 Validation Error |
| 20 | `POST /api/ai/generate-sentence` with valid tokens, no API key | 500 with descriptive error (never fake content) |
| 21 | `POST /api/ai/generate-sentence` with valid tokens + key | Real sentence returned in selected language |

---

## Phase 6: Voice-to-Text

| # | Test | Expected Result |
|---|------|-----------------|
| 22 | Click microphone button without granting permission | Permission denied error message shown |
| 23 | Speak clearly in English | Live transcription appears |
| 24 | Click Stop | Recognition stops; transcript frozen |
| 25 | Click Copy transcript | Clipboard contains text |
| 26 | Click "Enhance with AI" | AI enhancement panel opens (backend required) |

---

## Phase 7: Gesture Recognition

| # | Test | Expected Result |
|---|------|-----------------|
| 27 | Click "Start Camera" | Browser requests camera permission |
| 28 | Show Open Palm to camera | "Stop / Wait" detected with ≥6-frame stability |
| 29 | Show Thumbs Up | "Yes / Good" detected |
| 30 | Configure custom gesture mapping | Custom message plays when gesture re-detected |
| 31 | Click "Stop Camera" | Camera feed halts; indicator goes inactive |

---

## Phase 8: Sign Language Recognition

| # | Test | Expected Result |
|---|------|-----------------|
| 32 | Switch to "Sign Vocab Engine" mode | Mode activates; vocabulary shown |
| 33 | Show hand to camera in supported sign shape | Sign recognized or "uncertain" shown (never fake claim) |
| 34 | Accumulate 3+ signs, click "Polish with AI" | Natural sentence generated |
| 35 | Open "Data Collection" tab, enable consent | Landmark recording starts on gesture |

---

## Phase 9: Voice-to-Sign

| # | Test | Expected Result |
|---|------|-----------------|
| 36 | Type "I need water" in text input | Word chips appear: I / need / water |
| 37 | Click Play | Chips step through with timing delay |
| 38 | Click Pause | Steps freeze |
| 39 | Type unsupported word | Chip shown with "no sign" badge — not hidden |
| 40 | Adjust speed to 1.25× | Steps are faster |

---

## Phase 10: Caregiver, Emergency & Accessibility

| # | Test | Expected Result |
|---|------|-----------------|
| 41 | Navigate to SOS Emergency tab | High-contrast red panel rendered |
| 42 | Select "I need immediate help", click Speak | Loud, slightly slower TTS plays |
| 43 | Add emergency contact | Contact saved; persistent on reload |
| 44 | Generate caregiver linking code | 6-digit `MN-XXXXXX` code shown with 15-min expiry |
| 45 | Set text size to "Extra Large" | All UI text scales up immediately |
| 46 | Enable High Contrast | Background/foreground flip to high contrast |
| 47 | Enable Reduced Motion | Animations suppressed |

---

## Phase 11: Communication Intelligence & Personalization

| # | Test | Expected Result |
|---|------|-----------------|
| 48 | Navigate to "Smart Quick Access" with no history | Empty state message shown; no fake suggestions |
| 49 | Speak 3 messages from Emergency panel | Messages appear in Smart Quick with count ×3 |
| 50 | Pin a message in Smart Quick | Pinned message always appears first |
| 51 | Toggle "Personalization Off" | Panel shows disabled state; no tracking |
| 52 | Create a Vocabulary Collection named "Daily" | Collection appears in sidebar |
| 53 | Add 3 messages to "Daily", click Speak on one | Message spoken; use count increments |
| 54 | Search vocabulary for "water" | Matching messages from all collections returned |
| 55 | Export vocabulary as JSON | JSON file downloaded |
| 56 | Import vocabulary JSON | Collections merged; duplicates avoided |
| 57 | Navigate to "Privacy & Personalization" | Usage stats shown (real counts) |
| 58 | Click "Clear personalization history" | Smart Quick resets to empty state |

---

## Phase 12: Deployment Readiness

| # | Test | Expected Result |
|---|------|-----------------|
| 59 | `npm run build` | 0 TypeScript errors; chunks: mediapipe, lucide, vendor, index |
| 60 | Serve `dist/` with `npx serve dist` | App loads; all routes work |
| 61 | Backend `GET /api/health` with no `.env` | Returns healthy; AI status shows unconfigured |
| 62 | Open app in Firefox | Core features work (gestures may differ) |
| 63 | Open app on mobile Safari (iPhone) | Responsive layout; TTS works |
| 64 | Open app with keyboard only (Tab/Enter) | All interactive elements reachable |
| 65 | Open app with VoiceOver (macOS) | Buttons have accessible labels |

---

## Accessibility Checklist

- [ ] All buttons have `title` or `aria-label`
- [ ] All form inputs have associated `<label>` or `aria-label`
- [ ] Focus ring visible on all interactive elements
- [ ] Colour contrast meets WCAG AA (4.5:1 for normal text)
- [ ] No autoplaying audio or video
- [ ] Keyboard navigation works without mouse
- [ ] Error messages are descriptive and not colour-only

---

## Browser Compatibility Matrix

| Browser | TTS | STT | Gestures | Sign |
|---------|-----|-----|----------|------|
| Chrome 110+ | ✅ | ✅ | ✅ | ✅ |
| Firefox 115+ | ✅ | ⚠️ Limited | ✅ | ✅ |
| Safari 16+ (macOS) | ✅ | ✅ | ✅ | ✅ |
| Safari (iOS 16+) | ✅ | ✅ | ✅ | ✅ |
| Edge 110+ | ✅ | ✅ | ✅ | ✅ |

---

## Known Gaps (Honest Assessment)

1. **No E2E test framework** (Playwright/Cypress) is wired — all tests above are manual or backend-only pytest
2. **ISL sign video library** is not bundled — Voice-to-Sign shows metadata only
3. **MediaPipe gesture model** covers 6 static gestures — not full ISL vocabulary
4. **No load testing** has been performed on backend
5. **Firebase rules** have not been audited by a security professional

---

## Phase 13–14: Unified Integration & Pilot Feedback

| # | Test | Expected Result |
|---|------|-----------------|
| 66 | Change language in Dashboard topbar | Updates `VoiceToTextSection`, `VoiceToSignCommunication`, `GestureRecognition`, `Communication` |
| 67 | Open `/dashboard?mode=emergency` | Opens SOS Emergency Mode directly |
| 68 | Refresh `/dashboard` on static host | SPA rewrite (`vercel.json` / `_redirects`) serves `index.html` without 404 |
| 69 | Click Sign Out in Dashboard sidebar | Calls `AuthContext.logout()` and navigates to `/login` |
| 70 | Submit feedback in Pilot Feedback tab | Saves locally (and syncs to `POST /api/feedback` if backend running) |

---

*Last updated: Phase 14 — MOUNAM Pilot Preparation*
