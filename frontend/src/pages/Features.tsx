import React from 'react';
import {
  Sparkles,
  Camera,
  Globe,
  BookmarkCheck,
  AlertOctagon,
  Accessibility,
  Eye,
  Type,
  Sun,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { Button } from '../components/Button';

export const Features: React.FC = () => {
  const coreFeatures = [
    {
      id: "touch",
      icon: <Accessibility className="w-8 h-8 text-brand-purple-600" />,
      title: "1. Simple Touch Communication",
      subtitle: "Large, high-contrast visual tiles designed for motor accessibility",
      description: "Designed specifically for individuals with tremors, motor restrictions, or cognitive fatigue. Large touch areas, unmistakable iconography, and categorised menus (Daily Needs, Health, Emotions, Social) enable single-tap intent selection without confusing multi-level navigation.",
      points: [
        "Extra-large touch targets compliant with WCAG 2.1 AAA standards",
        "Color-coded categories for rapid recognition",
        "Works offline with built-in instant local phrases",
        "Keyboard navigation and switch-device compatibility"
      ]
    },
    {
      id: "ai",
      icon: <Sparkles className="w-8 h-8 text-brand-purple-700" />,
      title: "2. AI-Powered Sentence Construction",
      subtitle: "Context-aware polite sentence generation with Google Gemini",
      description: "Instead of sounding robotic or clipped, MOUNAM's AI engine interprets shorthand tokens (e.g. 'Water' + 'Thirsty') and synthesizes natural, courteous sentences ('I am feeling thirsty. Could you please give me some water?') formatted for real human interaction.",
      points: [
        "Intelligent context expansion respecting user dignity",
        "Always presents generated sentence for user confirmation before speaking",
        "Never invents symptoms or misrepresents medical state",
        "Graceful offline fallback to predefined sentences"
      ]
    },
    {
      id: "gesture",
      icon: <Camera className="w-8 h-8 text-brand-blue-600" />,
      title: "3. MediaPipe Hand Gesture Recognition",
      subtitle: "Contactless communication using any standard web camera",
      description: "For users who cannot touch a screen or use a mouse, MOUNAM utilizes computer vision with MediaPipe Hands to recognize key gestures—such as Thumbs Up (Yes), Open Palm (Stop/Wait), and Closed Fist (Help alert)—directly inside the browser with zero cloud image transmission.",
      points: [
        "100% on-device local gesture processing for absolute privacy",
        "Supports standard laptop webcams and smartphone cameras",
        "Configurable custom gesture mappings in caregiver settings",
        "Audible and visual confirmation cues"
      ]
    },
    {
      id: "languages",
      icon: <Globe className="w-8 h-8 text-emerald-600" />,
      title: "4. Multilingual & Regional Voice Output",
      subtitle: "Native articulation in 6 major Indian languages",
      description: "Communication should happen in the mother tongue of the individual and their family. MOUNAM supports instant translation and browser-supported regional speech synthesis across English, Tamil, Hindi, Telugu, Malayalam, and Kannada.",
      points: [
        "Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు)",
        "Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), English",
        "Speech speed control and pitch calibration",
        "Clear indicators if a regional voice is not installed on the host OS"
      ]
    },
    {
      id: "vocabulary",
      icon: <BookmarkCheck className="w-8 h-8 text-amber-600" />,
      title: "5. Personalized Vocabulary Management",
      subtitle: "Custom words, family names, medications, and favorite routines",
      description: "Every individual has unique needs, preferred nicknames, favorite beverages, and specific routines. Caregivers and users can curate custom vocabulary tiles that persist securely in Cloud Firestore and sync across all devices.",
      points: [
        "Add custom words, sentences, and assign visual categories",
        "Favorite message bookmarks for 1-tap playback",
        "Edit and delete custom cards anytime",
        "Caregiver synchronization with linked profiles"
      ]
    },
    {
      id: "emergency",
      icon: <AlertOctagon className="w-8 h-8 text-red-600" />,
      title: "6. Emergency SOS Mode",
      subtitle: "Immediate high-priority alert system with high-contrast UI",
      description: "When seconds count, navigating complex menus is unacceptable. The Emergency Mode displays a dedicated red high-visibility dashboard with rapid voice alarms for medical distress, severe pain, breathing difficulty, or caregiver calls.",
      points: [
        "Dedicated full-screen high-contrast red emergency layout",
        "Instant offline speech output for critical distress alerts",
        "Continuous repeat alert option until acknowledged",
        "Configurable trusted emergency contacts for caregivers"
      ]
    }
  ];

  const accessibilityModes = [
    {
      icon: <Sun className="w-5 h-5 text-amber-600" />,
      name: "Light & Dark Mode",
      desc: "Gentle on eyes with optimized contrast ratios for night or day."
    },
    {
      icon: <Type className="w-5 h-5 text-brand-purple-600" />,
      name: "Large Text Mode",
      desc: "Enhanced font scales and bold typography for low-vision users."
    },
    {
      icon: <Eye className="w-5 h-5 text-brand-blue-600" />,
      name: "High Contrast Mode",
      desc: "Stark black/white/yellow borders for maximum visual clarity."
    },
    {
      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
      name: "One-Handed Mobile UX",
      desc: "Bottom navigation thumb-zone design for bedridden users."
    }
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple-100 text-brand-purple-800 text-xs font-bold tracking-wide uppercase">
          Capabilities & Inclusivity
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          Every Feature Engineered for Accessibility
        </h1>
        <p className="text-lg text-slate-600">
          Explore how MOUNAM's technological pillars work cohesively to transform silence into fluent, expressive human voice.
        </p>
      </div>

      {/* 6 In-Depth Core Features */}
      <div className="space-y-12">
        {coreFeatures.map((item, index) => (
          <div
            key={item.id}
            id={item.id}
            className={`p-8 sm:p-12 rounded-3xl border border-slate-200/80 bg-white shadow-soft transition-all ${
              index % 2 === 1 ? 'bg-gradient-to-br from-white to-brand-purple-50/30' : ''
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {item.title}
                </h2>
                <p className="text-sm font-semibold text-brand-purple-700">
                  {item.subtitle}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200/60">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">
                  Key Technical Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {item.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 font-medium leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Ready in Step 1 & subsequent phases</span>
                  <Button to="/dashboard" variant="primary" size="sm">
                    Test in Dashboard →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility Standard Matrix */}
      <div className="bg-gradient-to-r from-brand-purple-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-soft-xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-blue-300">Inclusive Standards</span>
          <h3 className="text-2xl sm:text-4xl font-black mt-1">Multi-Modal Accessibility Built-in</h3>
          <p className="text-sm text-brand-purple-200 mt-2">
            MOUNAM conforms with universal accessibility guidelines to support users with diverse physical, sensory, and motor needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accessibilityModes.map((acc, aIdx) => (
            <div key={aIdx} className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                {acc.icon}
              </div>
              <h4 className="text-base font-bold text-white mb-1">{acc.name}</h4>
              <p className="text-xs text-brand-purple-200">{acc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-8">
        <Button to="/dashboard" variant="primary" size="xl">
          Launch Live Communication Dashboard
        </Button>
      </div>

    </div>
  );
};
