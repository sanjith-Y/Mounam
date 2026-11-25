/**
 * MOUNAM Local-Only Sign Dataset Collection Service
 * Secure, privacy-preserving utility for recording landmark sequences with explicit user consent.
 * Stores strictly numerical 3D landmarks (never video, never photos).
 */

import { HandFrameFeatures, landmarkNormalizationService } from './landmarkNormalizationService';

export interface SignSample {
  sampleId: string;
  signLabel: string;
  recordedAt: string;
  framesCount: number;
  handedness: 'Left' | 'Right' | 'Unknown';
  flatLandmarkSequences: number[][]; // [frameIdx][63 floats]
}

const STORAGE_KEY = 'mounam_sign_dataset_samples';

export class SignDataCollectorService {
  private static instance: SignDataCollectorService;
  private isRecording: boolean = false;
  private currentSignLabel: string = 'Water';
  private recordedFrames: HandFrameFeatures[] = [];
  private consented: boolean = false;

  private constructor() {
    this.consented = localStorage.getItem('mounam_dataset_consent') === 'true';
  }

  public static getInstance(): SignDataCollectorService {
    if (!SignDataCollectorService.instance) {
      SignDataCollectorService.instance = new SignDataCollectorService();
    }
    return SignDataCollectorService.instance;
  }

  public hasConsent(): boolean {
    return this.consented;
  }

  public setConsent(hasConsent: boolean): void {
    this.consented = hasConsent;
    localStorage.setItem('mounam_dataset_consent', hasConsent.toString());
  }

  public startRecording(signLabel: string): boolean {
    if (!this.consented) {
      console.warn('Cannot record sign landmarks without explicit user consent.');
      return false;
    }
    this.currentSignLabel = signLabel;
    this.recordedFrames = [];
    this.isRecording = true;
    return true;
  }

  public captureFrame(frame: HandFrameFeatures): void {
    if (!this.isRecording || !frame.isValid) return;
    this.recordedFrames.push(frame);
  }

  public stopRecording(): SignSample | null {
    if (!this.isRecording) return null;
    this.isRecording = false;

    if (this.recordedFrames.length < 5) {
      // Too few frames for a meaningful sample
      this.recordedFrames = [];
      return null;
    }

    const flatSequences = this.recordedFrames.map((f) =>
      landmarkNormalizationService.toFlatVector(f)
    );

    const sample: SignSample = {
      sampleId: `sample_${Date.now()}`,
      signLabel: this.currentSignLabel,
      recordedAt: new Date().toISOString(),
      framesCount: this.recordedFrames.length,
      handedness: this.recordedFrames[0]?.handedness || 'Right',
      flatLandmarkSequences: flatSequences,
    };

    this.saveSample(sample);
    this.recordedFrames = [];
    return sample;
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  public getRecordedFramesCount(): number {
    return this.recordedFrames.length;
  }

  public getSamples(): SignSample[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveSample(sample: SignSample): void {
    const samples = this.getSamples();
    samples.push(sample);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  }

  public deleteSample(sampleId: string): void {
    const samples = this.getSamples().filter((s) => s.sampleId !== sampleId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  }

  public clearAllSamples(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  public exportDatasetAsJson(): string {
    const samples = this.getSamples();
    return JSON.stringify(
      {
        datasetName: 'MOUNAM-Sign-Landmarks-Consented',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        totalSamples: samples.length,
        samples,
      },
      null,
      2
    );
  }

  public getSampleStatsByLabel(): Record<string, number> {
    const samples = this.getSamples();
    const stats: Record<string, number> = {};
    for (const s of samples) {
      stats[s.signLabel] = (stats[s.signLabel] || 0) + 1;
    }
    return stats;
  }
}

export const signDataCollectorService = SignDataCollectorService.getInstance();
