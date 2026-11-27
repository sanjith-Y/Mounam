/**
 * MOUNAM Real-Time A–Z Alphabet Neural Classifier, Trainer & Evaluator
 *
 * Architecture:
 *   - Input: 157-dim standardized dual-hand normalized landmark features
 *   - Hidden: 64 units with ReLU activation + L2 regularization
 *   - Output: Softmax over trained alphabet classes
 *   - Optimizer: Mini-batch Adam trained strictly on training split
 *   - Evaluation: Computed strictly on held-out test split (session-grouped when >=2 sessions exist)
 *   - Unknown Rejection: Rejects predictions below confidence or top1-top2 probability margin
 *
 * Never generates fake predictions, never claims training without labeled data.
 */

import { ALPHABET_LETTERS, AlphabetLetter, ISL_ALPHABET_CONFIG } from '../config/islAlphabetConfig';
import { AlphabetSample } from './alphabetDatasetService';

export const FEATURE_DIM = 157;
export const MIN_SAMPLES_PER_CLASS = 5;
export const RECOMMENDED_SAMPLES_PER_CLASS = 15;

export interface PerLetterMetric {
  letter: AlphabetLetter;
  totalCount: number;
  trainCount: number;
  testCount: number;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  status: 'trained' | 'low_accuracy' | 'needs_data' | 'untrained';
}

export interface ConfusedPair {
  expected: AlphabetLetter;
  predicted: AlphabetLetter;
  count: number;
}

export interface ModelEvaluationReport {
  overallAccuracy: number;
  totalSamplesUsed: number;
  trainSamplesCount: number;
  testSamplesCount: number;
  splitMethod: 'session_grouped' | 'stratified_single_session';
  leakageWarning: string | null;
  finalTrainLoss: number;
  epochsTrained: number;
  perLetter: Record<AlphabetLetter, PerLetterMetric>;
  confusionMatrix: Record<string, Record<string, number>>;
  confusedPairs: ConfusedPair[];
}

export interface TrainedAlphabetModel {
  modelVersion: string;
  trainedAt: string;
  featureDim: number;
  hiddenSize: number;
  classes: AlphabetLetter[];
  scalerMean: number[];
  scalerStd: number[];
  w1: number[]; // [FEATURE_DIM * hiddenSize]
  b1: number[]; // [hiddenSize]
  w2: number[]; // [hiddenSize * classes.length]
  b2: number[]; // [classes.length]
  evaluation: ModelEvaluationReport;
}

export interface AlphabetPredictionResult {
  status: 'recognized' | 'uncertain' | 'model_not_trained' | 'invalid_input' | 'insufficient_hands';
  letter: AlphabetLetter | null;
  confidence: number; // 0..1 calibrated softmax probability
  secondBestLetter: AlphabetLetter | null;
  secondBestConfidence: number;
  margin: number;
  reason: string;
}

const MODEL_STORAGE_KEY = 'mounam_isl_alphabet_model_v1';

export class AlphabetModelService {
  private static instance: AlphabetModelService;
  private currentModel: TrainedAlphabetModel | null = null;

  private constructor() {
    this.loadModel();
  }

  public static getInstance(): AlphabetModelService {
    if (!AlphabetModelService.instance) {
      AlphabetModelService.instance = new AlphabetModelService();
    }
    return AlphabetModelService.instance;
  }

  public getModel(): TrainedAlphabetModel | null {
    return this.currentModel;
  }

  public isTrained(): boolean {
    return this.currentModel !== null && this.currentModel.classes.length >= 2;
  }

  public clearModel(): void {
    this.currentModel = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(MODEL_STORAGE_KEY);
    }
  }

  public loadModel(): TrainedAlphabetModel | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(MODEL_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as TrainedAlphabetModel;
      if (
        parsed &&
        parsed.featureDim === FEATURE_DIM &&
        Array.isArray(parsed.classes) &&
        parsed.classes.length >= 2 &&
        Array.isArray(parsed.w1) &&
        Array.isArray(parsed.w2)
      ) {
        this.currentModel = parsed;
        return parsed;
      }
    } catch {
      // ignore corrupted model
    }
    return null;
  }

  private saveModel(model: TrainedAlphabetModel): void {
    this.currentModel = model;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(model));
    }
  }

  /**
   * Split dataset into train and test without session leakage whenever >=2 sessions exist per class.
   */
  public splitTrainTest(samples: AlphabetSample[]): {
    train: AlphabetSample[];
    test: AlphabetSample[];
    activeClasses: AlphabetLetter[];
    splitMethod: 'session_grouped' | 'stratified_single_session';
    leakageWarning: string | null;
  } {
    const byLetter = new Map<AlphabetLetter, AlphabetSample[]>();
    for (const s of samples) {
      if (s.features.length !== FEATURE_DIM) continue;
      if (!byLetter.has(s.letter)) byLetter.set(s.letter, []);
      byLetter.get(s.letter)!.push(s);
    }

    const activeClasses: AlphabetLetter[] = [];
    for (const l of ALPHABET_LETTERS) {
      const list = byLetter.get(l);
      if (list && list.length >= MIN_SAMPLES_PER_CLASS) {
        activeClasses.push(l);
      }
    }

    const train: AlphabetSample[] = [];
    const test: AlphabetSample[] = [];
    let usedSingleSessionFallback = false;

    for (const l of activeClasses) {
      const list = [...(byLetter.get(l) || [])];
      const bySession = new Map<string, AlphabetSample[]>();
      for (const s of list) {
        if (!bySession.has(s.sessionId)) bySession.set(s.sessionId, []);
        bySession.get(s.sessionId)!.push(s);
      }

      if (bySession.size >= 2) {
        // Hold out ~20-30% of whole sessions for test so same-session frames never leak
        const sessions = Array.from(bySession.values()).sort((a, b) => a.length - b.length);
        const testSessionCount = Math.max(1, Math.floor(sessions.length * 0.25));
        for (let i = 0; i < sessions.length; i++) {
          if (i < testSessionCount) {
            test.push(...sessions[i]);
          } else {
            train.push(...sessions[i]);
          }
        }
      } else {
        // Single session fallback: deterministic 80/20 split with explicit warning
        usedSingleSessionFallback = true;
        const testCount = Math.max(1, Math.floor(list.length * 0.2));
        for (let i = 0; i < list.length; i++) {
          if (i < testCount) test.push(list[i]);
          else train.push(list[i]);
        }
      }
    }

    return {
      train,
      test,
      activeClasses,
      splitMethod: usedSingleSessionFallback ? 'stratified_single_session' : 'session_grouped',
      leakageWarning: usedSingleSessionFallback
        ? 'Some letters have samples from only 1 recording session. Collect multiple sessions/users for true cross-session generalization metrics.'
        : null,
    };
  }

  /**
   * Train MLP classifier on labeled samples and evaluate on held-out test set.
   */
  public trainAndEvaluate(
    allSamples: AlphabetSample[],
    options: { epochs?: number; learningRate?: number; hiddenSize?: number } = {}
  ): TrainedAlphabetModel {
    const epochs = options.epochs ?? 80;
    const lr = options.learningRate ?? 0.008;
    const hiddenSize = options.hiddenSize ?? 64;
    const l2Lambda = 0.001;

    const { train, test, activeClasses, splitMethod, leakageWarning } =
      this.splitTrainTest(allSamples);

    if (activeClasses.length < 2) {
      throw new Error(
        `At least 2 alphabet letters with >= ${MIN_SAMPLES_PER_CLASS} samples each are required to train a real classifier.`
      );
    }

    const numClasses = activeClasses.length;
    const classToIdx = new Map<AlphabetLetter, number>();
    activeClasses.forEach((c, idx) => classToIdx.set(c, idx));

    // 1. Fit z-score scaler strictly on training split
    const scalerMean = new Array<number>(FEATURE_DIM).fill(0);
    const scalerStd = new Array<number>(FEATURE_DIM).fill(0);

    for (const s of train) {
      for (let j = 0; j < FEATURE_DIM; j++) {
        scalerMean[j] += s.features[j];
      }
    }
    for (let j = 0; j < FEATURE_DIM; j++) {
      scalerMean[j] /= train.length;
    }

    for (const s of train) {
      for (let j = 0; j < FEATURE_DIM; j++) {
        const d = s.features[j] - scalerMean[j];
        scalerStd[j] += d * d;
      }
    }
    for (let j = 0; j < FEATURE_DIM; j++) {
      scalerStd[j] = Math.sqrt(scalerStd[j] / train.length);
      if (scalerStd[j] < 1e-5) scalerStd[j] = 1.0;
    }

    const standardize = (vec: number[]): number[] => {
      const out = new Array<number>(FEATURE_DIM);
      for (let j = 0; j < FEATURE_DIM; j++) {
        out[j] = (vec[j] - scalerMean[j]) / scalerStd[j];
      }
      return out;
    };

    const trainX = train.map((s) => standardize(s.features));
    const trainY = train.map((s) => classToIdx.get(s.letter)!);

    // 2. Deterministic Xavier/He initialization
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const randn = () => {
      const u1 = Math.max(1e-7, rand());
      const u2 = rand();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };

    const w1Scale = Math.sqrt(2 / FEATURE_DIM);
    const w2Scale = Math.sqrt(2 / hiddenSize);
    const w1 = Array.from({ length: FEATURE_DIM * hiddenSize }, () => randn() * w1Scale);
    const b1 = new Array<number>(hiddenSize).fill(0);
    const w2 = Array.from({ length: hiddenSize * numClasses }, () => randn() * w2Scale);
    const b2 = new Array<number>(numClasses).fill(0);

    // Adam moment buffers
    const mW1 = new Array<number>(w1.length).fill(0);
    const vW1 = new Array<number>(w1.length).fill(0);
    const mb1 = new Array<number>(b1.length).fill(0);
    const vb1 = new Array<number>(b1.length).fill(0);
    const mW2 = new Array<number>(w2.length).fill(0);
    const vW2 = new Array<number>(w2.length).fill(0);
    const mb2 = new Array<number>(b2.length).fill(0);
    const vb2 = new Array<number>(b2.length).fill(0);

    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    let step = 0;
    let finalTrainLoss = 0;

    const batchSize = Math.min(32, trainX.length);
    const indices = Array.from({ length: trainX.length }, (_, i) => i);

    const hPre = new Array<number>(hiddenSize);
    const hAct = new Array<number>(hiddenSize);
    const logits = new Array<number>(numClasses);
    const probs = new Array<number>(numClasses);
    const dLogits = new Array<number>(numClasses);
    const dH = new Array<number>(hiddenSize);

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Fisher-Yates shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let epochLoss = 0;

      for (let start = 0; start < indices.length; start += batchSize) {
        const end = Math.min(start + batchSize, indices.length);
        const curBatch = end - start;

        const gW1 = new Array<number>(w1.length).fill(0);
        const gb1 = new Array<number>(b1.length).fill(0);
        const gW2 = new Array<number>(w2.length).fill(0);
        const gb2 = new Array<number>(b2.length).fill(0);

        for (let b = start; b < end; b++) {
          const idx = indices[b];
          const x = trainX[idx];
          const y = trainY[idx];

          // Forward: Hidden ReLU
          for (let h = 0; h < hiddenSize; h++) {
            let sum = b1[h];
            const offset = h * FEATURE_DIM;
            for (let j = 0; j < FEATURE_DIM; j++) {
              sum += w1[offset + j] * x[j];
            }
            hPre[h] = sum;
            hAct[h] = sum > 0 ? sum : 0;
          }

          // Forward: Output Logits + Softmax
          let maxLogit = -Infinity;
          for (let c = 0; c < numClasses; c++) {
            let sum = b2[c];
            const offset = c * hiddenSize;
            for (let h = 0; h < hiddenSize; h++) {
              sum += w2[offset + h] * hAct[h];
            }
            logits[c] = sum;
            if (sum > maxLogit) maxLogit = sum;
          }

          let expSum = 0;
          for (let c = 0; c < numClasses; c++) {
            const e = Math.exp(logits[c] - maxLogit);
            probs[c] = e;
            expSum += e;
          }
          for (let c = 0; c < numClasses; c++) {
            probs[c] /= expSum;
          }

          epochLoss += -Math.log(Math.max(1e-12, probs[y]));

          // Backward
          for (let c = 0; c < numClasses; c++) {
            dLogits[c] = (probs[c] - (c === y ? 1 : 0)) / curBatch;
          }

          for (let h = 0; h < hiddenSize; h++) dH[h] = 0;

          for (let c = 0; c < numClasses; c++) {
            const dl = dLogits[c];
            gb2[c] += dl;
            const offset = c * hiddenSize;
            for (let h = 0; h < hiddenSize; h++) {
              gW2[offset + h] += dl * hAct[h];
              dH[h] += dl * w2[offset + h];
            }
          }

          for (let h = 0; h < hiddenSize; h++) {
            if (hPre[h] <= 0) continue;
            const dh = dH[h];
            gb1[h] += dh;
            const offset = h * FEATURE_DIM;
            for (let j = 0; j < FEATURE_DIM; j++) {
              gW1[offset + j] += dh * x[j];
            }
          }
        }

        // Adam update with L2 regularization
        step++;
        const bc1 = 1 - Math.pow(beta1, step);
        const bc2 = 1 - Math.pow(beta2, step);

        const adamUpdate = (
          params: number[],
          grads: number[],
          m: number[],
          v: number[],
          applyL2: boolean
        ) => {
          for (let i = 0; i < params.length; i++) {
            const g = grads[i] + (applyL2 ? l2Lambda * params[i] : 0);
            m[i] = beta1 * m[i] + (1 - beta1) * g;
            v[i] = beta2 * v[i] + (1 - beta2) * g * g;
            const mHat = m[i] / bc1;
            const vHat = v[i] / bc2;
            params[i] -= (lr * mHat) / (Math.sqrt(vHat) + eps);
          }
        };

        adamUpdate(w1, gW1, mW1, vW1, true);
        adamUpdate(b1, gb1, mb1, vb1, false);
        adamUpdate(w2, gW2, mW2, vW2, true);
        adamUpdate(b2, gb2, mb2, vb2, false);
      }

      finalTrainLoss = epochLoss / trainX.length;
    }

    // 3. Evaluate strictly on held-out test set
    const confusionMatrix: Record<string, Record<string, number>> = {};
    for (const exp of activeClasses) {
      confusionMatrix[exp] = {};
      for (const pred of activeClasses) {
        confusionMatrix[exp][pred] = 0;
      }
    }

    let correctTotal = 0;
    for (const sample of test) {
      const probsOut = this.forwardProbs(
        sample.features,
        scalerMean,
        scalerStd,
        w1,
        b1,
        w2,
        b2,
        hiddenSize,
        numClasses
      );
      let bestIdx = 0;
      for (let c = 1; c < numClasses; c++) {
        if (probsOut[c] > probsOut[bestIdx]) bestIdx = c;
      }
      const predLetter = activeClasses[bestIdx];
      confusionMatrix[sample.letter][predLetter]++;
      if (predLetter === sample.letter) correctTotal++;
    }

    const overallAccuracy = test.length > 0 ? correctTotal / test.length : 0;

    // Count all samples per letter
    const totalCounts = {} as Record<AlphabetLetter, number>;
    const trainCounts = {} as Record<AlphabetLetter, number>;
    const testCounts = {} as Record<AlphabetLetter, number>;
    for (const l of ALPHABET_LETTERS) {
      totalCounts[l] = 0;
      trainCounts[l] = 0;
      testCounts[l] = 0;
    }
    for (const s of allSamples) totalCounts[s.letter]++;
    for (const s of train) trainCounts[s.letter]++;
    for (const s of test) testCounts[s.letter]++;

    const perLetter = {} as Record<AlphabetLetter, PerLetterMetric>;
    for (const l of ALPHABET_LETTERS) {
      if (!classToIdx.has(l)) {
        perLetter[l] = {
          letter: l,
          totalCount: totalCounts[l],
          trainCount: 0,
          testCount: 0,
          accuracy: null,
          precision: null,
          recall: null,
          f1: null,
          status: totalCounts[l] > 0 ? 'needs_data' : 'untrained',
        };
        continue;
      }

      const tp = confusionMatrix[l][l] || 0;
      let fn = 0;
      let fp = 0;
      for (const other of activeClasses) {
        if (other !== l) {
          fn += confusionMatrix[l][other] || 0;
          fp += confusionMatrix[other][l] || 0;
        }
      }

      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
      const acc = testCounts[l] > 0 ? tp / testCounts[l] : 0;

      perLetter[l] = {
        letter: l,
        totalCount: totalCounts[l],
        trainCount: trainCounts[l],
        testCount: testCounts[l],
        accuracy: acc,
        precision,
        recall,
        f1,
        status: acc >= 0.7 ? 'trained' : 'low_accuracy',
      };
    }

    const confusedPairs: ConfusedPair[] = [];
    for (const exp of activeClasses) {
      for (const pred of activeClasses) {
        if (exp !== pred && confusionMatrix[exp][pred] > 0) {
          confusedPairs.push({
            expected: exp,
            predicted: pred,
            count: confusionMatrix[exp][pred],
          });
        }
      }
    }
    confusedPairs.sort((a, b) => b.count - a.count);

    const prevVersion = this.currentModel?.modelVersion;
    const nextPatch = prevVersion ? parseInt(prevVersion.split('.')[2] || '0', 10) + 1 : 1;

    const model: TrainedAlphabetModel = {
      modelVersion: `1.0.${nextPatch}`,
      trainedAt: new Date().toISOString(),
      featureDim: FEATURE_DIM,
      hiddenSize,
      classes: activeClasses,
      scalerMean,
      scalerStd,
      w1,
      b1,
      w2,
      b2,
      evaluation: {
        overallAccuracy,
        totalSamplesUsed: train.length + test.length,
        trainSamplesCount: train.length,
        testSamplesCount: test.length,
        splitMethod,
        leakageWarning,
        finalTrainLoss: Number(finalTrainLoss.toFixed(4)),
        epochsTrained: epochs,
        perLetter,
        confusionMatrix,
        confusedPairs,
      },
    };

    this.saveModel(model);
    return model;
  }

  private forwardProbs(
    rawFeatures: number[],
    mean: number[],
    std: number[],
    w1: number[],
    b1: number[],
    w2: number[],
    b2: number[],
    hiddenSize: number,
    numClasses: number
  ): number[] {
    const x = new Array<number>(FEATURE_DIM);
    for (let j = 0; j < FEATURE_DIM; j++) {
      x[j] = (rawFeatures[j] - mean[j]) / std[j];
    }

    const hAct = new Array<number>(hiddenSize);
    for (let h = 0; h < hiddenSize; h++) {
      let sum = b1[h];
      const offset = h * FEATURE_DIM;
      for (let j = 0; j < FEATURE_DIM; j++) {
        sum += w1[offset + j] * x[j];
      }
      hAct[h] = sum > 0 ? sum : 0;
    }

    const logits = new Array<number>(numClasses);
    let maxLogit = -Infinity;
    for (let c = 0; c < numClasses; c++) {
      let sum = b2[c];
      const offset = c * hiddenSize;
      for (let h = 0; h < hiddenSize; h++) {
        sum += w2[offset + h] * hAct[h];
      }
      logits[c] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    const probs = new Array<number>(numClasses);
    let expSum = 0;
    for (let c = 0; c < numClasses; c++) {
      const e = Math.exp(logits[c] - maxLogit);
      probs[c] = e;
      expSum += e;
    }
    for (let c = 0; c < numClasses; c++) {
      probs[c] /= expSum;
    }
    return probs;
  }

  /**
   * Real-time inference with strict Out-of-Distribution / Unknown rejection.
   */
  public predict(
    featureVector: number[],
    handCount: 1 | 2,
    options: { confidenceThreshold?: number; marginThreshold?: number } = {}
  ): AlphabetPredictionResult {
    if (!this.currentModel || this.currentModel.classes.length < 2) {
      return {
        status: 'model_not_trained',
        letter: null,
        confidence: 0,
        secondBestLetter: null,
        secondBestConfidence: 0,
        margin: 0,
        reason: 'No trained A–Z model loaded. Collect samples and train in Training Dashboard.',
      };
    }

    if (
      !featureVector ||
      featureVector.length !== FEATURE_DIM ||
      featureVector.some((v) => !Number.isFinite(v))
    ) {
      return {
        status: 'invalid_input',
        letter: null,
        confidence: 0,
        secondBestLetter: null,
        secondBestConfidence: 0,
        margin: 0,
        reason: 'Incomplete or invalid hand landmarks.',
      };
    }

    const confidenceThreshold = options.confidenceThreshold ?? 0.72;
    const marginThreshold = options.marginThreshold ?? 0.15;

    const m = this.currentModel;
    const probs = this.forwardProbs(
      featureVector,
      m.scalerMean,
      m.scalerStd,
      m.w1,
      m.b1,
      m.w2,
      m.b2,
      m.hiddenSize,
      m.classes.length
    );

    let bestIdx = 0;
    let secondIdx = -1;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[bestIdx]) {
        secondIdx = bestIdx;
        bestIdx = i;
      } else if (secondIdx === -1 || probs[i] > probs[secondIdx]) {
        secondIdx = i;
      }
    }

    const bestLetter = m.classes[bestIdx];
    const bestProb = probs[bestIdx];
    const secondLetter = secondIdx >= 0 ? m.classes[secondIdx] : null;
    const secondProb = secondIdx >= 0 ? probs[secondIdx] : 0;
    const margin = bestProb - secondProb;

    // Check hand count requirement from ISL chart config
    const cfg = ISL_ALPHABET_CONFIG[bestLetter];
    if (cfg && cfg.handsRequired === 2 && handCount < 2) {
      return {
        status: 'insufficient_hands',
        letter: null,
        confidence: bestProb,
        secondBestLetter: secondLetter,
        secondBestConfidence: secondProb,
        margin,
        reason: `Sign "${bestLetter}" requires both hands visible.`,
      };
    }

    if (bestProb < confidenceThreshold || margin < marginThreshold) {
      return {
        status: 'uncertain',
        letter: null,
        confidence: bestProb,
        secondBestLetter: secondLetter,
        secondBestConfidence: secondProb,
        margin,
        reason: 'Sign not recognized. Please adjust your hand position and try again.',
      };
    }

    return {
      status: 'recognized',
      letter: bestLetter,
      confidence: bestProb,
      secondBestLetter: secondLetter,
      secondBestConfidence: secondProb,
      margin,
      reason: 'Recognized',
    };
  }
}

export const alphabetModelService = AlphabetModelService.getInstance();
