import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  AlertCircle,
  Volume2,
  Square,
  Trash2,
  Edit2,
  Loader2,
  Hand,
  Database,
  Download,
  PlusCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from './Button';
import { handLandmarkService, HandLandmarkPoint } from '../services/handLandmarkService';
import { landmarkNormalizationService } from '../services/landmarkNormalizationService';
import {
  gestureRecognitionService,
  RecognitionResult
} from '../services/gestureRecognitionService';
import {
  TemporalSequenceBuffer,
  SignPrediction,
  SUPPORTED_SIGN_VOCABULARY
} from '../services/signLanguageEngine';
import { signDataCollectorService, SignSample } from '../services/signDataCollectorService';
import { voiceEngine } from '../services/voiceEngine';
import { apiService } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { personalizationService } from '../services/personalizationService';

export interface GestureHistoryItem {
  id: string;
  gesture: string;
  message: string;
  timestamp: string;
  spoken: boolean;
}

interface GestureRecognitionProps {
  onSendToConversation?: (text: string) => void;
}

export const GestureRecognition: React.FC<GestureRecognitionProps> = ({
  onSendToConversation,
}) => {
  const { settings, preferences } = useAccessibility();
  // Modes: 'gesture' = Phase 7 basic candidate gestures, 'sign_vocab' = Phase 8 Sign Vocabulary Engine
  const [engineMode, setEngineMode] = useState<'gesture' | 'sign_vocab'>('sign_vocab');

  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sign Temporal Buffer Ref
  const temporalBufferRef = useRef<TemporalSequenceBuffer>(new TemporalSequenceBuffer(20));

  // Recognition state
  const [, setModelLoaded] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<RecognitionResult | null>(null);
  const [currentSignPred, setCurrentSignPred] = useState<SignPrediction | null>(null);
  const [confirmedMessage, setConfirmedMessage] = useState<string>('Please stop. Wait a moment.');
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Multi-sign sentence accumulator
  const [accumulatedTokens, setAccumulatedTokens] = useState<string[]>([]);
  const [aiPolishing, setAiPolishing] = useState<boolean>(false);

  // Settings & Mappings state
  const [activeTab, setActiveTab] = useState<'detect' | 'mappings' | 'collector' | 'history'>('detect');

  // Dataset Collector state
  const [hasCollectorConsent, setHasCollectorConsent] = useState<boolean>(
    signDataCollectorService.hasConsent()
  );
  const [collectorLabel, setCollectorLabel] = useState<string>('Water');
  const [isRecordingSample, setIsRecordingSample] = useState<boolean>(false);
  const [datasetSamples, setDatasetSamples] = useState<SignSample[]>(() =>
    signDataCollectorService.getSamples()
  );

  // History state
  const [history, setHistory] = useState<GestureHistoryItem[]>(() => {
    const saved = localStorage.getItem('mounam_gesture_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return [
      {
        id: 'gh_1',
        gesture: 'Water (Sign)',
        message: 'Water.',
        timestamp: '10:15 AM',
        spoken: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mounam_gesture_history', JSON.stringify(history));
  }, [history]);

  // Cleanup camera & loop on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      voiceEngine.stop();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCameraLoading(true);

    try {
      await handLandmarkService.initialize();
      setModelLoaded(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setCameraLoading(false);
          startDetectionLoop();
        };
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      let msg = 'Camera access was denied or is not supported by your browser.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera device found on your system.';
      }
      setCameraError(msg);
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    gestureRecognitionService.reset();
    temporalBufferRef.current.clear();
    setCameraActive(false);
    setCameraLoading(false);
  };

  const switchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (cameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 200);
    }
  };

  const startDetectionLoop = () => {
    let lastVideoTime = -1;

    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (ctx && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const detections = handLandmarkService.detectForVideo(video, performance.now());

          if (detections && detections.landmarks && detections.landmarks.length > 0) {
            // Draw skeleton landmarks
            handLandmarkService.drawLandmarks(
              ctx,
              detections.landmarks as HandLandmarkPoint[][],
              canvas.width,
              canvas.height
            );

            const primaryHandLandmarks = detections.landmarks[0] as HandLandmarkPoint[];
            const handednessStr = detections.handedness?.[0]?.[0]?.categoryName || 'Unknown';
            const cleanHandedness: 'Left' | 'Right' | 'Unknown' =
              handednessStr.toLowerCase().includes('left') ? 'Left' :
              handednessStr.toLowerCase().includes('right') ? 'Right' : 'Unknown';

            // Pipeline Step: Landmark Normalization
            const normFeatures = landmarkNormalizationService.processHandLandmarks(
              primaryHandLandmarks,
              cleanHandedness
            );

            // Dataset collection if active
            if (signDataCollectorService.isCurrentlyRecording() && normFeatures) {
              signDataCollectorService.captureFrame(normFeatures);
            }

            if (engineMode === 'sign_vocab') {
              // Sign Language Temporal Sequence Processing
              if (normFeatures) {
                const signPred = temporalBufferRef.current.pushFrame(normFeatures);
                setCurrentSignPred(signPred);

                if (signPred && signPred.confidence >= 0.85) {
                  setConfirmedMessage(signPred.label);
                }
              }
            } else {
              // Static Geometric Gesture Mode (Phase 7)
              const classification = gestureRecognitionService.classify(primaryHandLandmarks, handednessStr);
              setCurrentResult(classification);
              if (classification.stable && classification.assignedMessage) {
                setConfirmedMessage(classification.assignedMessage);
              }
            }
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setCurrentResult(null);
            setCurrentSignPred(null);
            temporalBufferRef.current.clear();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
  };

  const handleSpeak = () => {
    if (!confirmedMessage.trim()) return;
    const lang = preferences.preferredLanguage || 'en';
    voiceEngine.speak(
      confirmedMessage,
      { rate: settings.speechRate || 0.9, pitch: 1.0, volume: 1.0, languageCode: lang },
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
    setIsSpeaking(true);

    if (personalizationService.isHistoryRecordingEnabled()) {
      personalizationService.recordUsage(
        `gest_${confirmedMessage.slice(0, 32).replace(/\s+/g, '_')}`,
        confirmedMessage,
        'gesture',
        lang
      );
      try {
        const saved = JSON.parse(localStorage.getItem('mounam_history') || '[]');
        const next = [
          {
            text: confirmedMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...saved.slice(0, 24),
        ];
        localStorage.setItem('mounam_history', JSON.stringify(next));
      } catch {}
    }

    // Append to history
    setHistory((prev) => [
      {
        id: `gh_${Date.now()}`,
        gesture: currentSignPred ? currentSignPred.label : currentResult?.gestureName || 'Sign',
        message: confirmedMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spoken: true,
      },
      ...prev.slice(0, 24),
    ]);
  };

  const handleStopSpeech = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleAppendToSentence = () => {
    const textToAdd = currentSignPred?.label || currentResult?.assignedMessage || confirmedMessage;
    if (!textToAdd) return;
    setAccumulatedTokens((prev) => [...prev, textToAdd]);
  };

  const handleAiPolishSentence = async () => {
    if (accumulatedTokens.length === 0) return;
    setAiPolishing(true);
    try {
      const res = await apiService.generateSentence({
        selected_words: accumulatedTokens,
        language: 'en',
        style: 'natural',
        context: 'Assembled by Deaf / sign-language user using MOUNAM Vision Sign Recognition'
      });
      if (res && res.sentence) {
        setConfirmedMessage(res.sentence);
        setAccumulatedTokens([]);
      }
    } catch (e) {
      console.warn('AI Polish fallback:', e);
      // Fallback deterministic sentence concatenation
      setConfirmedMessage(accumulatedTokens.join(' ') + '.');
      setAccumulatedTokens([]);
    } finally {
      setAiPolishing(false);
    }
  };

  const handleToggleConsent = () => {
    const next = !hasCollectorConsent;
    setHasCollectorConsent(next);
    signDataCollectorService.setConsent(next);
  };

  const handleToggleRecordSample = () => {
    if (!isRecordingSample) {
      const ok = signDataCollectorService.startRecording(collectorLabel);
      if (ok) setIsRecordingSample(true);
    } else {
      const sample = signDataCollectorService.stopRecording();
      setIsRecordingSample(false);
      if (sample) {
        setDatasetSamples(signDataCollectorService.getSamples());
      }
    }
  };

  const handleDownloadDataset = () => {
    const jsonStr = signDataCollectorService.exportDatasetAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mounam-sign-landmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSample = (id: string) => {
    signDataCollectorService.deleteSample(id);
    setDatasetSamples(signDataCollectorService.getSamples());
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
      {/* 1. Header with Mode & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-purple-50 text-brand-purple-600 rounded-xl">
              <Hand className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sign Language Recognition & Computer Vision
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MediaPipe local landmark normalization & temporal sequence processing.
          </p>
        </div>

        {/* Engine Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-brand-purple-50 p-1 rounded-xl border border-brand-purple-200 text-xs font-bold">
            <button
              onClick={() => setEngineMode('sign_vocab')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                engineMode === 'sign_vocab'
                  ? 'bg-brand-purple-800 text-white shadow-xs'
                  : 'text-brand-purple-900 hover:bg-brand-purple-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sign Vocab Engine</span>
            </button>
            <button
              onClick={() => setEngineMode('gesture')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                engineMode === 'gesture'
                  ? 'bg-brand-purple-800 text-white shadow-xs'
                  : 'text-brand-purple-900 hover:bg-brand-purple-100'
              }`}
            >
              Basic Gestures
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setActiveTab('detect')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'detect' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => setActiveTab('mappings')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'mappings' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Supported Signs
            </button>
            <button
              onClick={() => setActiveTab('collector')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'collector' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>Data Collection ({datasetSamples.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'history' ? 'bg-white text-brand-purple-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB: CAMERA DETECTION & RECOGNITION */}
      {activeTab === 'detect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Video & Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden shadow-soft-md border-2 border-slate-200 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover transform ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none transform ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {!cameraActive && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-brand-purple-300">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Camera is Inactive</h3>
                    <p className="text-xs text-slate-300 max-w-sm mt-1">
                      Camera only activates upon explicit user consent. No images or videos leave your device.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={startCamera}
                    disabled={cameraLoading}
                    icon={cameraLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  >
                    {cameraLoading ? 'Starting MediaPipe...' : 'Start Camera'}
                  </Button>
                </div>
              )}

              {cameraActive && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    {engineMode === 'sign_vocab' ? 'Sign Sequence Tracking' : 'Static Gesture Mode'}
                  </span>
                </div>
              )}
            </div>

            {cameraActive && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                  <button
                    onClick={switchCamera}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip View</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  Normalized relative to wrist & palm size
                </span>
              </div>
            )}

            {cameraError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Camera Access Issue</p>
                  <p className="text-red-700 mt-0.5">{cameraError}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Recognition Output & Sentence Builder Assembly */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Live Detection Indicator */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Recognized Sign Output
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    {engineMode === 'sign_vocab'
                      ? currentSignPred ? currentSignPred.label : 'Waiting for Sign...'
                      : currentResult ? currentResult.gestureName : 'Waiting for Gesture...'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {engineMode === 'sign_vocab'
                      ? currentSignPred
                        ? `Model: ${currentSignPred.modelType} (${currentSignPred.isDynamic ? 'Dynamic Motion' : 'Static Pose'})`
                        : 'Perform supported sign in front of camera'
                      : currentResult?.stable ? 'Stable Gesture Confirmed' : 'Hold gesture steady'}
                  </p>
                </div>

                {(currentSignPred || currentResult) && (
                  <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {Math.round((currentSignPred?.confidence || currentResult?.confidence || 0) * 100)}% Match
                  </div>
                )}
              </div>

              {/* Add to Sentence Accumulator Button */}
              {(currentSignPred || currentResult?.stable) && (
                <button
                  onClick={handleAppendToSentence}
                  className="w-full py-2 bg-brand-purple-100 hover:bg-brand-purple-200 text-brand-purple-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add "{currentSignPred?.label || currentResult?.assignedMessage}" to Message</span>
                </button>
              )}
            </div>

            {/* Assembled Multi-Sign Sentence Strip */}
            {accumulatedTokens.length > 0 && (
              <div className="p-4 bg-brand-purple-50/70 border border-brand-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-purple-900">
                  <span>Assembled Signs ({accumulatedTokens.length}):</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAccumulatedTokens((prev) => prev.slice(0, -1))}
                      className="text-slate-600 hover:underline text-[11px]"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => setAccumulatedTokens([])}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {accumulatedTokens.map((tok, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-brand-purple-300 rounded-lg text-xs font-bold text-slate-800">
                      {tok}
                    </span>
                  ))}
                </div>
                <button
                  onClick={handleAiPolishSentence}
                  disabled={aiPolishing}
                  className="w-full py-2 bg-brand-purple-800 hover:bg-brand-purple-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {aiPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Formulate Natural Sentence with Gemini AI</span>
                </button>
              </div>
            )}

            {/* Spoken Output Review Card */}
            <div className="p-6 bg-gradient-to-br from-brand-purple-50/60 to-white border-2 border-brand-purple-200 rounded-3xl space-y-4 shadow-soft-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-purple-700">
                  Confirmed Communication Text
                </span>
                <span className="text-[11px] font-bold text-slate-400">Review before speaking</span>
              </div>

              {isEditingMessage ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={confirmedMessage}
                    onChange={(e) => setConfirmedMessage(e.target.value)}
                    className="w-full text-base font-bold p-3 rounded-2xl border border-brand-purple-400 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 bg-white text-slate-900 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setIsEditingMessage(false)}>
                      Done Editing
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingMessage(true)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <p className="text-lg font-black text-slate-900">{confirmedMessage}</p>
                </div>
              )}

              {/* Action Buttons: Speak, Stop, Edit */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSpeak}
                  disabled={!confirmedMessage.trim()}
                  icon={<Volume2 className="w-4 h-4" />}
                  className={isSpeaking ? 'animate-pulse ring-4 ring-brand-purple-300' : ''}
                >
                  {isSpeaking ? 'Speaking...' : 'Speak Message'}
                </Button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (confirmedMessage.trim()) {
                      navigator.clipboard?.writeText(confirmedMessage);
                    }
                  }}
                  disabled={!confirmedMessage.trim()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
                >
                  Copy
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmedMessage('')}
                  disabled={!confirmedMessage.trim()}
                  className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
                >
                  Clear
                </button>

                {onSendToConversation && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmedMessage.trim()) {
                        onSendToConversation(confirmedMessage.trim());
                      }
                    }}
                    disabled={!confirmedMessage.trim()}
                    className="px-3.5 py-2 bg-brand-purple-700 hover:bg-brand-purple-800 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
                  >
                    Send to Conversation
                  </button>
                )}

                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingMessage ? 'Save' : 'Edit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: SUPPORTED SIGN VOCABULARY */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Supported Sign Language Vocabulary</h3>
              <p className="text-xs text-slate-500">Currently recognized vocabulary via temporal & geometric models</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_SIGN_VOCABULARY.map((sign) => (
              <div key={sign.signId} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">{sign.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sign.isDynamic ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {sign.isDynamic ? 'Temporal Motion' : 'Static Pose'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{sign.description}</p>
                <span className="text-[10px] font-semibold text-slate-400 capitalize">Category: {sign.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB: TRAINING-READY DATASET COLLECTION TOOL */}
      {activeTab === 'collector' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-black text-slate-900">
                  Consented Sign Landmark Dataset Collector
                </h3>
              </div>
              {datasetSamples.length > 0 && (
                <button
                  onClick={handleDownloadDataset}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON ({datasetSamples.length})</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600">
              This tool records only 3D coordinate landmark sequences for training future ML / Indian Sign Language models.
              Video or photos are never recorded. Data stays 100% local in your browser.
            </p>

            {/* Consent Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <input
                id="consent-check"
                type="checkbox"
                checked={hasCollectorConsent}
                onChange={handleToggleConsent}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="consent-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                I explicitly consent to record mathematical hand landmark points locally for model training.
              </label>
            </div>
          </div>

          {/* Recording Controls */}
          {hasCollectorConsent ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Target Sign Label:</label>
                  <select
                    value={collectorLabel}
                    onChange={(e) => setCollectorLabel(e.target.value)}
                    className="text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  >
                    {SUPPORTED_SIGN_VOCABULARY.map((v) => (
                      <option key={v.signId} value={v.label}>
                        {v.label}
                      </option>
                    ))}
                    <option value="Custom_Sign">Custom Sign Label...</option>
                  </select>
                </div>

                <Button
                  variant={isRecordingSample ? 'danger' : 'primary'}
                  size="md"
                  disabled={!cameraActive}
                  onClick={handleToggleRecordSample}
                  icon={isRecordingSample ? <Square className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                >
                  {isRecordingSample ? 'Stop Recording Sample' : 'Record Sample Landmark Sequence'}
                </Button>
              </div>

              {!cameraActive && (
                <p className="text-xs text-amber-700 font-medium">
                  ⚠️ Please start the camera in the "Camera" tab first before recording landmarks.
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
              Please check the consent box above to activate the landmark data collection tool.
            </div>
          )}

          {/* Recorded Samples Table */}
          {datasetSamples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900">Recorded Local Samples</h4>
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                {datasetSamples.map((s) => (
                  <div key={s.sampleId} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800">{s.signLabel}</span>
                      <span className="text-slate-400 ml-2">({s.framesCount} frames, {s.handedness} hand)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.recordedAt).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleDeleteSample(s.sampleId)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Recent Communication History</h3>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
              No history recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-purple-100 text-brand-purple-800">
                        {item.gesture}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">{item.message}</p>
                  </div>
                  <button
                    onClick={() => {
                      setConfirmedMessage(item.message);
                      setActiveTab('detect');
                      voiceEngine.speak(item.message, { rate: 0.9, pitch: 1.0, volume: 1.0, languageCode: 'en' });
                    }}
                    className="p-2 text-brand-purple-700 hover:bg-brand-purple-50 rounded-xl"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
