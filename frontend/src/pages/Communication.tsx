import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  Square,
  RotateCcw,
  Trash2,
  Star,
  Plus,
  Edit2,
  Edit3,
  X,
  ArrowLeft,
  AlertTriangle,
  Smile,
  Activity,
  Home,
  Users,
  Droplets,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiService } from '../services/api';
import { personalizationService } from '../services/personalizationService';
import { voiceEngine } from '../services/voiceEngine';
import { useAccessibility } from '../context/AccessibilityContext';

// Predefined building block tokens for the sentence builder
const WORD_TOKENS = [
  // Pronouns
  { id: 't_i', text: 'I', category: 'pronoun', icon: '👤' },
  { id: 't_you', text: 'You', category: 'pronoun', icon: '👉' },
  { id: 't_my', text: 'My', category: 'pronoun', icon: '🏷️' },
  { id: 't_please', text: 'Please', category: 'pronoun', icon: '🙏' },

  // Verbs / Actions
  { id: 't_want', text: 'Want', category: 'verb', icon: '🤲' },
  { id: 't_need', text: 'Need', category: 'verb', icon: '❗' },
  { id: 't_have', text: 'Have', category: 'verb', icon: '✋' },
  { id: 't_feel', text: 'Feel', category: 'verb', icon: '💭' },
  { id: 't_am', text: 'Am', category: 'verb', icon: '✨' },
  { id: 't_call', text: 'Call', category: 'verb', icon: '📞' },

  // Prepositions / Linking
  { id: 't_in', text: 'In', category: 'prep', icon: '📍' },
  { id: 't_to', text: 'To', category: 'prep', icon: '➡️' },
  { id: 't_the', text: 'The', category: 'prep', icon: '🔍' },

  // Objects & Needs
  { id: 't_water', text: 'Water', category: 'noun', icon: '💧' },
  { id: 't_food', text: 'Food', category: 'noun', icon: '🍲' },
  { id: 't_pain', text: 'Pain', category: 'noun', icon: '⚡' },
  { id: 't_my_head', text: 'My Head', category: 'body', icon: '🤕' },
  { id: 't_my_stomach', text: 'My Stomach', category: 'body', icon: '🤢' },
  { id: 't_medicine', text: 'Medicine', category: 'noun', icon: '💊' },
  { id: 't_doctor', text: 'Doctor', category: 'noun', icon: '🩺' },
  { id: 't_family', text: 'Family', category: 'noun', icon: '👨‍👩‍👧' },
  { id: 't_bathroom', text: 'Bathroom', category: 'noun', icon: '🚻' },
  { id: 't_sleep', text: 'Sleep', category: 'noun', icon: '😴' },
  { id: 't_help', text: 'Help', category: 'noun', icon: '🆘' },
  { id: 't_happy', text: 'Happy', category: 'emotion', icon: '😊' },
  { id: 't_sad', text: 'Sad', category: 'emotion', icon: '😢' },
  { id: 't_tired', text: 'Tired', category: 'emotion', icon: '🥱' },
  { id: 't_outside', text: 'Outside', category: 'noun', icon: '🌳' },
];

// Predefined Core Phrases for the 6 requested categories
const INITIAL_CATEGORY_PHRASES: Record<string, Array<{ id: string; label: string; sentence: string; icon: string; isEmergency?: boolean }>> = {
  food_drink: [
    { id: 'fd_1', label: 'I want water', sentence: 'I want water.', icon: '💧' },
    { id: 'fd_2', label: 'I want food', sentence: 'I want food.', icon: '🍲' },
    { id: 'fd_3', label: 'I am hungry', sentence: 'I am hungry.', icon: '🍽️' },
    { id: 'fd_4', label: 'I am thirsty', sentence: 'I am thirsty.', icon: '🥤' },
    { id: 'fd_5', label: 'I want milk', sentence: 'I want milk.', icon: '🥛' },
    { id: 'fd_6', label: 'I want juice', sentence: 'I want juice.', icon: '🧃' },
    { id: 'fd_7', label: 'I want tea', sentence: 'I want tea.', icon: '☕' },
    { id: 'fd_8', label: 'I want coffee', sentence: 'I want coffee.', icon: '☕' },
  ],
  health_body: [
    { id: 'hb_1', label: 'I have a headache', sentence: 'I have a headache.', icon: '🤕' },
    { id: 'hb_2', label: 'My stomach hurts', sentence: 'My stomach hurts.', icon: '🤢' },
    { id: 'hb_3', label: 'I have pain', sentence: 'I have pain.', icon: '⚡' },
    { id: 'hb_4', label: 'I feel dizzy', sentence: 'I feel dizzy.', icon: '💫' },
    { id: 'hb_5', label: 'I feel sick', sentence: 'I feel sick.', icon: '🤒' },
    { id: 'hb_6', label: 'I need medicine', sentence: 'I need medicine.', icon: '💊' },
    { id: 'hb_7', label: 'I need a doctor', sentence: 'I need a doctor.', icon: '👨‍⚕️' },
    { id: 'hb_8', label: 'I need to rest', sentence: 'I need to rest.', icon: '🛌' },
  ],
  emotions: [
    { id: 'em_1', label: 'I am happy', sentence: 'I am happy.', icon: '😊' },
    { id: 'em_2', label: 'I am sad', sentence: 'I am sad.', icon: '😢' },
    { id: 'em_3', label: 'I am scared', sentence: 'I am scared.', icon: '😨' },
    { id: 'em_4', label: 'I am angry', sentence: 'I am angry.', icon: '😠' },
    { id: 'em_5', label: 'I am uncomfortable', sentence: 'I am uncomfortable.', icon: '😣' },
    { id: 'em_6', label: 'I feel lonely', sentence: 'I feel lonely.', icon: '🥺' },
    { id: 'em_7', label: 'I am tired', sentence: 'I am tired.', icon: '🥱' },
  ],
  daily_needs: [
    { id: 'dn_1', label: 'I need the bathroom', sentence: 'I need the bathroom.', icon: '🚻' },
    { id: 'dn_2', label: 'I want to sleep', sentence: 'I want to sleep.', icon: '😴' },
    { id: 'dn_3', label: 'I want to go outside', sentence: 'I want to go outside.', icon: '🌳' },
    { id: 'dn_4', label: 'Please help me', sentence: 'Please help me.', icon: '🆘' },
    { id: 'dn_5', label: 'I want to sit down', sentence: 'I want to sit down.', icon: '🪑' },
    { id: 'dn_6', label: 'I want to stand up', sentence: 'I want to stand up.', icon: '🧍' },
    { id: 'dn_7', label: 'I need my family', sentence: 'I need my family.', icon: '👨‍👩‍👧' },
  ],
  people: [
    { id: 'pe_1', label: 'Mother', sentence: 'Mother.', icon: '👩' },
    { id: 'pe_2', label: 'Father', sentence: 'Father.', icon: '👨' },
    { id: 'pe_3', label: 'Brother', sentence: 'Brother.', icon: '👦' },
    { id: 'pe_4', label: 'Sister', sentence: 'Sister.', icon: '👧' },
    { id: 'pe_5', label: 'Doctor', sentence: 'Doctor.', icon: '🩺' },
    { id: 'pe_6', label: 'Caregiver', sentence: 'Caregiver.', icon: '🤝' },
    { id: 'pe_7', label: 'Friend', sentence: 'Friend.', icon: '🧑‍🤝‍🧑' },
  ],
  emergency: [
    { id: 'emg_1', label: 'Help me', sentence: 'Help me.', icon: '🚨', isEmergency: true },
    { id: 'emg_2', label: 'Call my family', sentence: 'Call my family.', icon: '📞', isEmergency: true },
    { id: 'emg_3', label: 'Call a doctor', sentence: 'Call a doctor.', icon: '🏥', isEmergency: true },
    { id: 'emg_4', label: 'I am in pain', sentence: 'I am in pain.', icon: '⚡', isEmergency: true },
    { id: 'emg_5', label: 'I need urgent help', sentence: 'I need urgent help.', icon: '🆘', isEmergency: true },
  ],
};

const CATEGORIES = [
  { id: 'food_drink', label: 'Food & Drink', icon: <Droplets className="w-5 h-5 text-blue-600" />, badgeColor: 'bg-blue-100 text-blue-900' },
  { id: 'health_body', label: 'Health & Body', icon: <Activity className="w-5 h-5 text-rose-600" />, badgeColor: 'bg-rose-100 text-rose-900' },
  { id: 'emotions', label: 'Emotions', icon: <Smile className="w-5 h-5 text-amber-600" />, badgeColor: 'bg-amber-100 text-amber-900' },
  { id: 'daily_needs', label: 'Daily Needs', icon: <Home className="w-5 h-5 text-purple-600" />, badgeColor: 'bg-purple-100 text-purple-900' },
  { id: 'people', label: 'People', icon: <Users className="w-5 h-5 text-emerald-600" />, badgeColor: 'bg-emerald-100 text-emerald-900' },
  { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-5 h-5 text-red-600" />, badgeColor: 'bg-red-100 text-red-900', isEmergency: true },
];

interface CommunicationProps {
  embedded?: boolean;
  onBackToDashboard?: () => void;
}

export const Communication: React.FC<CommunicationProps> = ({
  embedded = false,
  onBackToDashboard,
}) => {
  const { settings: a11ySettings, preferences: a11yPrefs } = useAccessibility();
  // Navigation & Category states
  const [activeCategory, setActiveCategory] = useState<string>('food_drink');
  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('mounam_simple_mode') === 'true';
  });

  // Sentence Builder State (Selected multiple tokens)
  const [selectedTokens, setSelectedTokens] = useState<Array<{ id: string; text: string; icon: string }>>([
    { id: 't_i', text: 'I', icon: '👤' },
    { id: 't_want', text: 'Want', icon: '🤲' },
    { id: 't_water', text: 'Water', icon: '💧' },
  ]);

  // Output Sentence text
  const [outputSentence, setOutputSentence] = useState<string>('I want water.');
  const [isEditingSentence, setIsEditingSentence] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Gemini AI Assistant state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStyle, setAiStyle] = useState<'simple' | 'natural' | 'polite'>('natural');
  const [aiError, setAiError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // SpeechSynthesis Voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const speechRate = a11ySettings.speechRate || 0.9;
  const speechPitch = 1.0;

  // Custom Phrases Persistence in localStorage
  const [customPhrases, setCustomPhrases] = useState<Array<{ id: string; category_id: string; label: string; sentence: string; icon: string }>>(() => {
    const saved = localStorage.getItem('mounam_custom_symbols');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return [
      { id: 'c_tea', category_id: 'food_drink', label: 'Warm Green Tea', sentence: 'I would like some warm green tea please.', icon: '🍵' },
      { id: 'c_walk', category_id: 'daily_needs', label: 'Wheelchair Walk', sentence: 'Please help me go for a walk in my wheelchair.', icon: '🧑‍🦽' }
    ];
  });

  // Favorites in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mounam_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return ['I want water.', 'Please help me.', 'I am in pain.'];
  });

  // Custom Phrase Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [customForm, setCustomForm] = useState({
    label: '',
    sentence: '',
    category_id: 'food_drink',
    icon: '💬',
  });

  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load available system voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoiceURI) {
          // Default to first English or first available voice
          const defaultVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI]);

  // Persist custom phrases to localStorage
  useEffect(() => {
    localStorage.setItem('mounam_custom_symbols', JSON.stringify(customPhrases));
  }, [customPhrases]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('mounam_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Build deterministic sentence from tokens
  const buildSentenceFromTokens = (tokens: Array<{ id: string; text: string; icon: string }>) => {
    if (tokens.length === 0) return '';
    const raw = tokens.map((t) => t.text).join(' ');
    // Deterministic grammar polish
    const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
    const trimmed = capitalized.trim();
    if (!trimmed.endsWith('.') && !trimmed.endsWith('!') && !trimmed.endsWith('?')) {
      return trimmed + '.';
    }
    return trimmed;
  };

  // Add a token to the sentence builder
  const handleAddToken = (token: { id: string; text: string; icon: string }) => {
    const updated = [...selectedTokens, { ...token, id: `${token.id}_${Date.now()}` }];
    setSelectedTokens(updated);
    setOutputSentence(buildSentenceFromTokens(updated));
    setAiError(null);
  };

  // AI Sentence Polishing / Assistant with Google Gemini
  const handleAiPolishSentence = async (overrideStyle?: 'simple' | 'natural' | 'polite') => {
    if (selectedTokens.length === 0 && !outputSentence.trim()) {
      setAiError('Please select at least one word token first.');
      return;
    }
    const targetStyle = overrideStyle || aiStyle;
    setAiGenerating(true);
    setAiError(null);
    try {
      const words = selectedTokens.length > 0 
        ? selectedTokens.map((t) => t.text) 
        : outputSentence.trim().split(/\s+/);

      const res = await apiService.generateSentence({
        selected_words: words,
        language: 'en',
        style: targetStyle,
        context: 'Assistive AAC communication by a person with speech disabilities'
      });

      if (res && res.sentence) {
        setOutputSentence(res.sentence);
      }
    } catch (err: any) {
      console.warn('AI Assist error:', err);
      setAiError(err.message || 'Gemini AI currently offline. Deterministic builder preserved.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Remove individual token
  const handleRemoveToken = (indexToRemove: number) => {
    const updated = selectedTokens.filter((_, idx) => idx !== indexToRemove);
    setSelectedTokens(updated);
    setOutputSentence(buildSentenceFromTokens(updated));
  };

  // Move token left
  const handleMoveTokenLeft = (index: number) => {
    if (index <= 0) return;
    const updated = [...selectedTokens];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSelectedTokens(updated);
    setOutputSentence(buildSentenceFromTokens(updated));
  };

  // Move token right
  const handleMoveTokenRight = (index: number) => {
    if (index >= selectedTokens.length - 1) return;
    const updated = [...selectedTokens];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSelectedTokens(updated);
    setOutputSentence(buildSentenceFromTokens(updated));
  };

  // Clear all tokens
  const handleClearTokens = () => {
    setSelectedTokens([]);
    setOutputSentence('');
  };

  // Select predefined whole phrase directly
  const handleSelectPredefinedPhrase = (sentence: string) => {
    setOutputSentence(sentence);
    // Parse phrase words into tokens for the builder
    const words = sentence.replace(/[.!?]/g, '').split(/\s+/);
    const parsedTokens = words.map((w, idx) => ({
      id: `word_${idx}_${Date.now()}`,
      text: w,
      icon: '💬',
    }));
    setSelectedTokens(parsedTokens);
    handleSpeak(sentence);
  };

  // Text-To-Speech implementation using centralized VoiceEngine
  const handleSpeak = (textToSpeak?: string) => {
    const text = textToSpeak || outputSentence;
    if (!text.trim()) return;

    const ok = voiceEngine.speak(
      text,
      {
        rate: speechRate,
        pitch: speechPitch,
        volume: 1.0,
        voiceURI: selectedVoiceURI || undefined,
        languageCode: a11yPrefs.preferredLanguage || 'en',
      },
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );

    if (ok) {
      setIsSpeaking(true);
      if (personalizationService.isHistoryRecordingEnabled()) {
        personalizationService.recordUsage(
          `comm_${text.slice(0, 32).replace(/\s+/g, '_')}`,
          text,
          'communication',
          'en'
        );
        try {
          const saved = JSON.parse(localStorage.getItem('mounam_history') || '[]');
          const next = [
            {
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...saved.slice(0, 24),
          ];
          localStorage.setItem('mounam_history', JSON.stringify(next));
        } catch {}
      }
    } else {
      alert('Your browser does not support SpeechSynthesis voice playback.');
    }
  };

  const handleStop = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleRepeat = () => {
    handleSpeak(outputSentence);
  };

  const toggleFavorite = (text: string) => {
    if (!text.trim()) return;
    if (favorites.includes(text)) {
      setFavorites(favorites.filter((f) => f !== text));
    } else {
      setFavorites([text, ...favorites]);
    }
  };

  // Custom phrase saving & editing
  const handleSaveCustomPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.label.trim() || !customForm.sentence.trim()) return;

    if (editingCustomId) {
      // Edit existing
      setCustomPhrases((prev) =>
        prev.map((item) =>
          item.id === editingCustomId
            ? { ...item, ...customForm }
            : item
        )
      );
    } else {
      // Add new
      const newPhrase = {
        id: `custom_${Date.now()}`,
        ...customForm,
      };
      setCustomPhrases((prev) => [newPhrase, ...prev]);

      // Call backend route asynchronously (graceful fallback)
      apiService.createCustomPhrase({
        label: customForm.label,
        sentence: customForm.sentence,
        category_id: customForm.category_id,
        icon: customForm.icon,
      });
    }

    setIsCustomModalOpen(false);
    setEditingCustomId(null);
    setCustomForm({ label: '', sentence: '', category_id: 'food_drink', icon: '💬' });
  };

  const handleDeleteCustomPhrase = (id: string) => {
    setCustomPhrases((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenEditCustom = (item: { id: string; category_id: string; label: string; sentence: string; icon: string }) => {
    setEditingCustomId(item.id);
    setCustomForm({
      label: item.label,
      sentence: item.sentence,
      category_id: item.category_id,
      icon: item.icon,
    });
    setIsCustomModalOpen(true);
  };

  // Active phrases for current category (predefined + custom)
  const currentCategoryPredefined = INITIAL_CATEGORY_PHRASES[activeCategory] || [];
  const currentCategoryCustom = customPhrases.filter((c) => c.category_id === activeCategory);
  const activePhrasesCombined = [...currentCategoryPredefined, ...currentCategoryCustom];

  const filteredPhrases = activePhrasesCombined.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.label.toLowerCase().includes(q) || p.sentence.toLowerCase().includes(q);
  });

  return (
    <div className={`${embedded ? 'pb-8' : 'min-h-screen bg-slate-50 pb-20'} ${simpleMode ? 'simple-accessible-mode' : ''}`}>
      
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS */}
      <div className={`bg-white border-b border-slate-200 ${embedded ? 'rounded-2xl border mb-6' : 'sticky top-0 z-30'} shadow-xs`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {embedded && onBackToDashboard ? (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl text-slate-500 hover:text-brand-purple-900 hover:bg-slate-100 transition-colors"
                title="Return to Main Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="p-2 rounded-xl text-slate-500 hover:text-brand-purple-900 hover:bg-slate-100 transition-colors"
                title="Return to Main Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Touch Communication Board
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-purple-100 text-brand-purple-900">
                  AAC Touch Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                “Every Voice Deserves to Be Heard.”
              </p>
            </div>
          </div>

          {/* Accessibility & Voice Tools */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Simple Mode Toggle */}
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                simpleMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{simpleMode ? 'Simple Mode: ON' : 'Simple Mode'}</span>
            </button>

            {/* Voice Selector */}
            {availableVoices.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200 text-xs">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none max-w-[140px] truncate cursor-pointer"
                  title="System Speech Voice"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add Custom Symbol Trigger */}
            <button
              onClick={() => {
                setEditingCustomId(null);
                setCustomForm({ label: '', sentence: '', category_id: activeCategory, icon: '💬' });
                setIsCustomModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-brand-purple-800 hover:bg-brand-purple-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Phrase</span>
            </button>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 2. DEDICATED SENTENCE BUILDER & OUTPUT PANEL */}
        <div
          aria-live="polite"
          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-purple-200 shadow-soft-lg space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-purple-700">
                Active Sentence Builder
              </span>
              <h2 className="text-lg font-black text-slate-900">
                Selected Communication Sequence
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {selectedTokens.length > 0 && (
                <button
                  onClick={handleClearTokens}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Selected Tokens Strip (Interactive Chips) */}
          <div className="min-h-[64px] p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2">
            {selectedTokens.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-400 font-medium italic pl-2">
                Tap words or phrases below to assemble your sentence...
              </p>
            ) : (
              selectedTokens.map((tok, idx) => (
                <div
                  key={tok.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-brand-purple-300 text-brand-purple-950 font-bold text-sm shadow-xs animate-in zoom-in-95 group"
                >
                  <span>{tok.icon}</span>
                  <span>{tok.text}</span>
                  
                  {/* Move Left / Right Buttons */}
                  <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1 text-slate-400">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveTokenLeft(idx)}
                        className="hover:text-slate-800 p-0.5"
                        title="Move left"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    {idx < selectedTokens.length - 1 && (
                      <button
                        onClick={() => handleMoveTokenRight(idx)}
                        className="hover:text-slate-800 p-0.5"
                        title="Move right"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveToken(idx)}
                    className="ml-1 text-slate-400 hover:text-red-600"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resulting Sentence Display & Inline Edit Toggle */}
          <div>
            {isEditingSentence ? (
              <div className="space-y-2">
                <textarea
                  ref={editTextareaRef}
                  rows={2}
                  value={outputSentence}
                  onChange={(e) => setOutputSentence(e.target.value)}
                  className="w-full text-xl sm:text-2xl font-black rounded-2xl p-4 border border-brand-purple-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-600 resize-none bg-slate-50 text-slate-900"
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingSentence(false)}
                  >
                    Done Editing
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingSentence(true)}
                className={`p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors ${
                  simpleMode ? 'text-2xl sm:text-3xl font-black' : 'text-xl sm:text-2xl font-black'
                } text-slate-900`}
                title="Click to edit sentence"
              >
                {outputSentence || (
                  <span className="text-slate-400 font-normal italic">
                    Sentence will appear here...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Gemini AI Sentence Assistant Banner */}
          <div className="p-3.5 bg-gradient-to-r from-brand-purple-50 via-indigo-50 to-blue-50 border border-brand-purple-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-purple-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">
                  Gemini AI Sentence Assistant
                </p>
                <p className="text-[11px] text-slate-500">
                  Elevates selected tokens into natural, polite conversational speech
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-white rounded-xl border border-slate-200 p-0.5 text-xs font-bold text-slate-700">
                {(['simple', 'natural', 'polite'] as const).map((styleOption) => (
                  <button
                    key={styleOption}
                    onClick={() => {
                      setAiStyle(styleOption);
                      handleAiPolishSentence(styleOption);
                    }}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                      aiStyle === styleOption
                        ? 'bg-brand-purple-800 text-white'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {styleOption}
                  </button>
                ))}
              </div>

              <button
                disabled={aiGenerating}
                onClick={() => handleAiPolishSentence()}
                className="px-3.5 py-1.5 rounded-xl bg-brand-purple-800 hover:bg-brand-purple-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Polish</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="w-full text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                {aiError}
              </div>
            )}
          </div>

          {/* Control Actions: Speak, Stop, Repeat, Favorite */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center flex-wrap gap-2">
              <Button
                variant="primary"
                size={simpleMode ? 'xl' : 'lg'}
                onClick={() => handleSpeak()}
                icon={<Volume2 className="w-5 h-5" />}
                className={isSpeaking ? 'animate-pulse ring-4 ring-brand-purple-400' : ''}
              >
                {isSpeaking ? 'Speaking Now...' : 'Speak Sentence'}
              </Button>

              {isSpeaking && (
                <button
                  onClick={handleStop}
                  className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop</span>
                </button>
              )}

              <button
                onClick={handleRepeat}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repeat</span>
              </button>

              <button
                onClick={() => setIsEditingSentence(!isEditingSentence)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditingSentence ? 'Save' : 'Edit Text'}</span>
              </button>
            </div>

            <button
              onClick={() => toggleFavorite(outputSentence)}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                favorites.includes(outputSentence)
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Star
                className={`w-4 h-4 ${
                  favorites.includes(outputSentence) ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
              <span>{favorites.includes(outputSentence) ? 'Saved in Favorites' : 'Add to Favorites'}</span>
            </button>
          </div>
        </div>

        {/* 3. TOKEN BANK: QUICK WORD BUILDING TILES */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Word Bank</span>
              <h3 className="text-base font-black text-slate-900">
                Single-Tap Sentence Building Words
              </h3>
            </div>
            <span className="text-xs text-slate-500">Tap to append</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {WORD_TOKENS.map((token) => (
              <button
                key={token.id}
                onClick={() => handleAddToken(token)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-brand-purple-50 hover:text-brand-purple-900 hover:border-brand-purple-300 border border-slate-200 font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              >
                <span>{token.icon}</span>
                <span>{token.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. CATEGORY SELECTOR TABS */}
        <div className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What would you like to say?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Select the pictures that express what you need.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all ${
                    cat.isEmergency
                      ? isSelected
                        ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                        : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                      : isSelected
                      ? 'bg-brand-purple-800 text-white border-brand-purple-900 shadow-md ring-2 ring-brand-purple-400'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{cat.icon}</span>
                  <span className="text-center leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. PHRASE SYMBOL CARDS GRID */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{CATEGORIES.find((c) => c.id === activeCategory)?.label} Symbols</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                {filteredPhrases.length} items
              </span>
            </h3>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhrases.map((phrase) => {
              const isSelected = outputSentence === phrase.sentence;
              const isFav = favorites.includes(phrase.sentence);
              const isEmergency = ('isEmergency' in phrase && Boolean(phrase.isEmergency)) || activeCategory === 'emergency';

              return (
                <div
                  key={phrase.id}
                  onClick={() => handleSelectPredefinedPhrase(phrase.sentence)}
                  className={`p-5 rounded-3xl border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-44 shadow-soft-sm group relative ${
                    isEmergency
                      ? 'bg-red-50/70 border-red-300 hover:border-red-600'
                      : 'bg-white border-slate-200 hover:border-brand-purple-300 hover:shadow-soft-md'
                  } ${
                    isSelected
                      ? isEmergency
                        ? 'ring-4 ring-red-500 scale-[1.02]'
                        : 'ring-4 ring-brand-purple-600 bg-brand-purple-50/70 scale-[1.02]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-white border border-slate-100 shadow-2xs group-hover:scale-110 transition-transform">
                      {phrase.icon}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFavorite(phrase.sentence)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500"
                        title={isFav ? 'In Favorites' : 'Add to Favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      {'id' in phrase && phrase.id.startsWith('custom_') && (
                        <>
                          <button
                            onClick={() => handleOpenEditCustom(phrase as any)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-purple-800"
                            title="Edit Custom"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomPhrase(phrase.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"
                            title="Delete Custom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`text-base sm:text-lg font-black leading-tight ${
                        isEmergency ? 'text-red-950' : 'text-slate-900 group-hover:text-brand-purple-900'
                      }`}
                    >
                      {phrase.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      “{phrase.sentence}”
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-brand-purple-700">
                    <span>1-Tap to Speak</span>
                    <Volume2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPhrases.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800">No matching phrases found in this category.</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or add a custom phrase above.</p>
            </div>
          )}
        </div>

        {/* 6. FAVORITES SHELF */}
        {favorites.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                My Pinned Favorites
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {favorites.map((fav, fIdx) => (
                <button
                  key={fIdx}
                  onClick={() => handleSelectPredefinedPhrase(fav)}
                  className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-200 flex items-center gap-2 transition-all active:scale-95 shadow-2xs group"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{fav}</span>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 7. MODAL: ADD / EDIT CUSTOM PHRASE */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-soft-xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingCustomId ? 'Edit Custom Phrase' : 'Add Custom Communication Phrase'}
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPhrase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tile Button Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Tea / Blanket"
                  value={customForm.label}
                  onChange={(e) => setCustomForm({ ...customForm, label: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complete Spoken Sentence
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. I would like a cup of green tea please."
                  value={customForm.sentence}
                  onChange={(e) => setCustomForm({ ...customForm, sentence: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={customForm.category_id}
                    onChange={(e) => setCustomForm({ ...customForm, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple-600"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Icon / Emoji
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={customForm.icon}
                      onChange={(e) => setCustomForm({ ...customForm, icon: e.target.value })}
                      className="w-16 px-3 py-2 text-center rounded-xl border border-slate-300 text-lg font-bold"
                    />
                    <div className="flex gap-1 overflow-x-auto">
                      {['🍵', '🛏️', '🚶', '🎧', '❤️', '💊'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setCustomForm({ ...customForm, icon: emoji })}
                          className="p-1 text-base hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCustomModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  {editingCustomId ? 'Save Changes' : 'Create Symbol'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
