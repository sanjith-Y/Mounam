import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Privacy: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase">
          Privacy & Data Protection
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Last updated: November 2026. At MOUNAM, we recognize that assistive communication involves sensitive, personal, and medical thoughts. We treat your privacy with the utmost dignity.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <Lock className="w-5 h-5 text-brand-purple-600" />
            <h3>1. On-Device Gesture & Camera Processing</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            All hand gesture recognition performed via MediaPipe runs <strong>100% locally inside your web browser</strong>. No camera video feeds, snapshots, or biometric facial/hand imagery are ever streamed, uploaded, or recorded to our servers.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <EyeOff className="w-5 h-5 text-brand-blue-600" />
            <h3>2. Speech Synthesis & Local Audio</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Audio output uses the client browser’s native <code>SpeechSynthesis API</code>. Your spoken sentences are articulated locally by your device’s operating system without sending synthesized voice recordings to third parties.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <Server className="w-5 h-5 text-emerald-600" />
            <h3>3. AI Communication Data Handling</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you choose to use the AI Sentence Generator, only the specific keyword tokens you select (e.g., “Water + Thirsty”) are transmitted to our secure backend and Google Gemini API to construct polite sentences. These inputs are not used to train advertising algorithms.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3>4. Offline Storage</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your customized vocabulary tiles and favorites can be stored locally on your device via browser local storage/IndexedDB for offline continuity.
          </p>
        </Card>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Questions? Contact privacy@mounam.org</span>
        <Button to="/" variant="outline" size="sm">
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};
