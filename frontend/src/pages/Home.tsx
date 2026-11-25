import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Camera,
  Globe2,
  BookmarkPlus,
  AlertTriangle,
  Volume2,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Accessibility,
  HeartHandshake,
  Clock,
  Users2,
  ShieldCheck,
  Zap,
  Ear
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Illustration } from '../components/Illustration';

export const Home: React.FC = () => {
  const [activeSpeechTest, setActiveSpeechTest] = useState<string | null>(null);

  const speakPreview = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeechTest(id);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setActiveSpeechTest(null);
      utterance.onerror = () => setActiveSpeechTest(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveSpeechTest(id);
      setTimeout(() => setActiveSpeechTest(null), 1500);
    }
  };

  // Six core feature cards required by Step 2
  const featureCards = [
    {
      id: "touch",
      icon: <Accessibility className="w-6 h-6 text-brand-purple-600" />,
      title: "Touch-Based Communication",
      desc: "Large, high-contrast visual tiles enabling rapid communication of daily needs, health status, and social greetings in one tap.",
      status: "Operational in Step 1 & 2",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    {
      id: "ai",
      icon: <Sparkles className="w-6 h-6 text-brand-purple-700" />,
      title: "AI Sentence Generation",
      desc: "Translates selected shorthand keywords into complete, courteous, and context-aware sentences using Google Gemini AI.",
      status: "Backend Configured (Phase 5 API)",
      badgeColor: "bg-brand-purple-50 text-brand-purple-700 border-brand-purple-200"
    },
    {
      id: "voice",
      icon: <Globe2 className="w-6 h-6 text-brand-blue-600" />,
      title: "Multilingual Voice Output",
      desc: "Speak naturally in English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), and Kannada (ಕನ್ನಡ).",
      status: "Web Speech Active (Phase 3)",
      badgeColor: "bg-brand-blue-50 text-brand-blue-700 border-brand-blue-200"
    },
    {
      id: "gesture",
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      title: "Gesture Recognition",
      desc: "Contactless hand gesture tracking via MediaPipe and webcam for users who cannot touch a screen or use standard mice.",
      status: "Scheduled for Phase 6",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
    },
    {
      id: "emergency",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: "Emergency Communication",
      desc: "Instant high-visibility emergency SOS mode providing loud, urgent distress broadcasts and medical call assistance offline.",
      status: "Operational in Step 1 & 2",
      badgeColor: "bg-red-50 text-red-700 border-red-200"
    },
    {
      id: "vocabulary",
      icon: <BookmarkPlus className="w-6 h-6 text-amber-600" />,
      title: "Personalized Vocabulary",
      desc: "Create and organize custom phrases, routines, family names, and frequent meals linked to Cloud Firestore.",
      status: "Local Cache Ready (Phase 4)",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
    }
  ];

  // Four-step visual pipeline
  const howItWorksSteps = [
    {
      stepNumber: "01",
      title: "Step 1: Select",
      subtitle: "Choose an option",
      desc: "User selects an icon, touch symbol, custom keyword, or gesture from categorized communication cards.",
      icon: <Accessibility className="w-5 h-5 text-white" />
    },
    {
      stepNumber: "02",
      title: "Step 2: Understand",
      subtitle: "Contextual processing",
      desc: "The application processes the user’s explicit input and contextual requirements without assuming medical diagnoses.",
      icon: <Zap className="w-5 h-5 text-white" />
    },
    {
      stepNumber: "03",
      title: "Step 3: Generate",
      subtitle: "Polite sentence synthesis",
      desc: "A meaningful, polite sentence is synthesized and clearly displayed on screen for user visual confirmation.",
      icon: <MessageSquare className="w-5 h-5 text-white" />
    },
    {
      stepNumber: "04",
      title: "Step 4: Speak",
      subtitle: "Voice output",
      desc: "The sentence is displayed and spoken aloud using browser SpeechSynthesis with instant repeat and volume controls.",
      icon: <Volume2 className="w-5 h-5 text-white" />
    }
  ];

  // Who can use MOUNAM
  const userGroups = [
    {
      icon: <Ear className="w-8 h-8 text-brand-purple-600" />,
      title: "People with Speech Disabilities",
      desc: "Supports individuals living with Amyotrophic Lateral Sclerosis (ALS), cerebral palsy, stroke-induced aphasia, or apraxia of speech to communicate with autonomy and dignity.",
      features: ["Single-tap communication", "Switch-device friendly", "Zero cognitive fatigue"]
    },
    {
      icon: <Clock className="w-8 h-8 text-brand-blue-600" />,
      title: "Elderly People",
      desc: "Tailored for seniors experiencing vocal frailty, mild cognitive decline, or age-related speech difficulties through large readable buttons and gentle pacing.",
      features: ["Large high-contrast text", "Simplified menus", "Warm regional voices"]
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-emerald-600" />,
      title: "People with Temporary Difficulties",
      desc: "An immediate bedside companion for patients in intensive care (ICU), those recovering from throat surgery, intubation, or vocal chord trauma.",
      features: ["No setup required", "Works on any smartphone/tablet", "Quick pain indicators"]
    },
    {
      icon: <Users2 className="w-8 h-8 text-amber-600" />,
      title: "Caregivers and Family Members",
      desc: "Empowers family caregivers, nurses, and speech therapists to configure personalized vocabulary, monitor distress calls, and communicate with mutual peace of mind.",
      features: ["Custom vocabulary builder", "Emergency contact setup", "Caregiver dashboard"]
    }
  ];

  const sampleShortcuts = [
    { id: '1', label: '💧 Water', text: 'I need some water please.' },
    { id: '2', label: '🍲 Hungry', text: 'I am feeling hungry, could I have something to eat?' },
    { id: '3', label: '💊 Medicine', text: 'It is time for my scheduled medicine.' },
    { id: '4', label: '❤️ Thank you', text: 'Thank you very much for your care and support.' },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-12 sm:pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-brand-purple-100/60 via-brand-blue-100/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Tagline / Mission Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple-50 border border-brand-purple-200/80 shadow-soft-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-purple-600 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-bold text-brand-purple-900 tracking-wide">
              MOUNAM • Assistive AAC Platform
            </span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Every Voice Deserves <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-purple-800 via-brand-purple-600 to-brand-blue-600 bg-clip-text text-transparent">
              to Be Heard.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Breaking communication barriers with AI-powered touch, gestures and voice assistance.
          </p>

          {/* Buttons: Start Communicating + Discover MOUNAM */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              to="/dashboard"
              variant="primary"
              size="xl"
              icon={<MessageSquare className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-soft-lg hover:shadow-soft-xl"
            >
              Start Communicating
            </Button>

            <Button
              to="/features"
              variant="outline"
              size="xl"
              icon={<Sparkles className="w-5 h-5 text-brand-purple-700" />}
              className="w-full sm:w-auto"
            >
              Discover MOUNAM
            </Button>
          </div>

          {/* Accessible Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Free & Dignified Care
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Runs on Phones, Tablets & Desktops
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Offline Emergency Mode
            </span>
          </div>
        </div>

        {/* Visual Illustration: Person using app + Large Icons + Voice Output */}
        <div className="mt-12 sm:mt-16">
          <Illustration />
        </div>
      </section>

      {/* 2. INTERACTIVE VOICE PREVIEW BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-purple-900 to-brand-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-brand-purple-200 text-xs font-bold uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-brand-blue-400" />
              <span>Browser SpeechSynthesis Test</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Experience how MOUNAM sounds</h3>
            <p className="text-sm text-brand-purple-200 max-w-md">
              Tap any phrase below to test speech output using your device's native voice engine.
            </p>
          </div>

          {/* Quick Speak Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            {sampleShortcuts.map((item) => (
              <button
                key={item.id}
                onClick={() => speakPreview(item.text, item.id)}
                className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeSpeechTest === item.id
                    ? 'bg-brand-blue-500 text-white border-brand-blue-400 scale-95 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-brand-purple-200 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {activeSpeechTest === item.id ? 'Playing...' : 'Tap to speak'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (6 FEATURE CARDS) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700 text-xs font-bold tracking-wide uppercase">
            Platform Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Six Pillars of Assistive Communication
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Engineered for reliability, simplicity, and accessibility across all ages and physical abilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((feat) => (
            <Card
              key={feat.id}
              className="flex flex-col justify-between h-full group hover:border-brand-purple-200 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-purple-50 transition-all duration-300">
                    {feat.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                    {feat.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-brand-purple-800 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-purple-700">
                <span>View capability</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS (FOUR STEPS) */}
      <section id="how-it-works" className="bg-slate-50/80 border-y border-slate-200/70 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple-100 text-brand-purple-800 text-xs font-bold tracking-wide uppercase">
              The 4-Step Process
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              How MOUNAM Works
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              A frictionless path from user intent to articulate spoken voice in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((s, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-sm relative flex flex-col justify-between hover:shadow-soft-lg hover:-translate-y-1 transition-all"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple-900 to-brand-purple-700 text-white font-black text-sm flex items-center justify-center mb-6 shadow-sm">
                    {s.icon}
                  </div>
                  <span className="text-[11px] font-bold text-brand-purple-600 uppercase tracking-wider block mb-1">
                    {s.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Step {s.stepNumber}</span>
                  <span className="text-emerald-600">Transparent</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              to="/how-it-works"
              variant="outline"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Full Pipeline Details
            </Button>
          </div>
        </div>
      </section>

      {/* 5. WHO CAN USE MOUNAM? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            Inclusive Assistive Care
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Who Can Use MOUNAM?
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Designed with dignity and compassion for diverse physical, vocal, and cognitive communication needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userGroups.map((group, gIdx) => (
            <Card key={gIdx} className="flex flex-col justify-between h-full bg-white border border-slate-200/80">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
                  {group.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {group.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {group.desc}
                </p>

                <div className="pt-2 space-y-2">
                  {group.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-purple-50/60 via-white to-brand-blue-50/50 rounded-3xl p-8 sm:p-14 border border-brand-purple-100 shadow-soft-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple-100 text-brand-purple-800 text-xs font-bold tracking-wide uppercase">
                About MOUNAM
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Communication Without Barriers.
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                MOUNAM is designed to make everyday communication easier through accessible technology, intelligent assistance and personalized communication tools.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                Whether at home with loved ones, at a doctor’s clinic, or in post-operative recovery, MOUNAM preserves your autonomy with large touch surfaces, respectful voice synthesis, and hands-free gesture support.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Button to="/about" variant="primary" size="lg">
                  Learn More
                </Button>
                <Button to="/features" variant="outline" size="lg">
                  Explore Capabilities
                </Button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-soft space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple-800 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                M
              </div>
              <h4 className="text-lg font-black text-slate-900">Universal Access</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero specialized eye trackers or costly hardware required. Runs natively in any browser with Web Speech and MediaPipe.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Private & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-purple-900 via-brand-purple-800 to-brand-blue-900 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-soft-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Your Voice. Your Choice. Your MOUNAM.
            </h2>
            <p className="text-base sm:text-lg text-brand-purple-200">
              Start a simpler and more accessible way to communicate.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                to="/dashboard"
                variant="secondary"
                size="xl"
                icon={<MessageSquare className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                Get Started
              </Button>
              <Button
                to="/about"
                variant="outline"
                size="xl"
                className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Learn More About Our Mission
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
