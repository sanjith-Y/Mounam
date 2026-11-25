/**
 * PilotFeedbackPanel.tsx
 * Phase 14 — Real User Pilot Preparation & Feedback System
 */
import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Star,
} from 'lucide-react';
import {
  feedbackService,
  PilotFeedbackEntry,
  PilotRole,
  IssueCategory,
} from '../services/feedbackService';
import { useAccessibility } from '../context/AccessibilityContext';

const MODULES = [
  'Express Communication Dashboard',
  'Touch Board & Sentence Builder',
  'Smart Quick Access',
  'My Vocabulary',
  'Voice-to-Text',
  'Voice-to-Sign',
  'Gesture & Sign Camera',
  'SOS Emergency Mode',
  'Caregiver Portal',
  'Accessibility Center',
  'Overall Platform',
];

export const PilotFeedbackPanel: React.FC = () => {
  const { settings, preferences } = useAccessibility();
  const [entries, setEntries] = useState<PilotFeedbackEntry[]>(() => feedbackService.getEntries());
  const [role, setRole] = useState<PilotRole>('aac_user');
  const [moduleUsed, setModuleUsed] = useState<string>(MODULES[0]);
  const [rating, setRating] = useState<number>(4);
  const [easeOfUse, setEaseOfUse] = useState<number>(4);
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('none');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const textSizeClass =
    settings.textSize === 'large'
      ? 'text-base'
      : settings.textSize === 'extra_large'
      ? 'text-lg'
      : 'text-sm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 3) {
      setStatusMsg({ type: 'error', text: 'Please enter at least 3 characters of feedback.' });
      return;
    }
    setSubmitting(true);
    setStatusMsg(null);
    const saved = await feedbackService.submitFeedback({
      role,
      moduleUsed,
      rating,
      easeOfUse,
      issueCategory,
      comment,
      language: preferences.preferredLanguage || 'en',
    });
    setEntries(feedbackService.getEntries());
    setComment('');
    setSubmitting(false);
    setStatusMsg({
      type: saved.syncedToBackend ? 'success' : 'info',
      text: saved.syncedToBackend
        ? 'Feedback submitted to server and saved locally.'
        : 'Saved locally on this device (backend unreachable — you can export JSON anytime).',
    });
  };

  const handleExport = () => {
    const json = feedbackService.exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mounam_pilot_feedback_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Clear all locally stored pilot feedback entries?')) {
      feedbackService.clearAll();
      setEntries([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-purple-700 to-brand-blue-500 rounded-xl flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilot Feedback &amp; Usability Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Help us improve MOUNAM during real-world assistive communication testing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON ({entries.length})
          </button>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-2xl text-sm border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMsg.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-soft-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PilotRole)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
            >
              <option value="aac_user">Speech-Disabled / AAC User</option>
              <option value="deaf_user">Deaf / Hard-of-Hearing User</option>
              <option value="caregiver">Caregiver / Family Member</option>
              <option value="clinician">Speech Therapist / Clinician</option>
              <option value="tester">Pilot Evaluator / Tester</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Module Tested</label>
            <select
              value={moduleUsed}
              onChange={(e) => setModuleUsed(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
            >
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Overall Experience ({rating}/5)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`p-1.5 rounded-lg border ${
                    rating >= n
                      ? 'bg-amber-50 border-amber-300 text-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                  aria-label={`Rate ${n} out of 5`}
                >
                  <Star className={`w-4 h-4 ${rating >= n ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Accessibility / Ease ({easeOfUse}/5)
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={easeOfUse}
              onChange={(e) => setEaseOfUse(Number(e.target.value))}
              className="w-full accent-brand-purple-800 cursor-pointer mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Category</label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none"
            >
              <option value="none">No Issue / Suggestion</option>
              <option value="voice_tts">Voice / Text-to-Speech</option>
              <option value="speech_to_text">Voice-to-Text</option>
              <option value="gesture_camera">Gesture Camera</option>
              <option value="sign_communication">Voice-to-Sign</option>
              <option value="accessibility">Accessibility / Contrast / Size</option>
              <option value="navigation">Navigation / Layout</option>
              <option value="performance">Speed / Performance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Observations, Issues, or Suggestions
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe what worked well, what was confusing, or any bug encountered..."
            className={`w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 ${textSizeClass}`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-purple-800 hover:bg-brand-purple-900 text-white font-bold text-sm transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Submitting...' : 'Submit Pilot Feedback'}</span>
        </button>
      </form>

      {entries.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            Submitted Feedback ({entries.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {entries.map((item) => (
              <div key={item.id} className="py-3 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-purple-800">
                    {item.moduleUsed} · {item.role.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.syncedToBackend
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.syncedToBackend ? 'Synced to Server' : 'Saved Locally'}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{item.comment}</p>
                <p className="text-[11px] text-slate-400">
                  Rating: {item.rating}/5 · Ease: {item.easeOfUse}/5 ·{' '}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
