import React from 'react';
import { FileCheck, AlertTriangle, HeartHandshake, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Terms: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple-50 text-brand-purple-800 text-xs font-bold tracking-wide uppercase">
          Terms of Service
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Terms and Conditions
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Welcome to MOUNAM. By accessing or using our assistive communication platform, you agree to these clear and respectful terms.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <HeartHandshake className="w-5 h-5 text-brand-purple-600" />
            <h3>1. Purpose of the Platform</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            MOUNAM is an assistive Augmentative and Alternative Communication (AAC) platform designed to support verbal expression through touch, gestures, and speech synthesis. It is intended to empower individuals and caregivers.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>2. Medical & Emergency Disclaimer</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            MOUNAM provides emergency speech phrases and caregiver alert tools, but it is <strong>not a replacement for professional clinical medical advice or emergency 911/112 dispatch systems</strong>. Never delay calling emergency medical services in life-threatening situations.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <FileCheck className="w-5 h-5 text-brand-blue-600" />
            <h3>3. User & Caregiver Responsibility</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Caregivers configuring custom vocabulary phrases or gesture mappings must ensure that configured sentences accurately represent the intended preferences of the individual user.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-3 text-brand-purple-900 font-bold text-lg">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3>4. Availability & Offline Resilience</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Core predefined touch tiles, local vocabulary, and speech synthesis are built to operate offline. However, web browser updates or hardware device settings may affect microphone, camera, or voice availability.
          </p>
        </Card>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">MOUNAM Assistive Technologies</span>
        <Button to="/" variant="outline" size="sm">
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};
