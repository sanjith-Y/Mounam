/**
 * personalVocabularyService.ts
 * Phase 11 — Communication Intelligence & Personalization
 *
 * User-managed personal vocabulary collections.
 * Local-first persistence via localStorage.
 * Supports: add/edit/delete collections & messages, search, pin, favorite, export/import JSON.
 */

const STORAGE_KEY = 'mounam_personal_vocabulary';

export interface VocabMessage {
  id: string;
  text: string;
  keywords: string[];
  pinned: boolean;
  favorite: boolean;
  useCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface VocabularyCollection {
  id: string;
  name: string;
  category: string;
  messages: VocabMessage[];
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_CATEGORIES = [
  'Personal',
  'Daily Routine',
  'Family',
  'Food',
  'Health',
  'Education',
  'Work',
  'Social',
  'Travel',
  'Custom',
];

function uid(): string {
  return `voc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class PersonalVocabularyService {
  private collections: VocabularyCollection[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.collections = JSON.parse(raw) as VocabularyCollection[];
    } catch {
      this.collections = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.collections));
    } catch {}
  }

  // ── Collections ─────────────────────────────────────────────────────────

  getCollections(): VocabularyCollection[] {
    return this.collections;
  }

  getCollection(id: string): VocabularyCollection | undefined {
    return this.collections.find((c) => c.id === id);
  }

  addCollection(name: string, category: string): VocabularyCollection {
    const col: VocabularyCollection = {
      id: uid(),
      name: name.trim(),
      category,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.collections.push(col);
    this.save();
    return col;
  }

  updateCollection(id: string, name: string, category: string): boolean {
    const col = this.collections.find((c) => c.id === id);
    if (!col) return false;
    col.name = name.trim();
    col.category = category;
    col.updatedAt = Date.now();
    this.save();
    return true;
  }

  deleteCollection(id: string): boolean {
    const before = this.collections.length;
    this.collections = this.collections.filter((c) => c.id !== id);
    if (this.collections.length !== before) { this.save(); return true; }
    return false;
  }

  // ── Messages ─────────────────────────────────────────────────────────────

  addMessage(
    collectionId: string,
    text: string,
    keywords: string[] = []
  ): VocabMessage | null {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) return null;
    const msg: VocabMessage = {
      id: uid(),
      text: text.trim(),
      keywords,
      pinned: false,
      favorite: false,
      useCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    col.messages.push(msg);
    col.updatedAt = Date.now();
    this.save();
    return msg;
  }

  updateMessage(
    collectionId: string,
    messageId: string,
    text: string,
    keywords: string[]
  ): boolean {
    const col = this.collections.find((c) => c.id === collectionId);
    const msg = col?.messages.find((m) => m.id === messageId);
    if (!msg) return false;
    msg.text = text.trim();
    msg.keywords = keywords;
    msg.updatedAt = Date.now();
    col!.updatedAt = Date.now();
    this.save();
    return true;
  }

  deleteMessage(collectionId: string, messageId: string): boolean {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) return false;
    const before = col.messages.length;
    col.messages = col.messages.filter((m) => m.id !== messageId);
    if (col.messages.length !== before) { col.updatedAt = Date.now(); this.save(); return true; }
    return false;
  }

  setPinned(collectionId: string, messageId: string, pinned: boolean): void {
    const col = this.collections.find((c) => c.id === collectionId);
    const msg = col?.messages.find((m) => m.id === messageId);
    if (msg) { msg.pinned = pinned; msg.updatedAt = Date.now(); this.save(); }
  }

  setFavorite(collectionId: string, messageId: string, favorite: boolean): void {
    const col = this.collections.find((c) => c.id === collectionId);
    const msg = col?.messages.find((m) => m.id === messageId);
    if (msg) { msg.favorite = favorite; msg.updatedAt = Date.now(); this.save(); }
  }

  incrementUseCount(collectionId: string, messageId: string): void {
    const col = this.collections.find((c) => c.id === collectionId);
    const msg = col?.messages.find((m) => m.id === messageId);
    if (msg) { msg.useCount += 1; msg.updatedAt = Date.now(); this.save(); }
  }

  moveMessageUp(collectionId: string, messageId: string): void {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) return;
    const idx = col.messages.findIndex((m) => m.id === messageId);
    if (idx <= 0) return;
    [col.messages[idx - 1], col.messages[idx]] = [col.messages[idx], col.messages[idx - 1]];
    this.save();
  }

  moveMessageDown(collectionId: string, messageId: string): void {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) return;
    const idx = col.messages.findIndex((m) => m.id === messageId);
    if (idx < 0 || idx >= col.messages.length - 1) return;
    [col.messages[idx], col.messages[idx + 1]] = [col.messages[idx + 1], col.messages[idx]];
    this.save();
  }

  // ── Search ────────────────────────────────────────────────────────────────

  searchVocabulary(query: string): Array<{ collection: VocabularyCollection; message: VocabMessage }> {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: Array<{ collection: VocabularyCollection; message: VocabMessage }> = [];
    for (const col of this.collections) {
      for (const msg of col.messages) {
        if (
          msg.text.toLowerCase().includes(q) ||
          col.name.toLowerCase().includes(q) ||
          col.category.toLowerCase().includes(q) ||
          msg.keywords.some((k) => k.toLowerCase().includes(q))
        ) {
          results.push({ collection: col, message: msg });
        }
      }
    }
    return results;
  }

  // ── Export / Import ───────────────────────────────────────────────────────

  exportAsJson(): string {
    return JSON.stringify({ version: 1, collections: this.collections }, null, 2);
  }

  importFromJson(json: string): { success: boolean; imported: number; error?: string } {
    try {
      const parsed = JSON.parse(json) as { version?: number; collections?: VocabularyCollection[] };
      if (!Array.isArray(parsed.collections)) {
        return { success: false, imported: 0, error: 'Invalid format: missing collections array.' };
      }
      let imported = 0;
      for (const col of parsed.collections) {
        if (!col.id || !col.name) continue;
        // avoid duplicate collection IDs — regenerate if collision
        if (this.collections.find((c) => c.id === col.id)) {
          col.id = uid();
          col.messages = col.messages.map((m) => ({ ...m, id: uid() }));
        }
        this.collections.push(col);
        imported++;
      }
      this.save();
      return { success: true, imported };
    } catch (e: unknown) {
      return { success: false, imported: 0, error: String(e) };
    }
  }

  getTotalMessageCount(): number {
    return this.collections.reduce((s, c) => s + c.messages.length, 0);
  }
}

export const personalVocabularyService = new PersonalVocabularyService();
