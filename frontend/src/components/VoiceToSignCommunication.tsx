import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Keyboard,
  Globe,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Hand
} from 'lucide-react';
import { Button } from './Button';
import { speechToTextEngine } from '../services/speechToTextEngine';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';
import { personalizationService } from '../services/personalizationService';
import {
  verifiedSignLibraryService,
  SentenceToSignResult,
  SignLanguageType
} from '../services/verifiedSignLibraryService';

export const VoiceToSignCommunication: React.FC = () => {
  const { settings, preferences } = useAccessibility();
  // Input mode: 'voice' or 'text'
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [signLanguage, setSignLanguage] = useState<SignLanguageType>('ISL');
  const [inputText, setInputText] = useState<string>('I need water and food');

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Sign Matching Output
  const [signResult, setSignResult] = useState<SentenceToSignResult>(() =>
    verifiedSignLibraryService.matchSentenceToSigns('I need water and food', 'ISL')
  );

  // Playback & Sequence Navigation state
  const [currentSignIndex, setCurrentSignIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Filter only tokens that have a matched sign
  const availableSigns = signResult.tokens
    .map((t, idx) => ({ ...t, tokenIndex: idx }))
    .filter((t) => t.hasMatch && t.signAsset);

  // Update sign matching whenever text or sign language changes
  useEffect(() => {
    const res = verifiedSignLibraryService.matchSentenceToSigns(inputText, signLanguage);
    setSignResult(res);
    setCurrentSignIndex(0);
    setIsPlaying(false);
  }, [inputText, signLanguage]);

  // Handle sequence playback timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && availableSigns.length > 0) {
      const delay = Math.round(2500 / playbackSpeed);
      timer = setTimeout(() => {
        if (currentSignIndex < availableSigns.length - 1) {
          setCurrentSignIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentSignIndex, availableSigns.length, playbackSpeed]);

  // Clean up mic on unmount
  useEffect(() => {
    return () => {
      speechToTextEngine.stopListening();
    };
  }, []);

  const handleToggleListening = () => {
    setMicError(null);
    if (isListening) {
      speechToTextEngine.stopListening();
      setIsListening(false);
    } else {
      const ok = speechToTextEngine.startListening(
        preferences.preferredLanguage || 'en',
        {
          onTranscriptChange: (newTranscript) => {
            setInputText(newTranscript);
          },
          onStatusChange: (status, err) => {
            if (status === 'listening') setIsListening(true);
            else if (status === 'idle') setIsListening(false);
            if (err) setMicError(err);
          },
        },
        inputText
      );
      if (!ok) {
        setIsListening(false);
        setMicError('Microphone unavailable or permission denied.');
      }
    }
  };

  const handleSpeakInput = () => {
    if (!inputText.trim()) return;
    const lang = preferences.preferredLanguage || 'en';
    voiceEngine.speak(inputText, {
      rate: settings.speechRate || 0.9,
      pitch: 1.0,
      volume: 1.0,
      languageCode: lang,
    });
    if (personalizationService.isHistoryRecordingEnabled()) {
      personalizationService.recordUsage(
        `vts_${inputText.slice(0, 32).replace(/\s+/g, '_')}`,
        inputText,
        'voice_to_sign',
        lang
      );
    }
  };

  const activeSignItem = availableSigns[currentSignIndex]?.signAsset;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
      {/* 1. Header with Mode & Sign Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-purple-50 text-brand-purple-600 rounded-xl">
              <Hand className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Two-Way Voice-to-Sign Communication
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Speaking users talk or type $\rightarrow$ Spoken words sequence into verified sign language representations.
          </p>
        </div>

        {/* Input Mode & Language Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sign Language Standard Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-brand-purple-600" />
            <select
              value={signLanguage}
              onChange={(e) => setSignLanguage(e.target.value as SignLanguageType)}
              className="bg-transparent focus:outline-none"
            >
              <option value="ISL">Indian Sign Language (ISL - ISLRTC)</option>
              <option value="ASL">American Sign Language (ASL)</option>
            </select>
          </div>

          {/* Voice vs Text Input Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setInputMode('voice')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                inputMode === 'voice' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                inputMode === 'text' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Speaker Input Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {inputMode === 'voice' ? 'Spoken Speech Transcript' : 'Typed Input Message'}
          </label>
          <div className="flex items-center gap-2">
            {inputMode === 'voice' && (
              <Button
                variant={isListening ? 'danger' : 'primary'}
                size="sm"
                onClick={handleToggleListening}
                icon={isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              >
                {isListening ? 'Stop Listening' : 'Start Speaking'}
              </Button>
            )}
            <button
              onClick={handleSpeakInput}
              disabled={!inputText.trim()}
              className="p-2 text-slate-600 hover:text-brand-purple-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
              title="Vocalize this text with VoiceEngine"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type a sentence to see corresponding verified sign representation..."
          className="w-full text-base sm:text-lg font-bold rounded-2xl p-4 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 bg-slate-50 text-slate-900 resize-none shadow-xs"
        />

        {micError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{micError}</span>
          </div>
        )}
      </div>

      {/* 3. Word-by-Word Sign Sequence Progress Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Sentence Breakdown ({signResult.tokens.length} tokens):</span>
          <span>
            {signResult.supportedTokensCount} / {signResult.tokens.length} Signs Verified
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {signResult.tokens.map((token, idx) => {
            const hasMatch = token.hasMatch;
            const isCurrentlyActive =
              availableSigns[currentSignIndex]?.tokenIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  const targetSignIdx = availableSigns.findIndex((s) => s.tokenIndex === idx);
                  if (targetSignIdx !== -1) {
                    setCurrentSignIndex(targetSignIdx);
                    setIsPlaying(false);
                  }
                }}
                disabled={!hasMatch}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isCurrentlyActive
                    ? 'bg-brand-purple-800 text-white shadow-md ring-2 ring-brand-purple-400 scale-105'
                    : hasMatch
                    ? 'bg-purple-50 text-brand-purple-900 border border-brand-purple-200 hover:bg-purple-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <span>{token.originalToken}</span>
                {hasMatch ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-amber-600 font-normal">(No Sign)</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unsupported words disclaimer */}
        {signResult.unsupportedWords.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Words pending verified sign representation: </span>
              <span>{signResult.unsupportedWords.join(', ')}. </span>
              <span className="text-amber-700">Text is retained so no meaning is omitted.</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Large Verified Sign Presentation Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        {/* Main Sign Visual Stage */}
        <div className="md:col-span-8 bg-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 aspect-[16/10] relative shadow-soft-lg">
          {/* Top Stage Header */}
          <div className="flex items-center justify-between text-xs">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-brand-purple-300 font-bold">
              {signLanguage} Visual Representation
            </span>
            <span className="text-slate-400">
              Sign {availableSigns.length > 0 ? currentSignIndex + 1 : 0} of {availableSigns.length}
            </span>
          </div>

          {/* Visual Sign Representation */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
            {activeSignItem ? (
              <>
                {/* Visual Icon / Demonstration Badge */}
                <div className="w-24 h-24 rounded-3xl bg-brand-purple-900/60 border border-brand-purple-400/40 flex items-center justify-center shadow-lg">
                  <Hand className="w-12 h-12 text-brand-purple-300" />
                </div>
                <div>
                  <h3 className="text-3xl sm:text-4xl font-black capitalize tracking-tight text-white">
                    {activeSignItem.word}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-2 font-medium">
                    {activeSignItem.description}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
                <p className="text-sm font-bold">No verified signs available for this sentence</p>
                <p className="text-xs text-slate-500">Try speaking or typing words like "Water", "Food", "Help", "Stop", "Thank you".</p>
              </div>
            )}
          </div>

          {/* Playback Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <button
                disabled={currentSignIndex === 0 || availableSigns.length === 0}
                onClick={() => setCurrentSignIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Sign"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                disabled={availableSigns.length === 0}
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-brand-purple-600 hover:bg-brand-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-40"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
              </button>

              <button
                disabled={currentSignIndex >= availableSigns.length - 1 || availableSigns.length === 0}
                onClick={() => setCurrentSignIndex((prev) => Math.min(availableSigns.length - 1, prev + 1))}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Sign"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentSignIndex(0);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Speed:</span>
              {[0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    playbackSpeed === spd ? 'bg-brand-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Info: Verification Metadata & Source */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verification & Provenance
            </span>

            {activeSignItem ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Authoritative Source:</span>
                  <p className="text-slate-600 mt-0.5">{activeSignItem.verifiedSource}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Dialectal Standard:</span>
                  <p className="text-slate-600 mt-0.5">{activeSignItem.signLanguage} Lexicon</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Status:</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Official Sign Verified
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Select or speak a supported word to review its verified source.
              </p>
            )}
          </div>

          {/* Educational Note */}
          <div className="p-4 bg-brand-purple-50/70 border border-brand-purple-200 rounded-2xl text-xs text-brand-purple-900 space-y-1">
            <span className="font-black text-xs">Sign Language Linguistic Note:</span>
            <p className="text-[11px] text-brand-purple-800 leading-relaxed">
              Sign languages possess their own natural syntax and spatial grammar. MOUNAM renders word-level and phrase-level representations to facilitate two-way communication without fabricating synthetic grammar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
