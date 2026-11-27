/**
 * AlphabetSignRecognition.tsx
 * MOUNAM — Real-Time Hand Sign Recognition (A–Z)
 *
 * Features:
 * - Local MediaPipe 21-landmark detection (up to 2 hands for ISL A–Z)
 * - Consented landmark-only Dataset Collection (A–Z) with session/signer tags
 * - Real MLP Neural Network Training & Evaluation (session-grouped train/test split)
 * - Multi-frame Stability Filter + Unknown/No-Hand Rejection
 * - Editable Word & Sentence Builder + Save to Vocabulary + VoiceEngine TTS (6 languages)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  AlertCircle,
  Volume2,
  Square,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Database,
  Download,
  Upload,
  Sliders,
  Sparkles,
  Hand,
  Loader2,
  BookmarkPlus,
  Space,
  Delete,
  Undo2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Button } from './Button';
import {
  ALPHABET_LETTERS,
  AlphabetLetter,
  ISL_ALPHABET_CONFIG,
} from '../config/islAlphabetConfig';
import { handLandmarkService } from '../services/handLandmarkService';
import { landmarkNormalizationService } from '../services/landmarkNormalizationService';
import { alphabetDatasetService, AlphabetSample } from '../services/alphabetDatasetService';
import {
  alphabetModelService,
  TrainedAlphabetModel,
  MIN_SAMPLES_PER_CLASS,
  RECOMMENDED_SAMPLES_PER_CLASS,
} from '../services/alphabetModelService';
import { AlphabetStabilityFilter } from '../services/alphabetStabilityFilter';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';
import { personalVocabularyService } from '../services/personalVocabularyService';
import { personalizationService } from '../services/personalizationService';

interface AlphabetSignRecognitionProps {
  onOpenEmergency?: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

export const AlphabetSignRecognition: React.FC<AlphabetSignRecognitionProps> = ({
  onOpenEmergency,
}) => {
  const { settings, preferences, updatePreferences, updateSettings } = useAccessibility();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'recognize' | 'collect' | 'train'>('recognize');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  // Latest extracted dual-hand features for capture
  const latestFeaturesRef = useRef<{
    featureVector: number[];
    handCount: 1 | 2;
    detectedHands: Array<'Left' | 'Right' | 'Unknown'>;
  } | null>(null);

  // Stability filter
  const stabilityRef = useRef<AlphabetStabilityFilter>(new AlphabetStabilityFilter());

  // Adjustable stability & threshold settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.72);
  const [stabilityFrames, setStabilityFrames] = useState(6);
  const [cooldownMs, setCooldownMs] = useState(1400);
  const [autoAppend, setAutoAppend] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Live recognition display state
  const [detectedHandsText, setDetectedHandsText] = useState<string>('None');
  const [liveLetter, setLiveLetter] = useState<AlphabetLetter | null>(null);
  const [liveConfidence, setLiveConfidence] = useState<number>(0);
  const [recognitionStatus, setRecognitionStatus] = useState<string>(
    alphabetModelService.isTrained()
      ? 'Start camera to recognize A–Z signs'
      : 'Model not trained yet — collect samples in Dataset tab'
  );
  const [isHandDetected, setIsHandDetected] = useState(false);

  // Message & Word Builder state
  const [messageText, setMessageText] = useState<string>('');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Dataset collection state
  const [hasConsent, setHasConsent] = useState<boolean>(() => alphabetDatasetService.hasConsent());
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter>('A');
  const [samples, setSamples] = useState<AlphabetSample[]>(() =>
    alphabetDatasetService.getSamples()
  );
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}`);
  const [signerTag, setSignerTag] = useState<string>('User 1');
  const [conditionTag, setConditionTag] = useState<string>('Standard Lighting');
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [isBurstCapturing, setIsBurstCapturing] = useState(false);

  // Model & training state
  const [trainedModel, setTrainedModel] = useState<TrainedAlphabetModel | null>(() =>
    alphabetModelService.getModel()
  );
  const [isTraining, setIsTraining] = useState(false);
  const [trainError, setTrainError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for fresh state inside requestAnimationFrame loop
  const autoAppendRef = useRef(autoAppend);
  autoAppendRef.current = autoAppend;
  const confThreshRef = useRef(confidenceThreshold);
  confThreshRef.current = confidenceThreshold;
  const stabFramesRef = useRef(stabilityFrames);
  stabFramesRef.current = stabilityFrames;
  const cooldownRef = useRef(cooldownMs);
  cooldownRef.current = cooldownMs;

  useEffect(() => {
    return () => {
      stopCamera();
      voiceEngine.stop();
    };
  }, []);

  const pushUndoState = (prevText: string) => {
    setUndoStack((prev) => [...prev.slice(-24), prevText]);
  };

  const appendToken = (token: string) => {
    setMessageText((prev) => {
      pushUndoState(prev);
      return prev + token;
    });
  };

  const handleUndo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setMessageText(last);
      return prev.slice(0, -1);
    });
  };

  const handleDeleteLast = () => {
    if (!messageText) return;
    pushUndoState(messageText);
    setMessageText((prev) => prev.slice(0, -1));
  };

  const handleClearText = () => {
    if (!messageText) return;
    pushUndoState(messageText);
    setMessageText('');
  };

  // ── Camera & MediaPipe Loop ────────────────────────────────────────────────
  const startCamera = async (overrideFacing?: 'user' | 'environment') => {
    const targetFacing = overrideFacing || facingMode;
    setCameraError(null);
    setCameraLoading(true);
    stabilityRef.current.reset();

    try {
      await handLandmarkService.initialize();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is unavailable in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraLoading(false);
      requestAnimationFrame(processFrame);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Camera permission denied or camera unavailable.';
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? 'Camera permission denied. Please allow camera access in browser settings and try again.'
          : msg
      );
      setCameraLoading(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    latestFeaturesRef.current = null;
    setCameraActive(false);
    setIsHandDetected(false);
    setDetectedHandsText('None');
    setLiveLetter(null);
    setLiveConfidence(0);
    stabilityRef.current.reset();
  };

  const handleSwitchCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (cameraActive) {
      stopCamera();
      await startCamera(nextFacing);
    }
  };

  const processFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const result = handLandmarkService.detectForVideo(video, performance.now());
      const ctx = canvas.getContext('2d');

      if (result && result.landmarks && result.landmarks.length > 0) {
        if (ctx) {
          handLandmarkService.drawLandmarks(ctx, result.landmarks, canvas.width, canvas.height);
        }

        const handednesses = (result.handednesses || []).map((h) => {
          const cat = h?.[0]?.categoryName;
          return cat === 'Left' || cat === 'Right' ? cat : 'Unknown';
        });

        const extracted = landmarkNormalizationService.extractDualHandAlphabetFeatures(
          result.landmarks,
          handednesses
        );

        if (extracted) {
          latestFeaturesRef.current = {
            featureVector: extracted.featureVector,
            handCount: extracted.handCount,
            detectedHands: extracted.detectedHands,
          };
          setIsHandDetected(true);
          setDetectedHandsText(extracted.detectedHands.join(' + '));

          const prediction = alphabetModelService.predict(
            extracted.featureVector,
            extracted.handCount,
            { confidenceThreshold: confThreshRef.current }
          );

          const stab = stabilityRef.current.update(prediction, {
            stabilityFrames: stabFramesRef.current,
            cooldownMs: cooldownRef.current,
            requireReleaseForDuplicate: true,
          });

          setLiveLetter(stab.liveLetter);
          setLiveConfidence(stab.liveConfidence);
          setRecognitionStatus(stab.statusMessage);

          if (stab.acceptedLetter && autoAppendRef.current) {
            appendToken(stab.acceptedLetter);
          }
        } else {
          latestFeaturesRef.current = null;
          setIsHandDetected(false);
          setDetectedHandsText('Incomplete landmarks');
          setLiveLetter(null);
          setLiveConfidence(0);
          setRecognitionStatus('Hand partially outside frame. Show full hand clearly.');
          stabilityRef.current.notifyNoHand();
        }
      } else {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        latestFeaturesRef.current = null;
        setIsHandDetected(false);
        setDetectedHandsText('None');
        setLiveLetter(null);
        setLiveConfidence(0);
        setRecognitionStatus(
          alphabetModelService.isTrained()
            ? 'No hand detected — place hand(s) in camera frame'
            : 'Model not trained yet — collect samples in Dataset tab'
        );
        stabilityRef.current.notifyNoHand();
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  };

  // ── Dataset Capture Actions ────────────────────────────────────────────────
  const captureSingleSample = () => {
    if (!hasConsent) {
      setCaptureNotice('Please enable dataset collection consent first.');
      return false;
    }
    const latest = latestFeaturesRef.current;
    if (!latest) {
      setCaptureNotice('No valid hand landmarks detected. Show sign clearly in camera.');
      return false;
    }

    const reqHands = ISL_ALPHABET_CONFIG[selectedLetter].handsRequired;
    if (reqHands === 2 && latest.handCount < 2) {
      setCaptureNotice(
        `Letter "${selectedLetter}" is a 2-handed ISL sign. Show both hands clearly.`
      );
      return false;
    }

    const saved = alphabetDatasetService.addSample({
      letter: selectedLetter,
      features: latest.featureVector,
      handCount: latest.handCount,
      handednesses: latest.detectedHands,
      sessionId,
      signerTag,
      conditionTag,
    });

    if (saved) {
      setSamples(alphabetDatasetService.getSamples());
      setCaptureNotice(`Captured sample for "${selectedLetter}" (${latest.handCount} hand(s)).`);
      return true;
    }
    return false;
  };

  const captureBurstSamples = async () => {
    if (isBurstCapturing || !cameraActive) return;
    setIsBurstCapturing(true);
    let captured = 0;
    for (let i = 0; i < 10; i++) {
      if (captureSingleSample()) captured++;
      await new Promise((r) => setTimeout(r, 140));
    }
    setIsBurstCapturing(false);
    setCaptureNotice(`Burst complete: saved ${captured}/10 samples for "${selectedLetter}".`);
  };

  const handleRetakeLast = () => {
    const updated = alphabetDatasetService.deleteLastSampleForLetter(selectedLetter);
    setSamples(updated);
    setCaptureNotice(`Removed last sample for "${selectedLetter}".`);
  };

  const handleClearLetter = (letter: AlphabetLetter) => {
    const updated = alphabetDatasetService.clearLetterSamples(letter);
    setSamples(updated);
    setCaptureNotice(`Cleared all samples for "${letter}".`);
  };

  const handleExportDataset = () => {
    const json = alphabetDatasetService.exportDatasetAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mounam-isl-alphabet-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDataset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const res = alphabetDatasetService.importDatasetFromJson(String(reader.result || ''), true);
        setSamples(alphabetDatasetService.getSamples());
        setCaptureNotice(
          `Imported ${res.importedCount} samples (${res.skippedCount} invalid skipped).`
        );
      } catch {
        setCaptureNotice('Invalid dataset JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Model Training ─────────────────────────────────────────────────────────
  const handleTrainModel = () => {
    setTrainError(null);
    setIsTraining(true);
    setTimeout(() => {
      try {
        const model = alphabetModelService.trainAndEvaluate(samples);
        setTrainedModel(model);
        setRecognitionStatus('Model trained! Start camera to test A–Z recognition.');
      } catch (err) {
        setTrainError(err instanceof Error ? err.message : 'Training failed.');
      } finally {
        setIsTraining(false);
      }
    }, 30);
  };

  // ── TTS & Communication Actions ────────────────────────────────────────────
  const handleSpeak = async (textToSpeak?: string) => {
    const text = (textToSpeak ?? messageText).trim();
    if (!text) return;
    setLastSpokenText(text);
    setIsSpeaking(true);
    personalizationService.recordUsage(text, 'A-Z Sign', preferences.preferredLanguage || 'en');
    try {
      await voiceEngine.speak(text, {
        languageCode: preferences.preferredLanguage || 'en',
        rate: settings.speechRate || 0.9,
        pitch: 1.0,
        volume: 1.0,
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeech = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleSaveToVocabulary = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    const collections = personalVocabularyService.getCollections();
    const targetCol = collections[0]?.id || 'col_daily';
    const added = personalVocabularyService.addMessage(targetCol, trimmed, ['alphabet-sign']);
    if (added) {
      personalVocabularyService.setFavorite(targetCol, added.id, true);
    }
    personalizationService.setFavorite(trimmed, true);
    setSavedNotice('Saved to Favorites & My Vocabulary!');
    setTimeout(() => setSavedNotice(null), 2500);
  };

  // Derived counts
  const countsByLetter = alphabetDatasetService.getCountsByLetter();
  const readyLettersCount = ALPHABET_LETTERS.filter(
    (l) => countsByLetter[l] >= MIN_SAMPLES_PER_CLASS
  ).length;
  const selectedCfg = ISL_ALPHABET_CONFIG[selectedLetter];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple-800 to-indigo-600 flex items-center justify-center text-white shadow-soft-sm">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Real-Time Hand Sign Recognition (A–Z)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                ISL A–Z Landmark Classifier · Local MediaPipe Tracking · Word Builder &amp; Voice Output
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                trainedModel
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {trainedModel
                ? `Model v${trainedModel.modelVersion} · ${trainedModel.classes.length}/26 Letters (${Math.round(
                    trainedModel.evaluation.overallAccuracy * 100
                  )}% Acc)`
                : 'Model Not Trained'}
            </span>
            {onOpenEmergency && (
              <button
                type="button"
                onClick={onOpenEmergency}
                className="px-3 py-1.5 rounded-full text-xs font-black bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> SOS
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('recognize')}
            className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'recognize'
                ? 'bg-brand-purple-800 text-white border-brand-purple-800 shadow-soft-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" /> Live A–Z Recognition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collect')}
            className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'collect'
                ? 'bg-brand-blue-600 text-white border-brand-blue-600 shadow-soft-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" /> Dataset Collection ({samples.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('train')}
            className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'train'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-soft-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" /> Training &amp; Evaluation ({readyLettersCount}/26)
          </button>
        </div>
      </div>

      {/* CAMERA PANEL (Shared on Recognize & Collect tabs) */}
      {(activeTab === 'recognize' || activeTab === 'collect') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Live Camera & Overlay */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  }`}
                />
                <span className="text-sm font-bold text-slate-800">
                  {cameraLoading
                    ? 'Starting Camera & MediaPipe...'
                    : cameraActive
                    ? `Camera Active (${facingMode === 'user' ? 'Front' : 'Rear'})`
                    : 'Camera Off'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!cameraActive ? (
                  <Button
                    onClick={() => startCamera()}
                    disabled={cameraLoading}
                    className="min-h-[44px] px-4 text-sm"
                  >
                    {cameraLoading ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-1.5" />
                    )}
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSwitchCamera}
                      className="min-h-[44px] px-3 text-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-1.5" />
                      Switch ({facingMode === 'user' ? 'Rear' : 'Front'})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={stopCamera}
                      className="min-h-[44px] px-3 text-sm text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <CameraOff className="w-4 h-4 mr-1.5" /> Stop
                    </Button>
                  </>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Camera Unavailable</p>
                  <p className="text-xs mt-0.5">{cameraError}</p>
                </div>
              </div>
            )}

            {/* Video + Canvas Container */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />
              {!cameraActive && !cameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Camera className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-bold text-slate-200">Camera Preview Off</p>
                  <p className="text-xs mt-1 max-w-xs">
                    Processing stays 100% local in your browser. Click Start Camera to begin.
                  </p>
                </div>
              )}
            </div>

            {/* Live Telemetry Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold uppercase text-slate-500">Detected Sign</p>
                <p className="text-2xl font-black text-brand-purple-900">
                  {liveLetter || '—'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold uppercase text-slate-500">Confidence</p>
                <p className="text-2xl font-black text-slate-900">
                  {liveLetter ? `${Math.round(liveConfidence * 100)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-bold uppercase text-slate-500">Hands</p>
                <p className="text-sm font-black text-slate-800 mt-1 truncate">
                  {detectedHandsText}
                </p>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl text-xs font-bold border flex items-center justify-between gap-2 ${
                liveLetter
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isHandDetected
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <span>Status: {recognitionStatus}</span>
              <button
                type="button"
                onClick={() => setShowSettings((s) => !s)}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" /> Tune
              </button>
            </div>

            {showSettings && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">
                      Confidence Threshold ({Math.round(confidenceThreshold * 100)}%)
                    </span>
                    <input
                      type="range"
                      min={0.55}
                      max={0.95}
                      step={0.05}
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">
                      Stability Frames ({stabilityFrames})
                    </span>
                    <input
                      type="range"
                      min={3}
                      max={12}
                      step={1}
                      value={stabilityFrames}
                      onChange={(e) => setStabilityFrames(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">
                      Cooldown ({cooldownMs} ms)
                    </span>
                    <input
                      type="range"
                      min={500}
                      max={2500}
                      step={100}
                      value={cooldownMs}
                      onChange={(e) => setCooldownMs(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAppend}
                    onChange={(e) => setAutoAppend(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Auto-add letter when stable (uncheck for manual Confirm Letter only)
                </label>
              </div>
            )}
          </div>

          {/* Right Panel: Either Word Builder + TTS (recognize) OR Dataset Collector (collect) */}
          {activeTab === 'recognize' ? (
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900">
                    Word &amp; Sentence Builder
                  </h2>
                  {liveLetter && (
                    <Button
                      onClick={() => appendToken(liveLetter)}
                      className="min-h-[40px] px-3 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm "{liveLetter}"
                    </Button>
                  )}
                </div>

                <textarea
                  value={messageText}
                  onChange={(e) => {
                    pushUndoState(messageText);
                    setMessageText(e.target.value);
                  }}
                  rows={4}
                  placeholder="Recognized letters build here (e.g. H E L L O)... You can also type or edit manually."
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-brand-purple-700 focus:outline-none text-lg font-bold text-slate-900 tracking-wide"
                  aria-label="Recognized message text"
                />

                {/* Builder Controls */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => appendToken(' ')}
                    className="min-h-[46px] px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Space className="w-4 h-4" /> Space
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToken('.')}
                    className="min-h-[46px] px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base"
                  >
                    .
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToken('?')}
                    className="min-h-[46px] px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base"
                  >
                    ?
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteLast}
                    className="min-h-[46px] px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Delete className="w-4 h-4" /> Del
                  </button>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="min-h-[46px] px-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Undo2 className="w-4 h-4" /> Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleClearText}
                    className="min-h-[46px] px-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Clear
                  </button>
                </div>

                {/* TTS Language & Speed */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-slate-700 space-y-1">
                      <span>Voice Language</span>
                      <select
                        value={preferences.preferredLanguage || 'en'}
                        onChange={(e) =>
                          updatePreferences({ preferredLanguage: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-bold text-slate-700 space-y-1">
                      <span>Speech Speed ({settings.speechRate.toFixed(2)}x)</span>
                      <input
                        type="range"
                        min={0.5}
                        max={1.5}
                        step={0.05}
                        value={settings.speechRate}
                        onChange={(e) =>
                          updateSettings({ speechRate: parseFloat(e.target.value) })
                        }
                        className="w-full mt-2"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Speak / Stop / Repeat / Save */}
              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleSpeak()}
                    disabled={!messageText.trim() || isSpeaking}
                    className="min-h-[48px] text-sm col-span-2 sm:col-span-1"
                  >
                    <Volume2 className="w-4 h-4 mr-1.5" /> Speak Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStopSpeech}
                    className="min-h-[48px] text-sm"
                  >
                    <Square className="w-4 h-4 mr-1.5" /> Stop
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSpeak(lastSpokenText || messageText)}
                    disabled={!lastSpokenText && !messageText.trim()}
                    className="min-h-[48px] text-sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Repeat
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveToVocabulary}
                  disabled={!messageText.trim()}
                  className="w-full min-h-[44px] px-4 rounded-2xl border border-brand-purple-200 bg-purple-50 hover:bg-purple-100 disabled:opacity-40 text-brand-purple-900 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <BookmarkPlus className="w-4 h-4" /> Save Phrase to Favorites &amp; My Vocabulary
                </button>
                {savedNotice && (
                  <p className="text-xs font-bold text-emerald-700 text-center">{savedNotice}</p>
                )}
              </div>
            </div>
          ) : (
            /* DATASET COLLECTION PANEL */
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">
                  Collect Labeled Samples (A–Z)
                </h2>
                <button
                  type="button"
                  onClick={() => setSessionId(`sess_${Date.now()}`)}
                  className="text-xs font-bold text-brand-blue-700 hover:underline"
                >
                  New Session
                </button>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => {
                    alphabetDatasetService.setConsent(e.target.checked);
                    setHasConsent(e.target.checked);
                  }}
                  className="mt-0.5 w-4 h-4"
                />
                <span>
                  <strong>Consent:</strong> Save numerical 21-point hand landmarks locally in
                  browser storage for model training. No camera photos or videos are saved.
                </span>
              </label>

              {/* Signer & Condition Diversity Tags */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={signerTag}
                  onChange={(e) => setSignerTag(e.target.value)}
                  placeholder="Signer (e.g. User 1)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
                <input
                  type="text"
                  value={conditionTag}
                  onChange={(e) => setConditionTag(e.target.value)}
                  placeholder="Condition (e.g. Bright)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              {/* A–Z Letter Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {ALPHABET_LETTERS.map((letter) => {
                  const count = countsByLetter[letter] || 0;
                  const isSel = selectedLetter === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSelectedLetter(letter)}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        isSel
                          ? 'bg-brand-purple-800 text-white border-brand-purple-800'
                          : count >= RECOMMENDED_SAMPLES_PER_CLASS
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : count >= MIN_SAMPLES_PER_CLASS
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-sm font-black">{letter}</div>
                      <div className="text-[10px] font-bold opacity-80">{count}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Letter Chart Guide */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    Letter "{selectedLetter}" ({selectedCfg.handsRequired}-Handed)
                  </span>
                  {selectedCfg.isDynamic && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      Movement Sign
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{selectedCfg.chartReference}</p>
              </div>

              {/* Capture Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={captureSingleSample}
                  disabled={!cameraActive || !hasConsent || isBurstCapturing}
                  className="min-h-[46px] text-xs"
                >
                  Capture 1 Sample
                </Button>
                <Button
                  variant="outline"
                  onClick={captureBurstSamples}
                  disabled={!cameraActive || !hasConsent || isBurstCapturing}
                  className="min-h-[46px] text-xs"
                >
                  {isBurstCapturing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  Burst 10 Samples
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleRetakeLast}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Retake Last ({selectedLetter})
                </button>
                <button
                  type="button"
                  onClick={() => handleClearLetter(selectedLetter)}
                  className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 font-bold text-red-700"
                >
                  Clear "{selectedLetter}"
                </button>
              </div>

              {captureNotice && (
                <p className="text-xs font-bold text-brand-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  {captureNotice}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* TRAINING & EVALUATION DASHBOARD */}
      {activeTab === 'train' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Model Training &amp; Honest Evaluation
                </h2>
                <p className="text-xs text-slate-500">
                  Trains a 2-layer MLP (157 → 64 → N classes) on collected samples and evaluates on a
                  held-out test split.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleTrainModel}
                  disabled={isTraining || readyLettersCount < 2}
                  className="min-h-[44px] px-4 text-sm"
                >
                  {isTraining ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  )}
                  {trainedModel ? 'Retrain Model' : 'Train Model'}
                </Button>
                <Button variant="outline" onClick={handleExportDataset} className="min-h-[44px] text-xs">
                  <Download className="w-4 h-4 mr-1" /> Export JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] text-xs"
                >
                  <Upload className="w-4 h-4 mr-1" /> Import JSON
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportDataset}
                  className="hidden"
                />
              </div>
            </div>

            {trainError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
                {trainError}
              </div>
            )}

            {trainedModel && (
              <div className="space-y-4">
                {trainedModel.evaluation.leakageWarning && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                    Note: {trainedModel.evaluation.leakageWarning}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[11px] font-bold uppercase text-emerald-700">
                      Held-Out Accuracy
                    </p>
                    <p className="text-2xl font-black text-emerald-900">
                      {Math.round(trainedModel.evaluation.overallAccuracy * 100)}%
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500">
                      Train / Test Samples
                    </p>
                    <p className="text-lg font-black text-slate-900">
                      {trainedModel.evaluation.trainSamplesCount} /{' '}
                      {trainedModel.evaluation.testSamplesCount}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500">Split Method</p>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      {trainedModel.evaluation.splitMethod}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500">Model Version</p>
                    <p className="text-lg font-black text-slate-900">
                      v{trainedModel.modelVersion}
                    </p>
                  </div>
                </div>

                {trainedModel.evaluation.confusedPairs.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                    <p className="font-black text-amber-900 mb-1">
                      Misclassified Letters on Test Split:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trainedModel.evaluation.confusedPairs.slice(0, 10).map((cp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 font-bold text-amber-900"
                        >
                          {cp.expected} → {cp.predicted} ({cp.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* A–Z Status Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Alphabet</th>
                    <th className="py-2.5 px-3">Hands</th>
                    <th className="py-2.5 px-3">Samples</th>
                    <th className="py-2.5 px-3">Model Status</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                  </tr>
                </thead>
                <tbody>
                  {ALPHABET_LETTERS.map((letter) => {
                    const count = countsByLetter[letter] || 0;
                    const metric = trainedModel?.evaluation.perLetter[letter];
                    const cfg = ISL_ALPHABET_CONFIG[letter];
                    const statusLabel =
                      metric?.status === 'trained'
                        ? 'Trained'
                        : metric?.status === 'low_accuracy'
                        ? 'Low Accuracy'
                        : count > 0
                        ? `Needs Data (${count}/${MIN_SAMPLES_PER_CLASS})`
                        : 'Untrained';

                    return (
                      <tr key={letter} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 font-black text-slate-900">{letter}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {cfg.handsRequired}H{cfg.isDynamic ? ' · Motion' : ''}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800">{count}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              metric?.status === 'trained'
                                ? 'bg-emerald-100 text-emerald-800'
                                : metric?.status === 'low_accuracy'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold">
                          {metric?.accuracy !== null && metric?.accuracy !== undefined
                            ? `${Math.round(metric.accuracy * 100)}%`
                            : '—'}
                        </td>
                        <td className="py-2 px-3">
                          {metric?.precision !== null && metric?.precision !== undefined
                            ? `${Math.round(metric.precision * 100)}%`
                            : '—'}
                        </td>
                        <td className="py-2 px-3">
                          {metric?.recall !== null && metric?.recall !== undefined
                            ? `${Math.round(metric.recall * 100)}%`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
