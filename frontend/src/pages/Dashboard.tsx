import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Volume2,
  Square,
  Trash2,
  Star,
  Globe,
  AlertTriangle,
  Edit3,
  Copy,
  Check,
  Menu,
  X,
  Search,
  SlidersHorizontal,
  Home,
  MessageSquare,
  Bookmark,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Droplets,
  Activity,
  Smile,
  Compass,
  Zap,
  Info,
  ArrowRight,
  Mic,
  Hand,
  Users,
  Sparkles,
  BookOpen,
  ShieldCheck,
  MessageSquarePlus,
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiService, PhraseItem } from '../services/api';
import { voiceEngine } from '../services/voiceEngine';
import { personalizationService } from '../services/personalizationService';
import { VoiceToTextSection } from '../components/VoiceToTextSection';
import { GestureRecognition } from '../components/GestureRecognition';
import { VoiceToSignCommunication } from '../components/VoiceToSignCommunication';
import { EmergencyMode } from '../components/EmergencyMode';
import { CaregiverDashboard } from '../components/CaregiverDashboard';
import { AccessibilityCenter } from '../components/AccessibilityCenter';
import { SmartQuickCommunication } from '../components/SmartQuickCommunication';
import { PersonalVocabularyPanel } from '../components/PersonalVocabularyPanel';
import { PersonalizationPrivacyPanel } from '../components/PersonalizationPrivacyPanel';
import { PilotFeedbackPanel } from '../components/PilotFeedbackPanel';
import { Communication } from './Communication';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

type TabView =
  | 'dashboard'
  | 'communication'
  | 'voicetotext'
  | 'voicetosign'
  | 'gestures'
  | 'emergency'
  | 'caregiver'
  | 'accessibility'
  | 'phrases'
  | 'favorites'
  | 'history'
  | 'smart_quick'
  | 'vocabulary'
  | 'personalization'
  | 'feedback'
  | 'settings'
  | 'help';

export const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emergencyParam = searchParams.get('mode') === 'emergency';
  const tabParam = searchParams.get('tab') as TabView | null;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    settings: a11ySettings,
    preferences: a11yPrefs,
    updateSettings: updateA11ySettings,
    updatePreferences: updateA11yPrefs,
  } = useAccessibility();

  // Active view tab
  const [activeTab, setActiveTab] = useState<TabView>(
    emergencyParam ? 'emergency' : tabParam || 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'favorites'>('all');

  // Accessibility: Simple Mode Toggle
  const [simpleMode, setSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('mounam_simple_mode') === 'true';
  });

  // Communication Output Panel State
  const [selectedSentence, setSelectedSentence] = useState<string>('I need water.');
  const [isEditing, setIsEditing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shared Language settings (backed by AccessibilityContext)
  const selectedLanguage = a11yPrefs.preferredLanguage || 'en';
  const setSelectedLanguage = (lang: string) => updateA11yPrefs({ preferredLanguage: lang });

  // Active selected quick communication card (for expanding options)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(emergencyParam ? 'emergency' : null);

  // Custom message input
  const [customInputText, setCustomInputText] = useState('');

  // Favorites persistence in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mounam_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      'I need water.',
      'Thank you very much.',
      'I need help.',
      'Please call my family.'
    ];
  });

  // History persistence in localStorage
  const [history, setHistory] = useState<Array<{ text: string; timestamp: string }>>(() => {
    const saved = localStorage.getItem('mounam_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      { text: 'I need water.', timestamp: 'Just now' },
      { text: 'Thank you very much.', timestamp: '10m ago' }
    ];
  });

  // Quick phrases search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState<string>('all');
  const [apiPhrases, setApiPhrases] = useState<PhraseItem[]>([]);

  // Notification modal state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Voice engine rate (shared with AccessibilityContext) & pitch
  const speechRate = a11ySettings.speechRate ?? 0.9;
  const setSpeechRate = (rate: number) => updateA11ySettings({ speechRate: rate });
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);

  // Focus ref for accessible editing
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('mounam_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('mounam_history', JSON.stringify(history));
  }, [history]);

  // Save simple mode preference
  useEffect(() => {
    localStorage.setItem('mounam_simple_mode', simpleMode.toString());
  }, [simpleMode]);

  // Load phrases from API backend on mount
  useEffect(() => {
    apiService.getPhrases().then((data) => {
      if (data && data.length > 0) {
        setApiPhrases(data);
      }
    });
  }, []);

  // Handle emergency or tab query params
  useEffect(() => {
    if (emergencyParam) {
      setSelectedCardId('emergency');
      setSelectedSentence('Please help me. I need urgent medical assistance.');
      setActiveTab('emergency');
    } else if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [emergencyParam, tabParam]);

  // Focus textarea when editing
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
    }
  }, [isEditing]);

  // Text-To-Speech implementation using centralized VoiceEngine
  const handleSpeak = (textToSpeak?: string) => {
    const text = textToSpeak || selectedSentence;
    if (!text.trim()) return;

    const ok = voiceEngine.speak(
      text,
      {
        rate: speechRate,
        pitch: speechPitch,
        volume: 1.0,
        languageCode: selectedLanguage,
      },
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );

    if (ok) {
      setIsSpeaking(true);
      // Record history & personalization only if recording is enabled
      if (personalizationService.isHistoryRecordingEnabled()) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setHistory((prev) => [{ text, timestamp: timeStr }, ...prev.slice(0, 24)]);
        personalizationService.recordUsage(
          `dash_${text.slice(0, 32).replace(/\s+/g, '_')}`,
          text,
          selectedCardId ?? 'general',
          selectedLanguage
        );
      }
    } else {
      alert('Your browser does not support SpeechSynthesis voice playback.');
    }
  };

  const handleStopSpeech = () => {
    voiceEngine.stop();
    setIsSpeaking(false);
  };

  const handleCopy = () => {
    if (!selectedSentence) return;
    navigator.clipboard.writeText(selectedSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (phraseToToggle?: string) => {
    const target = phraseToToggle || selectedSentence;
    if (!target) return;
    const isCurrentlyFav = favorites.includes(target);
    if (isCurrentlyFav) {
      setFavorites(favorites.filter((f) => f !== target));
    } else {
      setFavorites([target, ...favorites]);
    }
    // Sync favorite status with personalization records
    const matchingRecords = personalizationService
      .getAllRecords()
      .filter((r) => r.text === target);
    for (const rec of matchingRecords) {
      personalizationService.setFavorite(rec.messageId, !isCurrentlyFav);
    }
  };

  const selectAndSpeakPhrase = (text: string) => {
    setSelectedSentence(text);
    handleSpeak(text);
  };

  // Six primary communication cards requested in Step 4
  const communicationCards = [
    {
      id: 'need_something',
      title: 'I NEED SOMETHING',
      desc: 'Water, food, meals, beverages, or medicine',
      icon: <Droplets className="w-8 h-8 text-brand-blue-600" />,
      color: 'border-blue-200 hover:border-brand-blue-500 bg-blue-50/40',
      options: [
        { label: '💧 I need water', text: 'I need water.' },
        { label: '🍽️ I am hungry', text: 'I am hungry.' },
        { label: '🍲 I need food', text: 'I need food.' },
        { label: '💊 I need medicine', text: 'I need medicine.' },
      ]
    },
    {
      id: 'my_feelings',
      title: 'MY FEELINGS',
      desc: 'Happy, sad, uncomfortable, scared, or peaceful',
      icon: <Smile className="w-8 h-8 text-amber-600" />,
      color: 'border-amber-200 hover:border-amber-500 bg-amber-50/40',
      options: [
        { label: '😊 I am happy', text: 'I am happy.' },
        { label: '😢 I am sad', text: 'I am sad.' },
        { label: '😣 I am uncomfortable', text: 'I am uncomfortable.' },
        { label: '😨 I am scared', text: 'I am scared.' },
      ]
    },
    {
      id: 'my_health',
      title: 'MY HEALTH',
      desc: 'Pain, medical check, feeling dizzy, or need rest',
      icon: <Activity className="w-8 h-8 text-rose-600" />,
      color: 'border-rose-200 hover:border-rose-500 bg-rose-50/40',
      options: [
        { label: '⚡ I am feeling pain', text: 'I am feeling pain.' },
        { label: '👨‍⚕️ I need medical help', text: 'I need medical help.' },
        { label: '💫 I feel dizzy', text: 'I feel dizzy.' },
        { label: '🛌 I need to rest', text: 'I need to rest.' },
      ]
    },
    {
      id: 'daily_needs',
      title: 'DAILY NEEDS',
      desc: 'Bathroom, sleeping, physical help, and going outside',
      icon: <Home className="w-8 h-8 text-brand-purple-600" />,
      color: 'border-purple-200 hover:border-brand-purple-500 bg-purple-50/40',
      options: [
        { label: '🚻 I need to use the bathroom', text: 'I need to use the bathroom.' },
        { label: '😴 I want to sleep', text: 'I want to sleep.' },
        { label: '🆘 I need help', text: 'I need help.' },
        { label: '🌳 I want to go outside', text: 'I want to go outside.' },
      ]
    },
    {
      id: 'emergency',
      title: 'EMERGENCY',
      desc: 'Urgent medical assistance, family alert, and distress call',
      icon: <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />,
      color: 'border-red-300 hover:border-red-600 bg-red-50/70',
      isEmergency: true,
      options: [
        { label: '🚨 Please help me', text: 'Please help me.' },
        { label: '📞 Call my family', text: 'Call my family.' },
        { label: '🏥 I need urgent medical assistance', text: 'I need urgent medical assistance.' },
      ]
    },
    {
      id: 'custom_message',
      title: 'CUSTOM MESSAGE',
      desc: 'Type your own customized thoughts, words, or questions',
      icon: <Edit3 className="w-8 h-8 text-emerald-600" />,
      color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/40',
      isCustom: true,
      options: []
    }
  ];

  // Extended Quick Phrases Repository
  const allPhrases = [
    // Food & Water
    { id: 'p1', cat: 'food_water', label: 'I need water', text: 'I need water.', icon: '💧' },
    { id: 'p2', cat: 'food_water', label: 'I am hungry', text: 'I am hungry.', icon: '🍽️' },
    { id: 'p3', cat: 'food_water', label: 'I need food', text: 'I need food.', icon: '🍲' },
    { id: 'p4', cat: 'food_water', label: 'I need medicine', text: 'I need medicine.', icon: '💊' },
    { id: 'p5', cat: 'food_water', label: 'I would like hot tea', text: 'I would like a warm cup of tea.', icon: '☕' },
    
    // Health
    { id: 'p6', cat: 'health', label: 'I am feeling pain', text: 'I am feeling pain.', icon: '⚡' },
    { id: 'p7', cat: 'health', label: 'I need medical help', text: 'I need medical help.', icon: '👨‍⚕️' },
    { id: 'p8', cat: 'health', label: 'I feel dizzy', text: 'I feel dizzy.', icon: '💫' },
    { id: 'p9', cat: 'health', label: 'I need to rest', text: 'I need to rest.', icon: '🛌' },
    { id: 'p10', cat: 'health', label: 'I have a headache', text: 'I have a severe headache.', icon: '🤕' },

    // Emotions
    { id: 'p11', cat: 'emotions', label: 'I am happy', text: 'I am happy.', icon: '😊' },
    { id: 'p12', cat: 'emotions', label: 'I am sad', text: 'I am sad.', icon: '😢' },
    { id: 'p13', cat: 'emotions', label: 'I am uncomfortable', text: 'I am uncomfortable.', icon: '😣' },
    { id: 'p14', cat: 'emotions', label: 'I am scared', text: 'I am scared.', icon: '😨' },
    { id: 'p15', cat: 'emotions', label: 'I am grateful', text: 'I feel grateful and loved.', icon: '❤️' },

    // Family
    { id: 'p16', cat: 'family', label: 'Call my family', text: 'Call my family.', icon: '📞' },
    { id: 'p17', cat: 'family', label: 'I want to talk', text: 'I want to talk with my family.', icon: '💬' },
    { id: 'p18', cat: 'family', label: 'Thank you', text: 'Thank you very much for your care.', icon: '🙏' },
    { id: 'p19', cat: 'family', label: 'I love you', text: 'I love you.', icon: '💖' },

    // Daily Activities
    { id: 'p20', cat: 'daily', label: 'Use bathroom', text: 'I need to use the bathroom.', icon: '🚻' },
    { id: 'p21', cat: 'daily', label: 'Want to sleep', text: 'I want to sleep.', icon: '😴' },
    { id: 'p22', cat: 'daily', label: 'Go outside', text: 'I want to go outside for fresh air.', icon: '🌳' },
    { id: 'p23', cat: 'daily', label: 'Please wait', text: 'Please wait a moment.', icon: '⏳' },

    // Emergency
    { id: 'p24', cat: 'emergency', label: 'Please help me', text: 'Please help me.', icon: '🚨' },
    { id: 'p25', cat: 'emergency', label: 'Urgent medical help', text: 'I need urgent medical assistance.', icon: '🏥' },
    { id: 'p26', cat: 'emergency', label: 'Call an ambulance', text: 'Please call an ambulance immediately.', icon: '🚑' },
  ];

  // Use backend phrases if loaded, otherwise fallback to local rich catalog
  const phraseCatalog = apiPhrases.length > 0
    ? apiPhrases.map((p) => ({
        id: p.id,
        cat: p.category === 'daily_activities' ? 'daily' : p.category,
        label: p.label,
        text: p.sentence,
        icon: p.icon
      }))
    : allPhrases;

  const filteredPhrases = phraseCatalog.filter((item) => {
    const matchesCat = selectedPhraseCategory === 'all' || item.cat === selectedPhraseCategory;
    const matchesQuery = !searchQuery.trim() ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const sidebarItems: Array<{ id: TabView; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'communication', label: 'My Communication', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'voicetotext', label: 'Voice-to-Text', icon: <Mic className="w-5 h-5" /> },
    { id: 'voicetosign', label: 'Voice-to-Sign', icon: <Hand className="w-5 h-5" /> },
    { id: 'gestures', label: 'Gesture Camera', icon: <Activity className="w-5 h-5" /> },
    { id: 'emergency', label: 'SOS Emergency', icon: <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" /> },
    { id: 'caregiver', label: 'Caregiver Portal', icon: <Users className="w-5 h-5" /> },
    { id: 'accessibility', label: 'Accessibility Center', icon: <SlidersHorizontal className="w-5 h-5" /> },
    { id: 'phrases', label: 'Quick Phrases', icon: <Compass className="w-5 h-5" /> },
    { id: 'smart_quick', label: 'Smart Quick Access', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'vocabulary', label: 'My Vocabulary', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'favorites', label: 'My Favorites', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'history', label: 'Communication History', icon: <History className="w-5 h-5" /> },
    { id: 'personalization', label: 'Privacy & Personalization', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'feedback', label: 'Pilot Feedback', icon: <MessageSquarePlus className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col md:flex-row ${simpleMode ? 'simple-accessible-mode' : ''}`}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-3 group text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple-900 via-brand-purple-700 to-brand-blue-500 flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-purple-800 transition-colors">
                    MOUNAM
                  </h2>
                  <p className="text-[10px] font-bold text-brand-purple-600 uppercase tracking-wider">
                    Assistive Voice AAC
                  </p>
                </div>
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="p-3 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-brand-purple-800 text-white shadow-soft-sm'
                      : 'text-slate-600 hover:text-brand-purple-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer with Logout & Return Home */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Back to Public Website</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <p className="text-xs font-semibold text-slate-400 hidden sm:block">MOUNAM Dashboard</p>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Welcome to MOUNAM
              </h3>
            </div>
          </div>

          {/* Right Topbar Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Simple Mode Toggle Pill */}
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                simpleMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
              title="Toggle Large Simple Mode"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{simpleMode ? 'Simple Mode: ON' : 'Simple Mode'}</span>
            </button>

            {/* Preferred Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                aria-label="Select preferred voice output language"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* Quick Settings Icon */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-purple-100 text-brand-purple-900 font-bold text-xs flex items-center justify-center border border-brand-purple-200">
                {(user?.fullName?.[0] || 'M').toUpperCase()}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">{user?.fullName || 'MOUNAM User'}</p>
                <p className="text-[10px] text-emerald-600 font-semibold capitalize">
                  {user?.userType?.replace(/_/g, ' ') || 'Active Session'}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* Notifications Popup Dropdown */}
        {notificationsOpen && (
          <div className="absolute top-16 right-4 sm:right-8 z-30 w-80 bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-lg space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Notifications</h4>
              <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                <p className="font-bold">Web Speech API Active</p>
                <p className="text-[11px] text-emerald-700">Client speech synthesis is ready for regional audio output.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-brand-purple-50 border border-brand-purple-100 text-brand-purple-900">
                <p className="font-bold">Step 4 Features Loaded</p>
                <p className="text-[11px] text-brand-purple-700">All 6 core communication cards and favorites persistence are active.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-soft-xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-purple-700" />
                  <h3 className="text-lg font-black text-slate-900">Speech & Accessibility Settings</h3>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Speech Speed / Rate:</span>
                    <span>{speechRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-brand-purple-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Slow (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Fast (1.5x)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Voice Pitch:</span>
                    <span>{speechPitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-brand-purple-800 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">Simple Accessibility Mode</span>
                    <input
                      type="checkbox"
                      checked={simpleMode}
                      onChange={(e) => setSimpleMode(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-purple-800 focus:ring-brand-purple-600"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Maximizes button sizes, enlarges text, and hides non-essential visual elements.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setSettingsOpen(false)}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-7xl mx-auto w-full space-y-6">
          
          {/* COMMUNICATION OUTPUT PANEL (STICKY & HIGHLIGHTED) */}
          <section
            aria-live="polite"
            className={`p-6 sm:p-8 rounded-3xl border transition-all ${
              selectedCardId === 'emergency'
                ? 'bg-red-600 text-white border-red-700 shadow-xl'
                : 'bg-white border-brand-purple-200 shadow-soft-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider opacity-85">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                <span>Selected Sentence to Speak</span>
              </span>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {selectedLanguage.toUpperCase()} Voice
              </span>
            </div>

            {/* Editable or Display View */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  ref={editTextareaRef}
                  rows={simpleMode ? 3 : 2}
                  value={selectedSentence}
                  onChange={(e) => setSelectedSentence(e.target.value)}
                  className={`w-full font-black rounded-2xl p-4 border focus:outline-none transition-all resize-none ${
                    simpleMode ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'
                  } ${
                    selectedCardId === 'emergency'
                      ? 'bg-white text-red-900 border-red-300'
                      : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:ring-2 focus:ring-brand-purple-600'
                  }`}
                  placeholder="Type your message here..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="bg-white text-slate-800"
                  >
                    Done Editing
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className={`p-4 rounded-2xl cursor-pointer transition-colors border ${
                  simpleMode ? 'text-2xl sm:text-4xl font-black py-6' : 'text-xl sm:text-3xl font-black py-4'
                } ${
                  selectedCardId === 'emergency'
                    ? 'bg-white text-red-950 border-red-300'
                    : 'bg-slate-50 hover:bg-slate-100/70 text-slate-900 border-slate-200'
                }`}
                title="Click to edit sentence"
              >
                {selectedSentence || (
                  <span className="text-slate-400 font-normal italic">
                    Tap any option below to select a sentence...
                  </span>
                )}
              </div>
            )}

            {/* OUTPUT CONTROLS: Speak, Stop, Edit, Clear, Copy, Favorite */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/50">
              
              <div className="flex items-center flex-wrap gap-2">
                <Button
                  variant={selectedCardId === 'emergency' ? 'secondary' : 'primary'}
                  size={simpleMode ? 'xl' : 'lg'}
                  onClick={() => handleSpeak()}
                  icon={<Volume2 className="w-5 h-5" />}
                  className={isSpeaking ? 'animate-pulse ring-4 ring-brand-purple-400' : ''}
                >
                  {isSpeaking ? 'Speaking Now...' : 'Speak Sentence'}
                </Button>

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeech}
                    className="px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-red-700 transition-colors"
                    title="Stop speaking"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    selectedCardId === 'emergency'
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Edit sentence"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => setSelectedSentence('')}
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    selectedCardId === 'emergency'
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Clear sentence"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>

                <button
                  onClick={handleCopy}
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                    selectedCardId === 'emergency'
                      ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Add to Favorites Button */}
              <button
                onClick={() => toggleFavorite()}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  favorites.includes(selectedSentence)
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : selectedCardId === 'emergency'
                    ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    favorites.includes(selectedSentence) ? 'fill-amber-500 text-amber-500' : ''
                  }`}
                />
                <span>{favorites.includes(selectedSentence) ? 'In Favorites' : 'Add to Favorites'}</span>
              </button>

            </div>
          </section>

          {/* VIEW: VOICE-TO-TEXT COMMUNICATION (PHASE 6) */}
          {activeTab === 'voicetotext' && (
            <div className="space-y-6">
              <VoiceToTextSection />
            </div>
          )}

          {/* VIEW: VOICE-TO-SIGN COMMUNICATION (PHASE 9) */}
          {activeTab === 'voicetosign' && (
            <div className="space-y-6">
              <VoiceToSignCommunication />
            </div>
          )}

          {/* VIEW: GESTURE RECOGNITION (PHASE 7) */}
          {activeTab === 'gestures' && (
            <div className="space-y-6">
              <GestureRecognition />
            </div>
          )}

          {/* VIEW: SOS EMERGENCY MODE (PHASE 10) */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <EmergencyMode />
            </div>
          )}

          {/* VIEW: CAREGIVER PORTAL (PHASE 10) */}
          {activeTab === 'caregiver' && (
            <div className="space-y-6">
              <CaregiverDashboard />
            </div>
          )}

          {/* VIEW: ACCESSIBILITY CENTER (PHASE 10) */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <AccessibilityCenter />
            </div>
          )}

          {/* VIEW: SMART QUICK COMMUNICATION (PHASE 11) */}
          {activeTab === 'smart_quick' && (
            <div className="space-y-6">
              <SmartQuickCommunication language={selectedLanguage} />
            </div>
          )}

          {/* VIEW: PERSONAL VOCABULARY (PHASE 11) */}
          {activeTab === 'vocabulary' && (
            <div className="h-full" style={{ minHeight: '600px' }}>
              <PersonalVocabularyPanel language={selectedLanguage} />
            </div>
          )}

          {/* VIEW: PRIVACY & PERSONALIZATION (PHASE 11) */}
          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <PersonalizationPrivacyPanel />
            </div>
          )}

          {/* VIEW: PILOT FEEDBACK (PHASE 14) */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <PilotFeedbackPanel />
            </div>
          )}

          {/* VIEW: TOUCH COMMUNICATION BOARD (EMBEDDED IN DASHBOARD) */}
          {activeTab === 'communication' && (
            <Communication embedded onBackToDashboard={() => setActiveTab('dashboard')} />
          )}

          {/* VIEW: MAIN DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Heading & Subheading */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      How can we help you communicate today?
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">
                      Choose an option to express what you need.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('communication')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-purple-900 to-brand-purple-700 text-white font-bold text-xs shadow-soft hover:shadow-soft-md transition-all group"
                  >
                    <span>Open Touch Board & Sentence Builder</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* 6 LARGE INTERACTIVE COMMUNICATION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {communicationCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`p-6 sm:p-7 rounded-3xl border-2 text-left cursor-pointer transition-all duration-200 shadow-soft-sm hover:shadow-soft-md ${
                      card.color
                    } ${
                      selectedCardId === card.id
                        ? 'ring-4 ring-brand-purple-600 scale-[1.01]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xs">
                        {card.icon}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-full border border-slate-200 text-slate-700">
                        {card.isCustom ? 'Custom' : `${card.options.length} options`}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {card.desc}
                    </p>

                    {/* Previews / direct triggers */}
                    {!card.isCustom && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/60">
                        {card.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAndSpeakPhrase(opt.text);
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl bg-white hover:bg-brand-purple-50 hover:text-brand-purple-900 text-left text-xs font-bold text-slate-800 border border-slate-200 flex items-center justify-between transition-colors shadow-2xs group ${
                              selectedSentence === opt.text ? 'ring-2 ring-brand-purple-600' : ''
                            }`}
                          >
                            <span>{opt.label}</span>
                            <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-purple-700" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Custom text field card */}
                    {card.isCustom && (
                      <div
                        className="pt-2 border-t border-slate-200/60 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          placeholder="Type any word or sentence..."
                          value={customInputText}
                          onChange={(e) => setCustomInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customInputText.trim()) {
                              selectAndSpeakPhrase(customInputText.trim());
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => {
                            if (customInputText.trim()) {
                              selectAndSpeakPhrase(customInputText.trim());
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Speak Custom Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* QUICK FAVORITES ROW */}
              {favorites.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                        My Saved Favorites
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('favorites')}
                      className="text-xs font-bold text-brand-purple-700 hover:underline"
                    >
                      View All ({favorites.length}) →
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {favorites.slice(0, 6).map((fav, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => selectAndSpeakPhrase(fav)}
                        className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm border border-amber-200 flex items-center gap-2 transition-all shadow-2xs group"
                      >
                        <span>{fav}</span>
                        <Volume2 className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VIEW: QUICK PHRASES & SEARCH */}
          {activeTab === 'phrases' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Quick Communication Phrases
                </h1>
                <p className="text-sm text-slate-600">
                  Search and select commonly used phrases across everyday categories.
                </p>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-soft-sm space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search phrases (e.g. water, pain, help, bathroom)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: 'all', label: 'All Phrases' },
                    { id: 'food_water', label: 'Food & Water' },
                    { id: 'health', label: 'Health' },
                    { id: 'emotions', label: 'Emotions' },
                    { id: 'family', label: 'Family' },
                    { id: 'daily', label: 'Daily Activities' },
                    { id: 'emergency', label: 'Emergency' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedPhraseCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        selectedPhraseCategory === cat.id
                          ? 'bg-brand-purple-800 text-white border-brand-purple-800 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Phrases Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPhrases.map((phrase) => {
                  const isFav = favorites.includes(phrase.text);
                  return (
                    <div
                      key={phrase.id}
                      onClick={() => selectAndSpeakPhrase(phrase.text)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        selectedSentence === phrase.text
                          ? 'bg-brand-purple-50 border-brand-purple-600 ring-2 ring-brand-purple-400'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-slate-100 rounded-xl group-hover:scale-110 transition-transform">
                          {phrase.icon}
                        </span>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-brand-purple-900">
                            {phrase.label}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">{phrase.text}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleFavorite(phrase.text)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-500"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => selectAndSpeakPhrase(phrase.text)}
                          className="p-2 rounded-lg bg-brand-purple-50 text-brand-purple-800 hover:bg-brand-purple-100"
                          title="Speak phrase"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPhrases.length === 0 && (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                  <p className="text-base font-bold text-slate-800">No matching phrases found</p>
                  <p className="text-xs text-slate-500">Try adjusting your search terms or category filter.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  My Favorite Phrases
                </h1>
                <p className="text-sm text-slate-600">
                  Quick access to the sentences you use most frequently. Persisted in local storage.
                </p>
              </div>

              {favorites.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                  <Star className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-base font-bold text-slate-800">No favorites added yet</p>
                  <p className="text-xs text-slate-500">
                    Tap the star icon on any phrase to save it here for instant 1-tap playback.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {favorites.map((fav, fIdx) => (
                    <div
                      key={fIdx}
                      onClick={() => selectAndSpeakPhrase(fav)}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-2xs flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500 shrink-0" />
                        <span className="text-sm sm:text-base font-bold text-slate-900">{fav}</span>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => selectAndSpeakPhrase(fav)}
                          className="p-2 rounded-xl bg-brand-purple-50 text-brand-purple-800 hover:bg-brand-purple-100"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(fav)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500"
                          title="Remove favorite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: COMMUNICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Communication History
                  </h1>
                  <p className="text-sm text-slate-600">
                    Log of recent sentences spoken during your session.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      historyFilter === 'all'
                        ? 'bg-brand-purple-800 text-white border-brand-purple-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All ({history.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter('favorites')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      historyFilter === 'favorites'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Favorites Only
                  </button>
                  {history.length > 0 && (
                    <button
                      onClick={() => setHistory([])}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {!personalizationService.isHistoryRecordingEnabled() && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-3">
                  <span>History recording is currently paused in Privacy &amp; Personalization settings.</span>
                  <button
                    onClick={() => setActiveTab('personalization')}
                    className="font-bold underline shrink-0"
                  >
                    Manage Privacy
                  </button>
                </div>
              )}

              {(() => {
                const filteredHistory =
                  historyFilter === 'favorites'
                    ? history.filter((item) => favorites.includes(item.text))
                    : history;

                if (filteredHistory.length === 0) {
                  return (
                    <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-2">
                      <History className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-base font-bold text-slate-800">
                        {historyFilter === 'favorites'
                          ? 'No favorite messages in history yet'
                          : 'No communication history yet'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Sentences you speak will appear here chronologically.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-soft-sm">
                    {filteredHistory.map((item, hIdx) => {
                      const isFav = favorites.includes(item.text);
                      return (
                        <div
                          key={hIdx}
                          onClick={() => selectAndSpeakPhrase(item.text)}
                          className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 break-words">{item.text}</p>
                            <p className="text-[11px] text-slate-400">{item.timestamp}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.text);
                              }}
                              className={`p-2 rounded-xl transition-colors ${
                                isFav
                                  ? 'bg-amber-50 text-amber-500'
                                  : 'bg-slate-100 text-slate-400 hover:text-amber-500'
                              }`}
                              title={isFav ? 'Remove from Favorites' : 'Save to Favorites'}
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSentence(item.text);
                                setIsEditing(true);
                                setActiveTab('dashboard');
                              }}
                              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                              title="Edit & Reuse"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAndSpeakPhrase(item.text);
                              }}
                              className="p-2 rounded-xl bg-slate-100 text-brand-purple-800 hover:bg-brand-purple-50"
                              title="Repeat speak"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Dashboard Settings
                </h1>
                <p className="text-sm text-slate-600">
                  Configure speech speed, language voice, and visual accessibility.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                    Speech Controls
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Speed / Rate:</span>
                        <span>{speechRate.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-brand-purple-800 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Voice Pitch:</span>
                        <span>{speechPitch.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full accent-brand-purple-800 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
                    Accessibility Presets
                  </h3>
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Simple Mode</p>
                      <p className="text-[11px] text-slate-500">Increases font and button scale for motor/visual ease.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={simpleMode}
                      onChange={(e) => setSimpleMode(e.target.checked)}
                      className="w-5 h-5 rounded text-brand-purple-800 focus:ring-brand-purple-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: HELP & SUPPORT */}
          {activeTab === 'help' && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Help & Caregiver Guidance
                </h1>
                <p className="text-sm text-slate-600">
                  How to get the most out of the MOUNAM communication assistant.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-purple-700" />
                    <span>How do I speak a phrase?</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    Tap any of the large communication cards or quick phrases. The text will load into the top output panel. Tap <strong>Speak Sentence</strong> to play it aloud through your speaker.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-purple-700" />
                    <span>Can I use this without an internet connection?</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    Yes! All predefined phrases, speech synthesis, favorites, and emergency broadcast tiles work completely offline directly in your browser.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-purple-700" />
                    <span>How do I save phrases I use often?</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    Click the <strong>Star</strong> icon on any sentence or in the output panel to save it into <strong>My Favorites</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (One-Handed Accessible Operation) */}
      <nav
        aria-label="Mobile quick navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {(
          [
            { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
            { id: 'phrases', label: 'Phrases', icon: <Compass className="w-5 h-5" /> },
            { id: 'voicetotext', label: 'Voice', icon: <Mic className="w-5 h-5" /> },
            { id: 'voicetosign', label: 'Sign', icon: <Hand className="w-5 h-5" /> },
            { id: 'emergency', label: 'SOS', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> },
          ] as Array<{ id: TabView; label: string; icon: React.ReactNode }>
        ).map((navItem) => (
          <button
            key={navItem.id}
            onClick={() => {
              setActiveTab(navItem.id);
              setSidebarOpen(false);
            }}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-xl text-[11px] font-bold transition-colors ${
              activeTab === navItem.id
                ? navItem.id === 'emergency'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-brand-purple-50 text-brand-purple-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {navItem.icon}
            <span className="mt-0.5">{navItem.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};
