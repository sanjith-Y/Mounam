/**
 * MOUNAM A–Z Alphabet Dataset Collection Service
 * Privacy-preserving: stores ONLY normalized numerical landmark features (157 floats),
 * handedness, session/signer tags, and timestamps. Never stores camera images or videos.
 */

import { ALPHABET_LETTERS, AlphabetLetter } from '../config/islAlphabetConfig';

export interface AlphabetSample {
  sampleId: string;
  letter: AlphabetLetter;
  features: number[]; // 157-dim dual-hand normalized feature vector
  handCount: 1 | 2;
  handednesses: Array<'Left' | 'Right' | 'Unknown'>;
  sessionId: string;
  signerTag: string;
  conditionTag: string;
  timestamp: string;
}

export interface AlphabetDatasetExport {
  datasetName: string;
  version: string;
  featureDimension: number;
  exportedAt: string;
  totalSamples: number;
  samples: AlphabetSample[];
}

const STORAGE_KEY = 'mounam_isl_alphabet_dataset_v1';
const CONSENT_KEY = 'mounam_alphabet_dataset_consent';

export class AlphabetDatasetService {
  private static instance: AlphabetDatasetService;

  private constructor() {}

  public static getInstance(): AlphabetDatasetService {
    if (!AlphabetDatasetService.instance) {
      AlphabetDatasetService.instance = new AlphabetDatasetService();
    }
    return AlphabetDatasetService.instance;
  }

  public hasConsent(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(CONSENT_KEY) === 'true';
  }

  public setConsent(consent: boolean): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CONSENT_KEY, consent ? 'true' : 'false');
  }

  public getSamples(): AlphabetSample[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveAll(samples: AlphabetSample[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  }

  public addSample(params: {
    letter: AlphabetLetter;
    features: number[];
    handCount: 1 | 2;
    handednesses: Array<'Left' | 'Right' | 'Unknown'>;
    sessionId: string;
    signerTag?: string;
    conditionTag?: string;
  }): AlphabetSample | null {
    if (!this.hasConsent()) return null;
    if (!params.features || params.features.length !== 157) return null;
    if (params.features.some((v) => !Number.isFinite(v))) return null;

    const sample: AlphabetSample = {
      sampleId: `az_${params.letter}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      letter: params.letter,
      features: params.features.map((v) => Number(v.toFixed(6))),
      handCount: params.handCount,
      handednesses: params.handednesses,
      sessionId: params.sessionId || `sess_${Date.now()}`,
      signerTag: (params.signerTag || 'default_user').trim(),
      conditionTag: (params.conditionTag || 'standard').trim(),
      timestamp: new Date().toISOString(),
    };

    const samples = this.getSamples();
    samples.push(sample);
    this.saveAll(samples);
    return sample;
  }

  public deleteSample(sampleId: string): AlphabetSample[] {
    const updated = this.getSamples().filter((s) => s.sampleId !== sampleId);
    this.saveAll(updated);
    return updated;
  }

  public deleteLastSampleForLetter(letter: AlphabetLetter): AlphabetSample[] {
    const samples = this.getSamples();
    for (let i = samples.length - 1; i >= 0; i--) {
      if (samples[i].letter === letter) {
        samples.splice(i, 1);
        break;
      }
    }
    this.saveAll(samples);
    return samples;
  }

  public clearLetterSamples(letter: AlphabetLetter): AlphabetSample[] {
    const updated = this.getSamples().filter((s) => s.letter !== letter);
    this.saveAll(updated);
    return updated;
  }

  public clearAllSamples(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  public getCountsByLetter(): Record<AlphabetLetter, number> {
    const counts = {} as Record<AlphabetLetter, number>;
    for (const l of ALPHABET_LETTERS) counts[l] = 0;
    for (const s of this.getSamples()) {
      if (counts[s.letter] !== undefined) {
        counts[s.letter]++;
      }
    }
    return counts;
  }

  public getSessionCountsByLetter(): Record<AlphabetLetter, number> {
    const sets = {} as Record<AlphabetLetter, Set<string>>;
    for (const l of ALPHABET_LETTERS) sets[l] = new Set();
    for (const s of this.getSamples()) {
      if (sets[s.letter]) {
        sets[s.letter].add(s.sessionId);
      }
    }
    const counts = {} as Record<AlphabetLetter, number>;
    for (const l of ALPHABET_LETTERS) counts[l] = sets[l].size;
    return counts;
  }

  public exportDatasetAsJson(): string {
    const samples = this.getSamples();
    const payload: AlphabetDatasetExport = {
      datasetName: 'MOUNAM-ISL-Alphabet-A-Z-Landmarks',
      version: '1.0.0',
      featureDimension: 157,
      exportedAt: new Date().toISOString(),
      totalSamples: samples.length,
      samples,
    };
    return JSON.stringify(payload, null, 2);
  }

  public importDatasetFromJson(jsonText: string, merge: boolean = true): {
    importedCount: number;
    skippedCount: number;
  } {
    const parsed = JSON.parse(jsonText);
    const incoming: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.samples)
      ? parsed.samples
      : [];

    const valid: AlphabetSample[] = [];
    let skippedCount = 0;

    for (const item of incoming) {
      if (
        item &&
        typeof item === 'object' &&
        'letter' in item &&
        'features' in item &&
        Array.isArray((item as AlphabetSample).features) &&
        (item as AlphabetSample).features.length === 157 &&
        ALPHABET_LETTERS.includes((item as AlphabetSample).letter) &&
        !(item as AlphabetSample).features.some((v) => typeof v !== 'number' || !Number.isFinite(v))
      ) {
        const s = item as AlphabetSample;
        valid.push({
          sampleId: s.sampleId || `imp_${s.letter}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          letter: s.letter,
          features: s.features,
          handCount: s.handCount === 2 ? 2 : 1,
          handednesses: Array.isArray(s.handednesses) ? s.handednesses : ['Right'],
          sessionId: s.sessionId || `imported_${Date.now()}`,
          signerTag: s.signerTag || 'imported',
          conditionTag: s.conditionTag || 'imported',
          timestamp: s.timestamp || new Date().toISOString(),
        });
      } else {
        skippedCount++;
      }
    }

    const existing = merge ? this.getSamples() : [];
    const existingIds = new Set(existing.map((s) => s.sampleId));
    const deduped = valid.filter((s) => !existingIds.has(s.sampleId));
    this.saveAll([...existing, ...deduped]);

    return { importedCount: deduped.length, skippedCount };
  }
}

export const alphabetDatasetService = AlphabetDatasetService.getInstance();
