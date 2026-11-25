import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Globe,
  Loader2,
  Keyboard
} from 'lucide-react';
import { Button } from '../components/Button';
import {
  speechToTextEngine,
  SPEECH_RECOGNITION_LANGUAGES,
  SpeechRecognitionStatus
} from '../services/speechToTextEngine';
import { voiceEngine } from '../services/voiceEngine';
import { apiService } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { personalizationService } from '../services/personalizationService';

export const VoiceToTextSection: React.FC = () => {
  const { settings, preferences, updatePreferences } = useAccessibility();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    preferences.preferredLanguage || 'en'
  );

  useEffect(() => {
    if (preferences.preferredLanguage) {
      setSelectedLanguage(preferences.preferredLanguage);
    }
  }, [preferences.preferredLanguage]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    updatePreferences({ preferredLanguage: lang });
  };
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiStyle, setAiStyle] = useState<'simple' | 'natural' | 'polite'>('natural');
  const [aiError, setAiError] = useState<string | null>(null);
  const isSupported = speechToTextEngine.isSupported();

  useEffect(() => {
    return () => {
      speechToTextEngine.stopListening();
      voiceEngine.stop();
    };
  }, []);

  const handleToggleListening = () => {
    setErrorMessage(null);
    setAiError(null);

    if (status === 'listening') {
      speechToTextEngine.stopListening();
      setStatus('idle');
    } else {
      const ok = speechToTextEngine.startListening(
        selectedLanguage,
        {
          onTranscriptChange: (newTranscript) => {
            setTranscript(newTranscript);
          },
          onStatusChange: (newStatus, err) => {
            setStatus(newStatus);
            if (err) setErrorMessage(err);
          }
        },
        transcript
      );
      if (!ok && !errorMessage) {
        setStatus('error');
      }
    }
  };

  const handleClear = () => {
    speechToTextEngine.stopListening();
    setStatus('idle');
    setTranscript('');
    setErrorMessage(null);
    setAiError(null);
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!transcript.trim()) return;
    voiceEngine.speak(
      transcript,
      {
        rate: settings.speechRate || 0.9,
        pitch: 1.0,
        volume: 1.0,
        languageCode: selectedLanguage
      },
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
    setIsSpeaking(true);
    if (personalizationService.isHistoryRecordingEnabled()) {
      personalizationService.recordUsage(
        `vtt_${transcript.slice(0, 32).replace(/\s+/g, '_')}`,
        transcript,
        'voice_to_text',
        selectedLanguage
      );
    }
  };

  const handleStopSpeech = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleAiEnhance = async () => {
    if (!transcript.trim()) {
      setAiError('Please record or enter text first to enhance with AI.');
      return;
    }
    setAiLoading(true);
    setAiError(null);

    try {
      const words = transcript.trim().split(/\s+/);
      const res = await apiService.generateSentence({
        selected_words: words,
        language: selectedLanguage,
        style: aiStyle,
        context: 'Clarifying and articulating speech-to-text transcript for clear communication'
      });
      if (res && res.sentence) {
        setTranscript(res.sentence);
      }
    } catch (err: any) {
      console.warn('AI Enhance error:', err);
      setAiError(
        err.message || 'Gemini AI unavailable. Kept your original transcription intact.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-blue-50 text-brand-blue-600 rounded-xl">
              <Mic className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Voice-to-Text & Spoken Confirmation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Speak into your microphone. Review, edit, enhance with Gemini AI, and vocalize.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => {
              if (status === 'listening') {
                speechToTextEngine.stopListening();
                setStatus('idle');
              }
              handleLanguageChange(e.target.value);
            }}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
            aria-label="Speech recognition language"
          >
            {SPEECH_RECOGNITION_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Browser Warning if not supported */}
      {!isSupported && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Web Speech Recognition not supported in this browser.</p>
            <p className="text-amber-700 mt-0.5">
              Please use Google Chrome, Microsoft Edge, or Safari, or type your message manually in the editor below.
            </p>
          </div>
        </div>
      )}

      {/* Main Microphone Button & Visual Indicator */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-4">
        <button
          onClick={handleToggleListening}
          disabled={!isSupported}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ${
            status === 'listening'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 ring-red-300 animate-pulse'
              : 'bg-brand-purple-900 text-white hover:bg-brand-purple-800 shadow-md ring-brand-purple-200 disabled:opacity-40 disabled:pointer-events-none'
          }`}
          aria-label={status === 'listening' ? 'Stop listening' : 'Start listening'}
        >
          {status === 'listening' ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}

          {status === 'listening' && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          )}
        </button>

        <div>
          <p className="text-sm font-black text-slate-800">
            {status === 'listening'
              ? 'Listening... Speak clearly into your microphone'
              : 'Tap microphone to start listening'}
          </p>
          <p className="text-xs text-slate-500">
            Language: {SPEECH_RECOGNITION_LANGUAGES.find((l) => l.code === selectedLanguage)?.name}
          </p>
        </div>
      </div>

      {/* Error / Permission Alert */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transcription Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="voice-transcript" className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Transcription (Directly editable)</span>
          </label>
          {transcript && (
            <button
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <textarea
          id="voice-transcript"
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Transcription appears here in real time as you speak, or you can type directly..."
          className="w-full text-base sm:text-lg font-medium rounded-2xl p-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 bg-white text-slate-900 resize-none shadow-xs"
        />
      </div>

      {/* AI Enhancement Toolbar */}
      <div className="p-4 bg-gradient-to-r from-brand-purple-50 via-indigo-50 to-blue-50 border border-brand-purple-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-purple-700" />
          <div>
            <span className="text-xs font-black text-slate-900">
              Optional AI Sentence Enhancement
            </span>
            <p className="text-[11px] text-slate-500">
              Refines incomplete, stuttered, or fragmented speech into a polished sentence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs font-bold text-slate-700">
            {(['simple', 'natural', 'polite'] as const).map((styleOption) => (
              <button
                key={styleOption}
                onClick={() => setAiStyle(styleOption)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  aiStyle === styleOption
                    ? 'bg-brand-purple-800 text-white'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {styleOption}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleAiEnhance}
            disabled={aiLoading || !transcript.trim()}
            icon={
              aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )
            }
          >
            {aiLoading ? 'Enhancing...' : 'Enhance with AI'}
          </Button>
        </div>

        {aiError && (
          <div className="w-full text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
            {aiError}
          </div>
        )}
      </div>

      {/* Action Controls: Speak, Stop, Copy */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="md"
            onClick={handleSpeak}
            disabled={!transcript.trim()}
            icon={<Volume2 className="w-4 h-4" />}
            className={isSpeaking ? 'animate-pulse ring-4 ring-brand-purple-300' : ''}
          >
            {isSpeaking ? 'Speaking Now...' : 'Speak Transcript'}
          </Button>

          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!transcript.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 italic">
          Always confirm transcription before speaking.
        </p>
      </div>
    </div>
  );
};
