/**
 * PersonalVocabularyPanel.tsx
 * Phase 11 — Communication Intelligence & Personalization
 *
 * Collection manager + message grid with search, pin, favorite, reorder, import/export.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Star,
  Pin,
  PinOff,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  Upload,
  Volume2,
  X,
  Check,
  FolderPlus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  personalVocabularyService,
  VocabularyCollection,
  VocabMessage,
  DEFAULT_CATEGORIES,
} from '../services/personalVocabularyService';
import { personalizationService } from '../services/personalizationService';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';

interface PersonalVocabularyPanelProps {
  language?: string;
}

type FeedbackState = { type: 'success' | 'error'; msg: string } | null;

export const PersonalVocabularyPanel: React.FC<PersonalVocabularyPanelProps> = ({
  language = 'en',
}) => {
  const { settings } = useAccessibility();
  const [collections, setCollections] = useState<VocabularyCollection[]>([]);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Collection form
  const [colFormOpen, setColFormOpen] = useState(false);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [colName, setColName] = useState('');
  const [colCategory, setColCategory] = useState(DEFAULT_CATEGORIES[0]);

  // Message form
  const [msgFormOpen, setMsgFormOpen] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState('');
  const [msgKeywords, setMsgKeywords] = useState('');

  const importRef = useRef<HTMLInputElement>(null);

  const textSizeClass =
    settings.textSize === 'large'
      ? 'text-base'
      : settings.textSize === 'extra_large'
      ? 'text-lg'
      : 'text-sm';

  const refresh = () => {
    const cols = personalVocabularyService.getCollections();
    setCollections([...cols]);
    if (selectedColId && !cols.find((c) => c.id === selectedColId)) {
      setSelectedColId(cols[0]?.id ?? null);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const selectedCollection = collections.find((c) => c.id === selectedColId) ?? null;

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults =
    searchQuery.trim().length > 0
      ? personalVocabularyService.searchVocabulary(searchQuery)
      : null;

  // ── Collection CRUD ───────────────────────────────────────────────────────
  const openAddCollection = () => {
    setEditingColId(null);
    setColName('');
    setColCategory(DEFAULT_CATEGORIES[0]);
    setColFormOpen(true);
  };

  const openEditCollection = (col: VocabularyCollection) => {
    setEditingColId(col.id);
    setColName(col.name);
    setColCategory(col.category);
    setColFormOpen(true);
  };

  const saveCollection = () => {
    if (!colName.trim()) return;
    if (editingColId) {
      personalVocabularyService.updateCollection(editingColId, colName, colCategory);
    } else {
      const col = personalVocabularyService.addCollection(colName, colCategory);
      setSelectedColId(col.id);
    }
    setColFormOpen(false);
    refresh();
    showFeedback('success', editingColId ? 'Collection updated.' : 'Collection created.');
  };

  const deleteCollection = (col: VocabularyCollection) => {
    if (!window.confirm(`Delete collection "${col.name}" and all its messages?`)) return;
    personalVocabularyService.deleteCollection(col.id);
    refresh();
    showFeedback('success', 'Collection deleted.');
  };

  // ── Message CRUD ──────────────────────────────────────────────────────────
  const openAddMessage = () => {
    setEditingMsgId(null);
    setMsgText('');
    setMsgKeywords('');
    setMsgFormOpen(true);
  };

  const openEditMessage = (msg: VocabMessage) => {
    setEditingMsgId(msg.id);
    setMsgText(msg.text);
    setMsgKeywords(msg.keywords.join(', '));
    setMsgFormOpen(true);
  };

  const saveMessage = () => {
    if (!msgText.trim() || !selectedColId) return;
    const keywords = msgKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (editingMsgId) {
      personalVocabularyService.updateMessage(selectedColId, editingMsgId, msgText, keywords);
    } else {
      personalVocabularyService.addMessage(selectedColId, msgText, keywords);
    }
    setMsgFormOpen(false);
    refresh();
    showFeedback('success', editingMsgId ? 'Message updated.' : 'Message added.');
  };

  const deleteMessage = (msg: VocabMessage) => {
    if (!selectedColId) return;
    personalVocabularyService.deleteMessage(selectedColId, msg.id);
    refresh();
    showFeedback('success', 'Message deleted.');
  };

  const handleSpeak = (msg: VocabMessage) => {
    setSpeakingId(msg.id);
    voiceEngine.speak(
      msg.text,
      { rate: 1.0, pitch: 1.0, volume: 1.0, languageCode: language },
      () => setSpeakingId(null)
    );
    if (selectedColId) {
      personalVocabularyService.incrementUseCount(selectedColId, msg.id);
      personalizationService.recordUsage(msg.id, msg.text, selectedCollection?.category ?? 'vocabulary', language);
    }
  };

  const handleToggleFavorite = (msg: VocabMessage) => {
    if (!selectedColId) return;
    personalVocabularyService.setFavorite(selectedColId, msg.id, !msg.favorite);
    refresh();
  };

  const handleTogglePin = (msg: VocabMessage) => {
    if (!selectedColId) return;
    personalVocabularyService.setPinned(selectedColId, msg.id, !msg.pinned);
    refresh();
  };

  // ── Import / Export ───────────────────────────────────────────────────────
  const handleExport = () => {
    const json = personalVocabularyService.exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mounam_vocabulary_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'Vocabulary exported.');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const json = evt.target?.result as string;
      const result = personalVocabularyService.importFromJson(json);
      refresh();
      if (result.success) {
        showFeedback('success', `Imported ${result.imported} collection(s).`);
      } else {
        showFeedback('error', result.error ?? 'Import failed.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sortedMessages = selectedCollection
    ? [...selectedCollection.messages].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return b.useCount - a.useCount;
      })
    : [];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-bold text-slate-800 ${textSizeClass}`}>My Vocabulary</h2>
            <p className="text-xs text-slate-500">
              {personalVocabularyService.getTotalMessageCount()} messages across {collections.length} collections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {feedback.msg}
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vocabulary…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults !== null && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-400">No messages matched your search.</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map(({ collection, message }) => (
                <div
                  key={message.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <button
                    onClick={() => handleSpeak(message)}
                    className="p-1.5 bg-teal-100 rounded-lg text-teal-600 hover:bg-teal-200 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-slate-800 font-medium truncate ${textSizeClass}`}>{message.text}</p>
                    <p className="text-xs text-slate-400">{collection.name} · {collection.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      {searchResults === null && (
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Collections list */}
          <div className="w-52 flex-shrink-0 flex flex-col gap-2">
            <button
              onClick={openAddCollection}
              className="flex items-center gap-2 w-full text-sm px-3 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
            >
              <FolderPlus className="w-4 h-4" /> New Collection
            </button>

            {/* Collection form */}
            {colFormOpen && (
              <div className="bg-white rounded-xl border border-teal-200 p-3 shadow-sm space-y-2">
                <input
                  type="text"
                  placeholder="Collection name"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  autoFocus
                />
                <select
                  value={colCategory}
                  onChange={(e) => setColCategory(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={saveCollection}
                    className="flex-1 text-xs bg-teal-600 text-white rounded-lg py-1.5 hover:bg-teal-700 flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => setColFormOpen(false)}
                    className="flex-1 text-xs bg-slate-100 text-slate-600 rounded-lg py-1.5 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1 overflow-y-auto flex-1">
              {collections.length === 0 && (
                <p className="text-xs text-slate-400 p-2">No collections yet. Create one above.</p>
              )}
              {collections.map((col) => (
                <div
                  key={col.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedColId === col.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                  onClick={() => setSelectedColId(col.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{col.name}</p>
                    <p className={`text-xs truncate ${selectedColId === col.id ? 'text-teal-200' : 'text-slate-400'}`}>
                      {col.category} · {col.messages.length}
                    </p>
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditCollection(col); }}
                      className={`p-1 rounded ${selectedColId === col.id ? 'hover:bg-teal-700' : 'hover:bg-slate-100'}`}
                      title="Edit collection"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCollection(col); }}
                      className={`p-1 rounded ${selectedColId === col.id ? 'hover:bg-teal-700 text-red-200' : 'hover:bg-red-50 text-red-400'}`}
                      title="Delete collection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Messages */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {!selectedCollection ? (
              <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-200">
                <div className="text-center p-8">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Select a collection to view messages</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-slate-800 ${textSizeClass}`}>
                    {selectedCollection.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">{selectedCollection.category}</span>
                  </h3>
                  <button
                    onClick={openAddMessage}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Message
                  </button>
                </div>

                {/* Message form */}
                {msgFormOpen && (
                  <div className="bg-white rounded-xl border border-teal-200 p-4 shadow-sm space-y-3">
                    <textarea
                      placeholder="Message text…"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Keywords (comma separated)"
                      value={msgKeywords}
                      onChange={(e) => setMsgKeywords(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveMessage}
                        className="flex-1 text-sm bg-teal-600 text-white rounded-lg py-2 hover:bg-teal-700 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> {editingMsgId ? 'Update' : 'Add'} Message
                      </button>
                      <button
                        onClick={() => setMsgFormOpen(false)}
                        className="text-sm bg-slate-100 text-slate-600 rounded-lg px-4 py-2 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {sortedMessages.length === 0 && !msgFormOpen && (
                  <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="text-center p-8">
                      <Plus className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No messages yet. Add your first one above.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 overflow-y-auto flex-1">
                  {sortedMessages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                        msg.pinned
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 mt-1 flex-shrink-0">
                        <button
                          onClick={() => {
                            personalVocabularyService.moveMessageUp(selectedColId!, msg.id);
                            refresh();
                          }}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            personalVocabularyService.moveMessageDown(selectedColId!, msg.id);
                            refresh();
                          }}
                          disabled={idx === sortedMessages.length - 1}
                          className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-slate-800 ${textSizeClass}`}>{msg.text}</p>
                        {msg.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.keywords.map((kw) => (
                              <span key={kw} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">Used {msg.useCount}×</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleSpeak(msg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            speakingId === msg.id
                              ? 'bg-teal-600 text-white'
                              : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                          }`}
                          title="Speak"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(msg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            msg.favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                          }`}
                          title="Toggle favorite"
                        >
                          <Star className="w-3.5 h-3.5" fill={msg.favorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleTogglePin(msg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            msg.pinned ? 'text-teal-600' : 'text-slate-300 hover:text-teal-500'
                          }`}
                          title={msg.pinned ? 'Unpin' : 'Pin to top'}
                        >
                          {msg.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openEditMessage(msg)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
