/**
 * personalizationService.ts
 * Phase 11 — Communication Intelligence & Personalization
 *
 * Tracks genuine usage of messages (never prefilled with fake data).
 * Scoring: pinned=100pts | favorite=50pts | frequency×10pts | recency decay.
 * Local-first: persists to localStorage only.
 */

const STORAGE_KEY = 'mounam_personalization_data';
const SETTINGS_KEY = 'mounam_personalization_settings';
const HISTORY_SETTINGS_KEY = 'mounam_history_settings';

export interface UsageRecord {
  messageId: string;
  text: string;
  category: string;
  language: string;
  count: number;
  lastUsed: number; // timestamp ms
  pinned: boolean;
  favorite: boolean;
}

export interface PersonalizationData {
  records: UsageRecord[];
  updatedAt: number;
}

export interface PersonalizationSettings {
  enabled: boolean;
}

export interface HistorySettings {
  recordingEnabled: boolean;
}

class PersonalizationService {
  private data: PersonalizationData = { records: [], updatedAt: Date.now() };
  private settings: PersonalizationSettings = { enabled: true };
  private historySettings: HistorySettings = { recordingEnabled: true };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.data = JSON.parse(raw) as PersonalizationData;
    } catch {
      this.data = { records: [], updatedAt: Date.now() };
    }
    try {
      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings) this.settings = JSON.parse(rawSettings) as PersonalizationSettings;
    } catch {
      this.settings = { enabled: true };
    }
    try {
      const rawHS = localStorage.getItem(HISTORY_SETTINGS_KEY);
      if (rawHS) this.historySettings = JSON.parse(rawHS) as HistorySettings;
    } catch {
      this.historySettings = { recordingEnabled: true };
    }
  }

  private save(): void {
    try {
      this.data.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage quota — silently ignore
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {}
  }

  private saveHistorySettings(): void {
    try {
      localStorage.setItem(HISTORY_SETTINGS_KEY, JSON.stringify(this.historySettings));
    } catch {}
  }

  isEnabled(): boolean {
    return this.settings.enabled;
  }

  setEnabled(value: boolean): void {
    this.settings.enabled = value;
    this.saveSettings();
  }

  isHistoryRecordingEnabled(): boolean {
    return this.historySettings.recordingEnabled;
  }

  setHistoryRecording(value: boolean): void {
    this.historySettings.recordingEnabled = value;
    this.saveHistorySettings();
  }

  /**
   * Record actual usage of a message. No-op when personalization is disabled.
   */
  recordUsage(
    messageId: string,
    text: string,
    category: string,
    language = 'en'
  ): void {
    if (!this.settings.enabled) return;
    const existing = this.data.records.find((r) => r.messageId === messageId);
    if (existing) {
      existing.count += 1;
      existing.lastUsed = Date.now();
      existing.text = text; // update in case text changed
    } else {
      this.data.records.push({
        messageId,
        text,
        category,
        language,
        count: 1,
        lastUsed: Date.now(),
        pinned: false,
        favorite: false,
      });
    }
    this.save();
  }

  private score(r: UsageRecord): number {
    const pinnedPts = r.pinned ? 100 : 0;
    const favPts = r.favorite ? 50 : 0;
    const freqPts = Math.min(r.count * 10, 300);
    // recency decay: full value within 7 days, halved per 7 days after
    const daysSince = (Date.now() - r.lastUsed) / (1000 * 60 * 60 * 24);
    const recencyMultiplier = Math.pow(0.5, daysSince / 7);
    return (pinnedPts + favPts + freqPts) * recencyMultiplier;
  }

  getTopMessages(n = 8): UsageRecord[] {
    return [...this.data.records]
      .sort((a, b) => this.score(b) - this.score(a))
      .slice(0, n);
  }

  getTopCategories(n = 4): string[] {
    const categoryCount: Record<string, number> = {};
    for (const r of this.data.records) {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + r.count;
    }
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([cat]) => cat);
  }

  getAllRecords(): UsageRecord[] {
    return [...this.data.records];
  }

  setPinned(messageId: string, pinned: boolean): void {
    const r = this.data.records.find((rec) => rec.messageId === messageId);
    if (r) { r.pinned = pinned; this.save(); }
  }

  setFavorite(messageId: string, favorite: boolean): void {
    const r = this.data.records.find((rec) => rec.messageId === messageId);
    if (r) { r.favorite = favorite; this.save(); }
  }

  removeFromQuickAccess(messageId: string): void {
    this.data.records = this.data.records.filter((r) => r.messageId !== messageId);
    this.save();
  }

  resetData(): void {
    this.data = { records: [], updatedAt: Date.now() };
    this.save();
  }

  getStats(): { totalMessages: number; totalUsages: number; lastUpdated: number } {
    const totalUsages = this.data.records.reduce((s, r) => s + r.count, 0);
    return {
      totalMessages: this.data.records.length,
      totalUsages,
      lastUpdated: this.data.updatedAt,
    };
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }
}

export const personalizationService = new PersonalizationService();
