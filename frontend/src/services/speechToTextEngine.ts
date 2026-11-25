/**
 * MOUNAM Speech Recognition Engine (Voice-to-Text)
 * Wraps browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * Provides microphone permission checks, continuous/interim live transcription,
 * language locale configuration, and comprehensive error handling.
 */

export interface SpeechRecognitionLanguage {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
}

export const SPEECH_RECOGNITION_LANGUAGES: SpeechRecognitionLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English (US/India)', locale: 'en-US' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ் (India)', locale: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (India)', locale: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు (India)', locale: 'te-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം (India)', locale: 'ml-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ (India)', locale: 'kn-IN' },
];

export type SpeechRecognitionStatus =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'permission_denied'
  | 'not_supported'
  | 'error';

export interface SpeechRecognitionCallbacks {
  onTranscriptChange: (transcript: string, isInterim: boolean) => void;
  onStatusChange: (status: SpeechRecognitionStatus, errorMessage?: string) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class SpeechToTextEngine {
  private static instance: SpeechToTextEngine;
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguageLocale: string = 'en-US';
  private callbacks: SpeechRecognitionCallbacks | null = null;
  private finalTranscript: string = '';

  private constructor() {
    this.initRecognition();
  }

  public static getInstance(): SpeechToTextEngine {
    if (!SpeechToTextEngine.instance) {
      SpeechToTextEngine.instance = new SpeechToTextEngine();
    }
    return SpeechToTextEngine.instance;
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  private initRecognition(): void {
    if (!this.isSupported()) return;

    const SpeechRecConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecConstructor();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.callbacks) {
          this.callbacks.onStatusChange('listening');
        }
      };

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            this.finalTranscript += ' ' + item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        const combined = (this.finalTranscript + ' ' + interimText).trim();
        if (this.callbacks) {
          this.callbacks.onTranscriptChange(combined, interimText.length > 0);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error event:', event.error);
        let errorMsg = 'An error occurred during voice recognition.';

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          this.isListening = false;
          if (this.callbacks) {
            this.callbacks.onStatusChange('permission_denied', errorMsg);
          }
          return;
        } else if (event.error === 'no-speech') {
          errorMsg = 'No voice detected. Please speak clearly into your microphone.';
        } else if (event.error === 'network') {
          errorMsg = 'Network error occurred during speech transcription.';
        } else if (event.error === 'language-not-supported') {
          errorMsg = `Voice recognition in ${this.currentLanguageLocale} is not supported by your browser.`;
        }

        this.isListening = false;
        if (this.callbacks) {
          this.callbacks.onStatusChange('error', errorMsg);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.callbacks) {
          this.callbacks.onStatusChange('idle');
        }
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public startListening(
    languageCode: string,
    callbacks: SpeechRecognitionCallbacks,
    initialTranscript: string = ''
  ): boolean {
    if (!this.isSupported()) {
      callbacks.onStatusChange(
        'not_supported',
        'Speech Recognition is not supported by this browser. Please use Chrome, Edge, or Safari, or use typing fallback.'
      );
      return false;
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    this.callbacks = callbacks;
    this.finalTranscript = initialTranscript.trim();

    const langObj = SPEECH_RECOGNITION_LANGUAGES.find((l) => l.code === languageCode);
    this.currentLanguageLocale = langObj ? langObj.locale : 'en-US';
    this.recognition.lang = this.currentLanguageLocale;

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('SpeechRecognition start failed:', err);
      // Already running error
      if (err.name === 'InvalidStateError') {
        this.isListening = true;
        this.callbacks.onStatusChange('listening');
        return true;
      }
      this.callbacks.onStatusChange('error', 'Could not access microphone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop err:', err);
      }
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechToTextEngine = SpeechToTextEngine.getInstance();
