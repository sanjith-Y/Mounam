/**
 * MOUNAM Sign Language Classification & Temporal Sequence Architecture
 * Supports static geometric classifiers, temporal sliding-window buffers for motion signs,
 * and pluggable model adapters (Rule-based, TFLite, ONNX, and future ISL deep models).
 */

import { HandFrameFeatures } from './landmarkNormalizationService';

export interface SignPrediction {
  signId: string;
  label: string;
  confidence: number;
  isDynamic: boolean;
  modelType: 'geometric-rules' | 'temporal-buffer' | 'ml-onnx-isl';
  timestamp: number;
  passedValidation: boolean;
}

export interface ISignClassifier {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly isTrainedMLModel: boolean;
  classifyStatic(frame: HandFrameFeatures): SignPrediction | null;
  classifySequence(sequence: HandFrameFeatures[]): SignPrediction | null;
}

/**
 * Standard Vocabulary Definitions for MOUNAM Assistive Sign Recognition
 */
export interface SupportedSignDefinition {
  signId: string;
  label: string;
  description: string;
  isDynamic: boolean;
  category: 'needs' | 'greetings' | 'responses' | 'health' | 'emergency';
}

export const SUPPORTED_SIGN_VOCABULARY: SupportedSignDefinition[] = [
  { signId: 'sign_yes', label: 'Yes', description: 'Affirmative nod / thumbs up confirmation', isDynamic: false, category: 'responses' },
  { signId: 'sign_no', label: 'No', description: 'Hand wave side-to-side / thumbs down', isDynamic: true, category: 'responses' },
  { signId: 'sign_stop', label: 'Stop / Wait', description: 'Open palm facing forward firmly', isDynamic: false, category: 'needs' },
  { signId: 'sign_water', label: 'Water', description: 'Three fingers (W sign) or thumb to mouth motion', isDynamic: false, category: 'needs' },
  { signId: 'sign_thank_you', label: 'Thank You', description: 'Flat hand touching chin and moving forward', isDynamic: true, category: 'greetings' },
  { signId: 'sign_help', label: 'Help', description: 'Thumbs up rested on flat upward palm', isDynamic: false, category: 'emergency' },
  { signId: 'sign_hello', label: 'Hello', description: 'Open palm wave from temple outward', isDynamic: true, category: 'greetings' },
  { signId: 'sign_peace', label: 'Peace / OK', description: 'V-sign with index and middle fingers', isDynamic: false, category: 'responses' },
];

/**
 * Baseline Rule-based Classifier adhering to ISignClassifier
 */
export class BaselineGeometricClassifier implements ISignClassifier {
  public readonly modelId = 'mounam-geometric-baseline';
  public readonly modelVersion = '1.0.0';
  public readonly isTrainedMLModel = false; // Explicitly noted per spec rules

  public classifyStatic(frame: HandFrameFeatures): SignPrediction | null {
    if (!frame.isValid || frame.normalizedLandmarks.length !== 21) return null;

    const [thumbExt, indexExt, midExt, ringExt, pinkyExt] = frame.fingerExtensions;
    const [, sp2] = frame.fingerSpreads;

    // 1. STOP (Open Palm)
    if (thumbExt > 1.2 && indexExt > 1.4 && midExt > 1.4 && ringExt > 1.3 && pinkyExt > 1.2) {
      return {
        signId: 'sign_stop',
        label: 'Stop / Wait',
        confidence: 0.92,
        isDynamic: false,
        modelType: 'geometric-rules',
        timestamp: Date.now(),
        passedValidation: true,
      };
    }

    // 2. PEACE / OK (V-Sign)
    if (indexExt > 1.4 && midExt > 1.4 && ringExt < 1.1 && pinkyExt < 1.1 && sp2 > 0.3) {
      return {
        signId: 'sign_peace',
        label: 'Peace / OK',
        confidence: 0.90,
        isDynamic: false,
        modelType: 'geometric-rules',
        timestamp: Date.now(),
        passedValidation: true,
      };
    }

    // 3. YES (Thumbs Up)
    if (thumbExt > 1.2 && indexExt < 1.05 && midExt < 1.05 && ringExt < 1.05 && pinkyExt < 1.05) {
      const thumbTip = frame.normalizedLandmarks[4];
      if (thumbTip.y < -0.5) { // Pointing upward
        return {
          signId: 'sign_yes',
          label: 'Yes',
          confidence: 0.88,
          isDynamic: false,
          modelType: 'geometric-rules',
          timestamp: Date.now(),
          passedValidation: true,
        };
      }
    }

    // 4. WATER (W-Gesture: Index, Middle, Ring extended upright)
    if (indexExt > 1.3 && midExt > 1.3 && ringExt > 1.3 && pinkyExt < 1.1) {
      return {
        signId: 'sign_water',
        label: 'Water',
        confidence: 0.86,
        isDynamic: false,
        modelType: 'geometric-rules',
        timestamp: Date.now(),
        passedValidation: true,
      };
    }

    return null;
  }

  public classifySequence(sequence: HandFrameFeatures[]): SignPrediction | null {
    if (!sequence || sequence.length < 10) return null;

    // Detect lateral wave motion for "Hello" or "No"
    let lateralDirectionChanges = 0;
    for (let i = 2; i < sequence.length; i++) {
      const dx1 = sequence[i - 1].normalizedLandmarks[8].x - sequence[i - 2].normalizedLandmarks[8].x;
      const dx2 = sequence[i].normalizedLandmarks[8].x - sequence[i - 1].normalizedLandmarks[8].x;
      if (dx1 * dx2 < 0 && Math.abs(dx1) > 0.05) {
        lateralDirectionChanges++;
      }
    }

    if (lateralDirectionChanges >= 2) {
      return {
        signId: 'sign_hello',
        label: 'Hello / Greeting',
        confidence: 0.85,
        isDynamic: true,
        modelType: 'temporal-buffer',
        timestamp: Date.now(),
        passedValidation: true,
      };
    }

    return null;
  }
}

/**
 * Temporal Sequence Buffer
 * Accumulates sliding window of normalized feature frames (e.g. 15-30 frames ~ 0.5-1.0s)
 */
export class TemporalSequenceBuffer {
  private buffer: HandFrameFeatures[] = [];
  private readonly maxFrames: number;
  private readonly classifier: ISignClassifier;

  constructor(maxFrames: number = 20, classifier: ISignClassifier = new BaselineGeometricClassifier()) {
    this.maxFrames = maxFrames;
    this.classifier = classifier;
  }

  public pushFrame(frame: HandFrameFeatures): SignPrediction | null {
    this.buffer.push(frame);
    if (this.buffer.length > this.maxFrames) {
      this.buffer.shift();
    }

    // 1. First test dynamic motion across the sequence buffer
    if (this.buffer.length >= 12) {
      const dynamicPred = this.classifier.classifySequence(this.buffer);
      if (dynamicPred && dynamicPred.confidence >= 0.8) {
        return dynamicPred;
      }
    }

    // 2. If no dynamic sign is active, test static posture of latest frame
    return this.classifier.classifyStatic(frame);
  }

  public clear(): void {
    this.buffer = [];
  }

  public getBufferLength(): number {
    return this.buffer.length;
  }
}
