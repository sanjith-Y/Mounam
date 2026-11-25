/**
 * SmartQuickCommunication.tsx
 * Phase 11 — Communication Intelligence & Personalization
 *
 * Shows top personalised messages based on usage history.
 * Falls back gracefully when no data exists yet.
 * Never auto-speaks anything.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  Star,
  Pin,
  PinOff,
  X,
  Info,
  RefreshCw,
} from 'lucide-react';
import { personalizationService, UsageRecord } from '../services/personalizationService';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';
interface SmartQuickCommunicationProps {
  language?: string;
  onMessageSpoken?: (text: string) => void;
}

export const SmartQuickCommunication: React.FC<SmartQuickCommunicationProps> = ({
  language = 'en',
  onMessageSpoken,
}) => {
  const { settings } = useAccessibility();
  const [topMessages, setTopMessages] = useState<UsageRecord[]>([]);
  const [isEnabled, setIsEnabled] = useState(personalizationService.isEnabled());
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (personalizationService.isEnabled()) {
      setTopMessages(personalizationService.getTopMessages(8));
    } else {
      setTopMessages([]);
    }
    setIsEnabled(personalizationService.isEnabled());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSpeak = (record: UsageRecord) => {
    setSpeakingId(record.messageId);
    voiceEngine.speak(
      record.text,
      { rate: 1.0, pitch: 1.0, volume: 1.0, languageCode: language },
      () => { setSpeakingId(null); }
    );
    personalizationService.recordUsage(record.messageId, record.text, record.category, language);
    onMessageSpoken?.(record.text);
  };

  const handleToggleFavorite = (record: UsageRecord) => {
    personalizationService.setFavorite(record.messageId, !record.favorite);
    refresh();
  };

  const handleTogglePin = (record: UsageRecord) => {
    personalizationService.setPinned(record.messageId, !record.pinned);
    refresh();
  };

  const handleRemove = (record: UsageRecord) => {
    personalizationService.removeFromQuickAccess(record.messageId);
    refresh();
  };

  const toggleEnabled = () => {
    personalizationService.setEnabled(!isEnabled);
    refresh();
  };

  const btnSizeClass =
    settings.buttonSize === 'large'
      ? 'min-h-[64px] text-base'
      : settings.buttonSize === 'extra_large'
      ? 'min-h-[80px] text-lg'
      : 'min-h-[52px] text-sm';

  const textSizeClass =
    settings.textSize === 'large'
      ? 'text-base'
      : settings.textSize === 'extra_large'
      ? 'text-lg'
      : 'text-sm';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className={`font-semibold text-slate-800 ${textSizeClass}`}>Smart Quick Communication</h2>
            <p className="text-xs text-slate-500">Your most-used messages, ranked by usage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleEnabled}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              isEnabled
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isEnabled ? 'Personalization On' : 'Personalization Off'}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isEnabled && (
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-slate-600 ${textSizeClass}`}>
              Personalization is off. Enable it to see your most-used messages here automatically.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All personalization data stays on your device — nothing is sent to servers.
            </p>
          </div>
        </div>
      )}

      {isEnabled && topMessages.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-slate-600 ${textSizeClass}`}>
              No usage data yet. Start using the Express Communication Dashboard, Quick Phrases, or Emergency panel
              and your most-used messages will appear here automatically.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Messages are ranked by frequency, recency, pins, and favorites.
            </p>
          </div>
        </div>
      )}

      {isEnabled && topMessages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topMessages.map((record) => (
            <div
              key={record.messageId}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all ${
                record.pinned
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              {/* Speak button (primary action — full left area) */}
              <button
                onClick={() => handleSpeak(record)}
                className={`flex-1 text-left font-medium text-slate-800 ${btnSizeClass} rounded-lg flex items-center px-2 hover:bg-white/60 transition-colors`}
                title={`Speak: ${record.text}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      speakingId === record.messageId
                        ? 'bg-indigo-600'
                        : 'bg-indigo-100'
                    }`}
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 ${
                        speakingId === record.messageId ? 'text-white' : 'text-indigo-600'
                      }`}
                    />
                  </div>
                  <span className={`${textSizeClass} leading-snug`}>{record.text}</span>
                </div>
              </button>

              {/* Controls */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggleFavorite(record)}
                  className={`p-1 rounded transition-colors ${
                    record.favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                  }`}
                  title={record.favorite ? 'Remove from favorites' : 'Mark as favorite'}
                >
                  <Star className="w-3.5 h-3.5" fill={record.favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleTogglePin(record)}
                  className={`p-1 rounded transition-colors ${
                    record.pinned ? 'text-purple-600' : 'text-slate-300 hover:text-purple-400'
                  }`}
                  title={record.pinned ? 'Unpin' : 'Pin to top'}
                >
                  {record.pinned ? (
                    <PinOff className="w-3.5 h-3.5" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleRemove(record)}
                  className="p-1 rounded text-slate-300 hover:text-red-400 transition-colors"
                  title="Remove from quick access"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Usage badge */}
              <span className="absolute top-1.5 right-1.5 text-xs text-slate-400">
                ×{record.count}
              </span>
            </div>
          ))}
        </div>
      )}

      {isEnabled && topMessages.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-center">
          Showing top {topMessages.length} messages · ranked by frequency &amp; recency
        </p>
      )}
    </div>
  );
};
