/**
 * PersonalizationPrivacyPanel.tsx
 * Phase 11 — Communication Intelligence & Personalization
 *
 * Privacy controls for personalization data, history recording, and exports.
 */
import React, { useState } from 'react';
import {
  ShieldCheck,
  Trash2,
  Download,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertCircle,
  History,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { personalizationService } from '../services/personalizationService';
import { personalVocabularyService } from '../services/personalVocabularyService';
import { useAccessibility } from '../context/AccessibilityContext';

export const PersonalizationPrivacyPanel: React.FC = () => {
  const { settings } = useAccessibility();
  const [personEnabled, setPersonEnabled] = useState(personalizationService.isEnabled());
  const [historyEnabled, setHistoryEnabled] = useState(
    personalizationService.isHistoryRecordingEnabled()
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const stats = personalizationService.getStats();

  const textSizeClass =
    settings.textSize === 'large'
      ? 'text-base'
      : settings.textSize === 'extra_large'
      ? 'text-lg'
      : 'text-sm';

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const togglePersonalization = () => {
    const next = !personEnabled;
    personalizationService.setEnabled(next);
    setPersonEnabled(next);
    showFeedback('success', next ? 'Personalization enabled.' : 'Personalization disabled.');
  };

  const toggleHistory = () => {
    const next = !historyEnabled;
    personalizationService.setHistoryRecording(next);
    setHistoryEnabled(next);
    showFeedback('success', next ? 'History recording enabled.' : 'History recording disabled.');
  };

  const handleClearPersonalization = () => {
    if (window.confirm('Clear all personalization data? This cannot be undone.')) {
      personalizationService.resetData();
      showFeedback('success', 'Personalization history cleared.');
    }
  };

  const handleExportPersonalization = () => {
    try {
      const json = personalizationService.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mounam_personalization_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedback('success', 'Personalization data exported.');
    } catch {
      showFeedback('error', 'Export failed.');
    }
  };

  const handleExportVocabulary = () => {
    try {
      const json = personalVocabularyService.exportAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mounam_vocabulary_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFeedback('success', 'Personal vocabulary exported.');
    } catch {
      showFeedback('error', 'Export failed.');
    }
  };

  const ToggleRow: React.FC<{
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }> = ({ label, description, value, onToggle, icon }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-500">{icon}</div>
        <div>
          <p className={`font-medium text-slate-800 ${textSizeClass}`}>{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="flex-shrink-0 mt-0.5"
        title={value ? 'Disable' : 'Enable'}
      >
        {value ? (
          <ToggleRight className="w-8 h-8 text-purple-600" />
        ) : (
          <ToggleLeft className="w-8 h-8 text-slate-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className={`font-bold text-slate-800 ${textSizeClass}`}>Privacy & Personalization</h2>
          <p className="text-xs text-slate-500">Control how MOUNAM learns from your usage</p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {feedback.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tracked messages', value: stats.totalMessages },
          { label: 'Total uses logged', value: stats.totalUsages },
          { label: 'Vocabulary items', value: personalVocabularyService.getTotalMessageCount() },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sync notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Local-only storage.</strong> All personalization data is stored only on this device.
        Cloud sync requires Firebase configuration. No data is sent to external servers.
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className={`font-semibold text-slate-700 mb-2 ${textSizeClass}`}>Data Controls</h3>
        <ToggleRow
          label="Usage Personalization"
          description="Track which messages you use most to show smart suggestions in the Quick Access panel."
          value={personEnabled}
          onToggle={togglePersonalization}
          icon={<BarChart2 className="w-4 h-4" />}
        />
        <ToggleRow
          label="Communication History Recording"
          description="Save spoken messages to the Communication History tab."
          value={historyEnabled}
          onToggle={toggleHistory}
          icon={<History className="w-4 h-4" />}
        />
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 className={`font-semibold text-slate-700 mb-3 ${textSizeClass}`}>Data Actions</h3>
        {[
          {
            label: 'Export personalization data',
            description: 'Download your usage history as a JSON backup.',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportPersonalization,
            color: 'text-indigo-600 hover:bg-indigo-50',
          },
          {
            label: 'Export personal vocabulary',
            description: 'Download all your vocabulary collections as JSON.',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportVocabulary,
            color: 'text-teal-600 hover:bg-teal-50',
          },
          {
            label: 'Clear personalization history',
            description: 'Remove all tracked usage data. Smart suggestions will reset.',
            icon: <RefreshCw className="w-4 h-4" />,
            onClick: handleClearPersonalization,
            color: 'text-orange-600 hover:bg-orange-50',
          },
          {
            label: 'Clear all personalization data',
            description: 'Permanently delete usage history and reset the smart panel.',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: handleClearPersonalization,
            color: 'text-red-600 hover:bg-red-50',
          },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${action.color} transition-colors text-left`}
          >
            <span className="flex-shrink-0">{action.icon}</span>
            <div>
              <span className={`font-medium block ${textSizeClass}`}>{action.label}</span>
              <span className="text-xs text-slate-500">{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
