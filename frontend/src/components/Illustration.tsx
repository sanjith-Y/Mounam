import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle2, User, Hand, MessageSquare } from 'lucide-react';

export const Illustration: React.FC = () => {
  const [selectedWord, setSelectedWord] = useState<'water' | 'food' | 'medicine' | 'help'>('water');
  const [isPlaying, setIsPlaying] = useState(false);

  const sentences = {
    water: {
      tag: "Daily Needs • Hydration",
      title: "Water",
      icon: "💧",
      en: "“I am feeling thirsty. Could you please give me some water?”",
      ta: "“எனக்கு தாகமாக இருக்கிறது. தயவுசெய்து கொஞ்சம் தண்ணீர் கொடுங்கள்.”",
      hi: "“मुझे प्यास लगी है। क्या मुझे थोड़ा पानी मिल सकता है?”"
    },
    food: {
      tag: "Daily Needs • Nutrition",
      title: "Food",
      icon: "🍲",
      en: "“I am feeling hungry. May I please have something to eat?”",
      ta: "“எனக்கு பசிக்கிறது. சாப்பிட ஏதாவது கிடைக்குமா?”",
      hi: "“मुझे भूख लगी है। कृपया मुझे खाना दीजिए।”"
    },
    medicine: {
      tag: "Health • Prescription",
      title: "Medicine",
      icon: "💊",
      en: "“It is time for my medication. Please help me take it.”",
      ta: "“எனக்கு மருந்து சாப்பிடும் நேரம் வந்துவிட்டது.”",
      hi: "“यह मेरी दवाई का समय है। कृपया मेरी मदद करें।”"
    },
    help: {
      tag: "Urgent • Caregiver Assistance",
      title: "Help",
      icon: "🆘",
      en: "“I need some assistance right now. Please come here.”",
      ta: "“எனக்கு உடனடி உதவி தேவை. தயவுசெய்து வாருங்கள்.”",
      hi: "“मुझे तुरंत सहायता चाहिए। कृपया यहाँ आइए।”"
    }
  };

  const handleSpeak = (textToSpeak?: string) => {
    const text = textToSpeak || sentences[selectedWord].en;
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-br from-white via-brand-purple-50/40 to-brand-blue-50/50 rounded-3xl p-5 sm:p-8 lg:p-10 border border-brand-purple-100/90 shadow-soft-xl overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar of Assistive Canvas */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-4 mb-6 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-slate-700 ml-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-brand-purple-700" />
            <span>MOUNAM Communication Interface & Speech Output</span>
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-brand-purple-800 bg-brand-purple-100/80 px-3 py-1 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5 text-brand-purple-600" />
          <span>Live Interactive Demo</span>
        </div>
      </div>

      {/* Main Illustration Layout: Person Using App + Large Icons + Voice Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Person Interacting with Assistive Tablet (Cols 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1. Touch or Gesture Input
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-purple-700 bg-brand-purple-50 px-2 py-0.5 rounded-md">
              <Hand className="w-3 h-3 text-brand-purple-600" />
              <span>Tap Any Icon</span>
            </span>
          </div>

          {/* Large Communication Icons Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {(['water', 'food', 'medicine', 'help'] as const).map((key) => {
              const item = sentences[key];
              const isSelected = selectedWord === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedWord(key);
                    handleSpeak(item.en);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-28 relative group ${
                    isSelected
                      ? 'border-brand-purple-600 bg-brand-purple-50/90 shadow-md ring-2 ring-brand-purple-400/50 scale-[1.02]'
                      : 'border-slate-200/80 bg-white hover:border-brand-purple-300 hover:bg-slate-50'
                  }`}
                  aria-label={`Select ${item.title}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl sm:text-3xl p-1.5 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-brand-purple-700" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm sm:text-base font-black ${isSelected ? 'text-brand-purple-900' : 'text-slate-800'}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">1-Tap Intent</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              High-Contrast Large Targets
            </span>
            <span className="text-brand-purple-700 font-bold">Touch & Gesture Ready</span>
          </div>
        </div>

        {/* Center Connection: Flow Arrow / Processing Spark */}
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-brand-purple-100 text-brand-purple-800 flex items-center justify-center font-black text-sm shadow-soft-sm">
            →
          </div>
        </div>

        {/* Right Side: Voice Output Visualization & Real Spoken Speech (Cols 6) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-brand-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-soft-lg space-y-5 relative">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-purple-200 text-xs font-bold uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-brand-blue-400" />
              <span>Voice Output Visualization</span>
            </div>
            
            {/* Equalizer Waveform Animation */}
            <div className="flex items-end gap-1 h-5 px-2 py-1 bg-white/10 rounded-lg">
              <span className={`w-1 bg-brand-blue-400 rounded-full transition-all ${isPlaying ? 'h-4 animate-bounce' : 'h-1.5'}`}></span>
              <span className={`w-1 bg-brand-purple-400 rounded-full transition-all ${isPlaying ? 'h-5 animate-pulse' : 'h-3'}`}></span>
              <span className={`w-1 bg-emerald-400 rounded-full transition-all ${isPlaying ? 'h-3.5 animate-bounce' : 'h-2'}`}></span>
              <span className={`w-1 bg-brand-blue-300 rounded-full transition-all ${isPlaying ? 'h-5 animate-pulse' : 'h-1'}`}></span>
              <span className={`w-1 bg-purple-300 rounded-full transition-all ${isPlaying ? 'h-2.5 animate-bounce' : 'h-2'}`}></span>
            </div>
          </div>

          {/* Generated Polite Speech Bubble */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-2 relative">
            <div className="flex items-center justify-between text-xs text-brand-purple-300 font-medium">
              <span>Synthesized Sentence (English)</span>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-bold">Polite AAC</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {sentences[selectedWord].en}
            </p>
            
            <div className="pt-2 border-t border-white/10 space-y-1">
              <p className="text-xs text-brand-blue-300 font-medium">
                தமிழ்: {sentences[selectedWord].ta}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                हिन्दी: {sentences[selectedWord].hi}
              </p>
            </div>
          </div>

          {/* Real Audio Playback Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSpeak()}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all shadow-md ${
                isPlaying
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
                  : 'bg-brand-purple-600 hover:bg-brand-purple-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'Speaking Voice Aloud...' : 'Listen to Voice Output'}</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Powered by Web Speech API
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <MessageSquare className="w-4 h-4 text-brand-purple-700" />
          <span>Single Touch & Gesture $\rightarrow$ Meaningful Conversational Voice</span>
        </span>
        <span className="font-semibold text-brand-purple-800">
          Zero Training Needed • Accessible for All Ages
        </span>
      </div>
    </div>
  );
};
