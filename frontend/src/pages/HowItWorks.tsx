import React, { useState } from 'react';
import {
  MousePointerClick,
  Cpu,
  FileText,
  Volume2,
  ArrowRight,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/Button';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      number: "01",
      icon: <MousePointerClick className="w-8 h-8 text-brand-purple-600" />,
      title: "Step 1: Choose an Input",
      tagline: "Touch tile, custom keyword, or hands-free gesture",
      details: [
        "Select from categorized high-contrast symbol tiles (Daily Needs, Health, Emotions, Social).",
        "Or enter a shorthand keyword in the rapid-entry prompt (e.g. 'Stomach Pain').",
        "Or make a recognized hand gesture in front of your webcam (Thumbs Up, Open Palm, Closed Fist)."
      ],
      interactiveDemo: {
        type: "Input Sample",
        value: "Tap 'Water' + 'Thirsty' on the symbol board"
      }
    },
    {
      number: "02",
      icon: <Cpu className="w-8 h-8 text-brand-blue-600" />,
      title: "Step 2: AI Understands Your Selection",
      tagline: "Contextual processing through Google Gemini API",
      details: [
        "The system checks the user's communication profile, language settings, and active category context.",
        "The FastAPI backend sends the raw input tokens to Gemini with strict polite phrasing prompts.",
        "Crucially: The AI will never invent medical symptoms or fabricate unintended messages."
      ],
      interactiveDemo: {
        type: "Context Engine",
        value: "Identified: Immediate physiological hydration requirement with polite tone."
      }
    },
    {
      number: "03",
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      title: "Step 3: Generate a Meaningful Sentence",
      tagline: "Transparent sentence preview with manual edit and confirmation",
      details: [
        "The raw tokens are synthesized into an articulate, natural sentence.",
        "The sentence is translated into the user's active regional language (e.g., Tamil, Hindi).",
        "The user or caregiver can view the generated text and make real-time adjustments before audio plays."
      ],
      interactiveDemo: {
        type: "Generated Sentence",
        value: "“I am feeling thirsty. Could you please give me some water?”"
      }
    },
    {
      number: "04",
      icon: <Volume2 className="w-8 h-8 text-brand-purple-700" />,
      title: "Step 4: Speak Through Voice Output",
      tagline: "Natural speech synthesis via browser SpeechSynthesis API",
      details: [
        "Spoken aloud with optimal acoustic clarity, natural pacing, and regional accents.",
        "Instant repeat and pause controls allow listeners to hear it again without delay.",
        "Operates directly in the client browser with zero latency."
      ],
      interactiveDemo: {
        type: "Audio Playback",
        value: "🔊 Natural voice playback with repeat and stop controls."
      }
    }
  ];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-50 text-brand-blue-700 text-xs font-bold tracking-wide uppercase">
          Architecture & Workflow
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
          How MOUNAM Works
        </h1>
        <p className="text-lg text-slate-600">
          A transparent, step-by-step assistive technology pipeline engineered for accuracy, autonomy, and speed.
        </p>
      </div>

      {/* Interactive Step Carousel / Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="lg:col-span-5 space-y-3">
          {workflowSteps.map((s, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                activeStep === index
                  ? 'bg-brand-purple-50/80 border-brand-purple-600 shadow-soft-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                activeStep === index
                  ? 'bg-brand-purple-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {s.number}
              </div>
              <div>
                <h3 className={`text-base font-bold ${activeStep === index ? 'text-brand-purple-900' : 'text-slate-800'}`}>
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {s.tagline}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Deep Dive Details Card for Selected Step */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-soft-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple-50 flex items-center justify-center">
                {workflowSteps[activeStep].icon}
              </div>
              <div>
                <span className="text-xs font-bold text-brand-purple-700 uppercase tracking-wider">
                  Phase {workflowSteps[activeStep].number} Detail
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {workflowSteps[activeStep].title}
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-brand-blue-50 text-brand-blue-700 rounded-full">
              Safe & Supervised
            </span>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Process Overview</h4>
            {workflowSteps[activeStep].details.map((desc, dIdx) => (
              <div key={dIdx} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Simulated Pipeline State */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-brand-purple-300">
              <span className="font-mono uppercase tracking-wider">{workflowSteps[activeStep].interactiveDemo.type}</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Live Simulation
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100">
              {workflowSteps[activeStep].interactiveDemo.value}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 3))}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Previous Step
            </button>
            <button
              onClick={() => setActiveStep((prev) => (prev < 3 ? prev + 1 : 0))}
              className="text-xs font-bold text-brand-purple-700 hover:text-brand-purple-900 flex items-center gap-1"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Safety & Medical Ethics Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-8 sm:p-10 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <span>Core AI Safety Principle in MOUNAM</span>
        </div>
        <p className="text-sm text-amber-900/90 leading-relaxed">
          MOUNAM strictly abides by an <strong>uncompromising assistive safety protocol</strong>:
          The AI never assumes user medical conditions, never fabricates clinical urgency unless explicitly designated by the user, and will <strong>always</strong> require explicit visual confirmation before broadcasting any synthesized speech. When offline or disconnected from the AI API, the platform falls back securely to tested, predefined phrases.
        </p>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <Button to="/dashboard" variant="primary" size="xl">
          Try the Flow on Dashboard
        </Button>
      </div>

    </div>
  );
};
