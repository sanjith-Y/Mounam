/**
 * MOUNAM Centralized Voice Engine
 * Handles Text-to-Speech synthesis, speech queue cancellation, voice detection,
 * speech rate/pitch modulation, and regional language mapping.
 */

export interface VoiceLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_VOICE_LANGUAGES: VoiceLanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-US', flag: '🌐' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN', flag: '🇮🇳' },
];

export interface VoiceEngineSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI?: string;
  languageCode: string;
}

export class VoiceEngine {
  private static instance: VoiceEngine;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }
  private isSpeaking: boolean = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  private constructor() {
    this.initVoices();
  }

  public static getInstance(): VoiceEngine {
    if (!VoiceEngine.instance) {
      VoiceEngine.instance = new VoiceEngine();
    }
    return VoiceEngine.instance;
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const update = () => {
      this.voices = window.speechSynthesis.getVoices();
    };

    update();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = update;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public getBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | undefined {
    const all = this.getVoices();
    if (all.length === 0) return undefined;

    const langConfig = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === langCode);
    const targetLocale = langConfig ? langConfig.locale.toLowerCase() : langCode.toLowerCase();
    const prefix = targetLocale.split('-')[0];

    // 1. Exact match locale (e.g., ta-IN)
    let matched = all.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLocale);
    if (matched) return matched;

    // 2. Prefix match (e.g., ta)
    matched = all.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (matched) return matched;

    // 3. Fallback to English voice if regional voice is unavailable in OS
    matched = all.find((v) => v.lang.toLowerCase().startsWith('en'));
    return matched || all[0];
  }

  public isVoiceAvailableForLanguage(langCode: string): boolean {
    const all = this.getVoices();
    const langConfig = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === langCode);
    const targetLocale = langConfig ? langConfig.locale.toLowerCase() : langCode.toLowerCase();
    const prefix = targetLocale.split('-')[0];

    return all.some(
      (v) =>
        v.lang.toLowerCase().replace('_', '-') === targetLocale ||
        v.lang.toLowerCase().startsWith(prefix)
    );
  }

  public speak(
    text: string,
    settings: VoiceEngineSettings,
    onEndCallback?: () => void,
    onErrorCallback?: (err: any) => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return false;
    }

    const trimmed = text.trim();
    if (!trimmed) return false;

    // Cancel any active speech to avoid stutter and queued audio loops
    this.stop();

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = Math.max(0.5, Math.min(settings.rate, 2.0));
    utterance.pitch = Math.max(0.5, Math.min(settings.pitch, 1.5));
    utterance.volume = Math.max(0, Math.min(settings.volume ?? 1.0, 1.0));

    // Resolve language locale
    const langConfig = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === settings.languageCode);
    utterance.lang = langConfig ? langConfig.locale : 'en-US';

    // Assign specific voice
    if (settings.voiceURI) {
      const selectedVoice = this.getVoices().find((v) => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      const best = this.getBestVoiceForLanguage(settings.languageCode);
      if (best) {
        utterance.voice = best;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyListeners(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners(false);
      console.warn('Voice playback event error:', e);
      if (onErrorCallback) onErrorCallback(e);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners(false);
    }
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(speaking: boolean): void {
    this.listeners.forEach((listener) => listener(speaking));
  }
}

export const voiceEngine = VoiceEngine.getInstance();
