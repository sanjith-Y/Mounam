/**
 * TwoWayCommunication.tsx
 * MOUNAM — Unified Two-Way Sign & Speech Communication Bridge
 *
 * Bridges communication equally in BOTH directions:
 *   SIDE A: Sign Language User → Camera/Landmarks → Text + Optional Confirmed Speech
 *   SIDE B: Hearing Person → Voice (STT) or Typed Text → Validated ISL/ASL Sign Display
 *   CONVERSATION MODE: Live face-to-face turn-based transcript connecting Side A & Side B
 */

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Camera,
  Mic,
  Hand,
  MessageSquare,
  Volume2,
  Trash2,
  Play,
} from 'lucide-react';
import { GestureRecognition } from './GestureRecognition';
import { VoiceToSignCommunication } from './VoiceToSignCommunication';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';

type TwoWayViewMode = 'sign_to_speech' | 'speech_to_sign' | 'conversation';

interface ConversationTurn {
  id: string;
  speaker: 'person_a_sign' | 'person_b_hearing';
  text: string;
  timestamp: string;
}

export const TwoWayCommunication: React.FC = () => {
  const { settings, preferences } = useAccessibility();
  const [viewMode, setViewMode] = useState<TwoWayViewMode>('conversation');
  const [activeTurn, setActiveTurn] = useState<'person_a' | 'person_b' | 'both'>('both');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [replayTextForSign, setReplayTextForSign] = useState<string | undefined>(undefined);

  const addTurn = (speaker: 'person_a_sign' | 'person_b_hearing', text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setConversation((prev) => [
      ...prev,
      {
        id: `turn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        speaker,
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSpeakTurn = (text: string) => {
    voiceEngine.speak(text, {
      rate: settings.speechRate || 0.9,
      pitch: 1.0,
      volume: 1.0,
      languageCode: preferences.preferredLanguage || 'en',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Direction Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple-800 to-brand-blue-600 flex items-center justify-center text-white shadow-soft-sm">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                MOUNAM Two-Way Communication
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Equal two-way bridge: Sign Language ↔ Text, Speech &amp; Verified Sign Display
              </p>
            </div>
          </div>
        </div>

        {/* 3 Clear Direction Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setViewMode('sign_to_speech')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              viewMode === 'sign_to_speech'
                ? 'bg-brand-purple-800 text-white border-brand-purple-800 shadow-soft-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Camera className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Side A: Sign User</p>
              <p className={`text-xs ${viewMode === 'sign_to_speech' ? 'text-purple-100' : 'text-slate-500'}`}>
                SIGN → TEXT / SPEECH
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('speech_to_sign')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              viewMode === 'speech_to_sign'
                ? 'bg-brand-blue-600 text-white border-brand-blue-600 shadow-soft-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Mic className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Side B: Hearing User</p>
              <p className={`text-xs ${viewMode === 'speech_to_sign' ? 'text-blue-100' : 'text-slate-500'}`}>
                SPEECH / TYPE → SIGN / TEXT
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('conversation')}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              viewMode === 'conversation'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-soft-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Face-to-Face</p>
              <p className={`text-xs ${viewMode === 'conversation' ? 'text-emerald-100' : 'text-slate-500'}`}>
                TWO-WAY CONVERSATION
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* MODE 1: SIDE A ONLY (SIGN → TEXT / SPEECH) */}
      {viewMode === 'sign_to_speech' && (
        <GestureRecognition
          onSendToConversation={(text) => {
            addTurn('person_a_sign', text);
            setViewMode('conversation');
          }}
        />
      )}

      {/* MODE 2: SIDE B ONLY (SPEECH / TYPE → SIGN / TEXT) */}
      {viewMode === 'speech_to_sign' && (
        <VoiceToSignCommunication
          externalText={replayTextForSign}
          onSendToConversation={(text) => {
            addTurn('person_b_hearing', text);
            setViewMode('conversation');
          }}
        />
      )}

      {/* MODE 3: FACE-TO-FACE CONVERSATION MODE */}
      {viewMode === 'conversation' && (
        <div className="space-y-6">
          {/* Shared Live Conversation Thread */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Live Face-to-Face Conversation
                </h2>
                <p className="text-xs text-slate-500">
                  Person A signs → text/speech. Person B speaks or types → verified sign display.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTurn('both')}
                    className={`px-2.5 py-1 rounded-lg ${
                      activeTurn === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Both Sides
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTurn('person_a')}
                    className={`px-2.5 py-1 rounded-lg ${
                      activeTurn === 'person_a' ? 'bg-white text-brand-purple-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Person A (Sign)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTurn('person_b')}
                    className={`px-2.5 py-1 rounded-lg ${
                      activeTurn === 'person_b' ? 'bg-white text-brand-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Person B (Voice/Type)
                  </button>
                </div>

                {conversation.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConversation([])}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {conversation.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No conversation turns yet. Use <strong>Send to Conversation</strong> in Side A (Sign User)
                or <strong>Send &amp; Show Signs</strong> in Side B (Hearing User) below.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {conversation.map((turn) => (
                  <div
                    key={turn.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      turn.speaker === 'person_a_sign'
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          turn.speaker === 'person_a_sign' ? 'text-brand-purple-800' : 'text-brand-blue-800'
                        }`}
                      >
                        {turn.speaker === 'person_a_sign'
                          ? 'Person A (Sign User)'
                          : 'Person B (Hearing User)'}{' '}
                        · {turn.timestamp}
                      </span>
                      <p className="text-sm font-bold text-slate-900 break-words">{turn.text}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSpeakTurn(turn.text)}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-brand-purple-700 hover:bg-purple-100"
                        title="Confirm & Speak"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplayTextForSign(turn.text);
                          if (activeTurn === 'person_a') setActiveTurn('person_b');
                        }}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-brand-blue-700 hover:bg-blue-100"
                        title="Show in Sign Display"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side (Desktop) or Focused Turn Panels */}
          <div
            className={`grid grid-cols-1 ${
              activeTurn === 'both' ? '2xl:grid-cols-2' : ''
            } gap-6`}
          >
            {(activeTurn === 'both' || activeTurn === 'person_a') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <Hand className="w-4 h-4 text-brand-purple-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-brand-purple-900">
                    Person A — Sign Language → Text &amp; Speech
                  </span>
                </div>
                <GestureRecognition
                  onSendToConversation={(text) => addTurn('person_a_sign', text)}
                />
              </div>
            )}

            {(activeTurn === 'both' || activeTurn === 'person_b') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <Mic className="w-4 h-4 text-brand-blue-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-brand-blue-900">
                    Person B — Voice / Type → Sign Language Display
                  </span>
                </div>
                <VoiceToSignCommunication
                  externalText={replayTextForSign}
                  onSendToConversation={(text) => {
                    addTurn('person_b_hearing', text);
                    setReplayTextForSign(text);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
