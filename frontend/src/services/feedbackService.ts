/**
 * feedbackService.ts
 * Phase 14 — Real User Pilot Preparation & Feedback System
 *
 * Local-first pilot feedback storage with optional backend sync.
 * Never fabricates entries or claims cloud sync succeeded when offline.
 */

const STORAGE_KEY = 'mounam_pilot_feedback';
const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  '';

export type PilotRole = 'aac_user' | 'deaf_user' | 'caregiver' | 'clinician' | 'tester';
export type IssueCategory =
  | 'none'
  | 'voice_tts'
  | 'speech_to_text'
  | 'gesture_camera'
  | 'sign_communication'
  | 'accessibility'
  | 'navigation'
  | 'performance'
  | 'other';

export interface PilotFeedbackEntry {
  id: string;
  role: PilotRole;
  moduleUsed: string;
  rating: number;
  easeOfUse: number;
  issueCategory: IssueCategory;
  comment: string;
  language: string;
  deviceInfo: string;
  createdAt: string;
  syncedToBackend: boolean;
}

class FeedbackService {
  private entries: PilotFeedbackEntry[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.entries = JSON.parse(raw) as PilotFeedbackEntry[];
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {}
  }

  getEntries(): PilotFeedbackEntry[] {
    return [...this.entries];
  }

  async submitFeedback(input: {
    role: PilotRole;
    moduleUsed: string;
    rating: number;
    easeOfUse: number;
    issueCategory: IssueCategory;
    comment: string;
    language: string;
  }): Promise<PilotFeedbackEntry> {
    const deviceInfo =
      typeof navigator !== 'undefined'
        ? `${navigator.platform || 'unknown'} | ${window.innerWidth}x${window.innerHeight}`
        : 'unknown';

    let synced = false;
    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: input.role,
          module_used: input.moduleUsed,
          rating: input.rating,
          ease_of_use: input.easeOfUse,
          issue_category: input.issueCategory,
          comment: input.comment.trim(),
          language: input.language,
          device_info: deviceInfo,
        }),
      });
      if (res.ok) synced = true;
    } catch {
      synced = false;
    }

    const entry: PilotFeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role: input.role,
      moduleUsed: input.moduleUsed,
      rating: input.rating,
      easeOfUse: input.easeOfUse,
      issueCategory: input.issueCategory,
      comment: input.comment.trim(),
      language: input.language,
      deviceInfo,
      createdAt: new Date().toISOString(),
      syncedToBackend: synced,
    };

    this.entries.unshift(entry);
    this.save();
    return entry;
  }

  exportAsJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: this.entries.length,
        entries: this.entries,
      },
      null,
      2
    );
  }

  clearAll(): void {
    this.entries = [];
    this.save();
  }
}

export const feedbackService = new FeedbackService();
