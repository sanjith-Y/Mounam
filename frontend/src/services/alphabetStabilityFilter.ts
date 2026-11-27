/**
 * MOUNAM Recognition Stability Filter
 * Prevents rapid letter flickering via multi-frame voting, confidence gating,
 * cooldown periods, and duplicate-letter debouncing.
 */

import { AlphabetLetter } from '../config/islAlphabetConfig';
import { AlphabetPredictionResult } from './alphabetModelService';

export interface StabilityConfig {
  stabilityFrames: number; // consecutive/windowed frames required to lock a letter (default 6)
  cooldownMs: number;      // minimum ms between accepted letters (default 1400)
  requireReleaseForDuplicate: boolean; // must briefly drop/change before repeating same letter
}

export interface StabilityOutput {
  liveLetter: AlphabetLetter | null;
  liveConfidence: number;
  acceptedLetter: AlphabetLetter | null; // Non-null ONLY on the frame a stable letter commits
  stableCount: number;
  statusMessage: string;
  isStable: boolean;
}

export class AlphabetStabilityFilter {
  private window: Array<AlphabetLetter | null> = [];
  private lastAcceptedLetter: AlphabetLetter | null = null;
  private lastAcceptedAt: number = 0;
  private releasedSinceLastAccept: boolean = true;

  public reset(): void {
    this.window = [];
    this.lastAcceptedLetter = null;
    this.lastAcceptedAt = 0;
    this.releasedSinceLastAccept = true;
  }

  public notifyNoHand(): void {
    this.window = [];
    this.releasedSinceLastAccept = true;
  }

  public update(
    prediction: AlphabetPredictionResult,
    config: StabilityConfig,
    nowMs: number = Date.now()
  ): StabilityOutput {
    const candidate = prediction.status === 'recognized' ? prediction.letter : null;

    if (candidate === null || candidate !== this.lastAcceptedLetter) {
      this.releasedSinceLastAccept = true;
    }

    this.window.push(candidate);
    if (this.window.length > config.stabilityFrames) {
      this.window.shift();
    }

    if (candidate === null) {
      return {
        liveLetter: null,
        liveConfidence: prediction.confidence,
        acceptedLetter: null,
        stableCount: 0,
        statusMessage: prediction.reason,
        isStable: false,
      };
    }

    // Count how many frames in the window match the current candidate
    const matchCount = this.window.filter((l) => l === candidate).length;
    const isStable =
      this.window.length >= config.stabilityFrames && matchCount >= config.stabilityFrames;

    if (!isStable) {
      return {
        liveLetter: candidate,
        liveConfidence: prediction.confidence,
        acceptedLetter: null,
        stableCount: matchCount,
        statusMessage: `Hold steady (${matchCount}/${config.stabilityFrames})`,
        isStable: false,
      };
    }

    const elapsed = nowMs - this.lastAcceptedAt;
    if (elapsed < config.cooldownMs) {
      return {
        liveLetter: candidate,
        liveConfidence: prediction.confidence,
        acceptedLetter: null,
        stableCount: matchCount,
        statusMessage: 'Cooldown active — hold or release',
        isStable: true,
      };
    }

    if (
      config.requireReleaseForDuplicate &&
      candidate === this.lastAcceptedLetter &&
      !this.releasedSinceLastAccept
    ) {
      return {
        liveLetter: candidate,
        liveConfidence: prediction.confidence,
        acceptedLetter: null,
        stableCount: matchCount,
        statusMessage: `Letter "${candidate}" already added — relax hand briefly to repeat`,
        isStable: true,
      };
    }

    // Commit letter!
    this.lastAcceptedLetter = candidate;
    this.lastAcceptedAt = nowMs;
    this.releasedSinceLastAccept = false;

    return {
      liveLetter: candidate,
      liveConfidence: prediction.confidence,
      acceptedLetter: candidate,
      stableCount: matchCount,
      statusMessage: 'Recognized',
      isStable: true,
    };
  }
}
