import React from 'react';
import {
  Type,
  Eye,
  Volume2,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { Button } from './Button';
import { useAccessibility } from '../context/AccessibilityContext';
import { voiceEngine } from '../services/voiceEngine';

export const AccessibilityCenter: React.FC = () => {
  const { settings, preferences, updateSettings, triggerHaptic, resetAccessibility } =
    useAccessibility();

  const handleTestSpeech = () => {
    triggerHaptic(30);
    voiceEngine.speak(
      'This is a demonstration of the MOUNAM assistive voice engine with your selected accessibility settings.',
      {
        rate: settings.speechRate,
        pitch: 1.0,
        volume: 1.0,
        languageCode: preferences.preferredLanguage || 'en',
      }
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-purple-50 text-brand-purple-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Accessibility & Sensory Customization Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global controls that immediately adapt text scaling, contrast, touch targets, and speech modulation across MOUNAM.
          </p>
        </div>

        <button
          onClick={resetAccessibility}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Text Size Scaling */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-brand-purple-700" />
            <h3 className="text-sm font-black text-slate-900">Text Size Scaling</h3>
          </div>
          <p className="text-xs text-slate-500">Scales fonts across cards, messages, and navigation.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', label: 'Standard (1x)' },
              { id: 'large', label: 'Large (1.2x)' },
              { id: 'extra_large', label: 'X-Large (1.4x)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  triggerHaptic();
                  updateSettings({ textSize: opt.id as any });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-colors ${
                  settings.textSize === opt.id
                    ? 'bg-brand-purple-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Visual Contrast Mode */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-purple-700" />
            <h3 className="text-sm font-black text-slate-900">Visual Contrast Enhancement</h3>
          </div>
          <p className="text-xs text-slate-500">Increases border definition and text contrast for low-vision users.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'standard', label: 'Standard Clean' },
              { id: 'high_contrast', label: 'High Contrast Mode' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  triggerHaptic();
                  updateSettings({ contrast: opt.id as any });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-colors ${
                  settings.contrast === opt.id
                    ? 'bg-brand-purple-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Communication Touch Button Size */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-purple-700" />
            <h3 className="text-sm font-black text-slate-900">Touch Target Dimensions</h3>
          </div>
          <p className="text-xs text-slate-500">Expands touch padding on speech & phrase buttons for motor ease.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'large', label: 'Large (+25%)' },
              { id: 'extra_large', label: 'X-Large (+50%)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  triggerHaptic();
                  updateSettings({ buttonSize: opt.id as any });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-colors ${
                  settings.buttonSize === opt.id
                    ? 'bg-brand-purple-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Reduced Motion & Animations */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Reduced Motion</h3>
              <p className="text-xs text-slate-500 mt-0.5">Disables animated transitions and decorative loops.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-purple-600 relative"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">Tactile Haptic Vibration</h3>
              <p className="text-xs text-slate-500 mt-0.5">Vibrates device slightly on message taps where supported.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hapticEnabled}
                onChange={(e) => updateSettings({ hapticEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-purple-600 relative"></div>
            </label>
          </div>
        </div>

        {/* 5. Speech Rate & Voice Tuning */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-purple-700" />
              <h3 className="text-sm font-black text-slate-900">Voice Synthesis Rate Control</h3>
            </div>
            <span className="text-xs font-black text-brand-purple-800 bg-brand-purple-100 px-2.5 py-0.5 rounded-full">
              {settings.speechRate}x Speed
            </span>
          </div>

          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-brand-purple-700"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Slower (0.6x)</span>
            <Button variant="outline" size="sm" onClick={handleTestSpeech}>
              Test Voice Rate Playback
            </Button>
            <span className="text-xs text-slate-400">Faster (1.4x)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
