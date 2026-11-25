/**
 * MOUNAM Frontend API Service
 * Connects to the FastAPI backend via same-origin /api proxy or VITE_API_URL
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp?: string;
}

export interface ApiRootResponse {
  message: string;
  status: string;
}

export interface AuthStatusResponse {
  status: string;
  message: string;
  provider: string;
  provider_connected: boolean;
  next_step: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  preferred_language: string;
  user_type?: string;
  accepted_terms: boolean;
}

export interface PhraseItem {
  id: string;
  category: string;
  label: string;
  sentence: string;
  icon: string;
  regional_translations?: Record<string, string>;
  is_emergency?: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  icon: string;
  phrase_count: number;
}

export interface DashboardResponse {
  status: string;
  platform_name: string;
  tagline: string;
  active_profile: {
    user_name: string;
    user_type: string;
    preferred_language: string;
  };
  categories: CategorySummary[];
  simple_mode_available: boolean;
  offline_support: boolean;
  voice_engine: string;
}

export interface CommunicationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_theme: string;
  is_emergency?: boolean;
}

export interface CommunicationPhrase {
  id: string;
  category_id: string;
  label: string;
  sentence: string;
  icon: string;
  is_emergency?: boolean;
  is_custom?: boolean;
  tokens?: string[];
}

export interface CustomPhrasePayload {
  label: string;
  sentence: string;
  category_id: string;
  icon?: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
  native_name: string;
  locale: string;
  flag: string;
  is_supported: boolean;
}

export interface PhraseTranslationResponse {
  phrase_id: string;
  category_id: string;
  english: string;
  translations: Record<string, string>;
}

export interface AiStatusResponse {
  status: string;
  service: string;
  api_key_configured: boolean;
  model: string;
  timeout_seconds: number;
  supported_styles: string[];
  supported_languages: string[];
}

export interface AiGenerateSentencePayload {
  selected_words: string[];
  language: string;
  context?: string | null;
  style?: 'simple' | 'natural' | 'polite';
}

export interface AiGenerateSentenceResponse {
  sentence: string;
  language: string;
  style: string;
}

export interface AiTranslatePayload {
  text: string;
  source_language: string;
  target_language: string;
}

export interface AiTranslateResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export const apiService = {
  /**
   * Check root API status
   */
  async checkRoot(): Promise<ApiRootResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Backend API connection warning:', error);
      return {
        message: 'MOUNAM API connection pending (Offline or Backend not started)',
        status: 'disconnected'
      };
    }
  },

  /**
   * Check backend health endpoint
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Health check returned status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Health check warning:', error);
      return {
        status: 'unavailable',
        service: 'mounam-backend',
        version: '1.0.0'
      };
    }
  },

  /**
   * Check authentication service readiness status
   */
  async getAuthStatus(): Promise<AuthStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Auth status returned ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return {
        status: 'standby',
        message: 'Backend auth service standby. Firebase Auth integration scheduled for Phase 4.',
        provider: 'Firebase Authentication',
        provider_connected: false,
        next_step: 'Phase 4: Firebase Admin SDK setup'
      };
    }
  },

  /**
   * Submit login validation
   */
  async login(payload: LoginPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.warn('Login API call warning:', error);
      return {
        status: 'client_fallback',
        message: 'Login validated on client. Firebase Auth completes backend session in Phase 4.'
      };
    }
  },

  /**
   * Submit registration validation
   */
  async register(payload: RegisterPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.warn('Registration API call warning:', error);
      return {
        status: 'client_fallback',
        message: 'Registration validated on client. Firebase Auth creates account in Phase 4.'
      };
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      console.warn('Password reset API call warning:', error);
      return {
        status: 'client_fallback',
        message: 'Password reset request validated.'
      };
    }
  },

  /**
   * Fetch Dashboard overview
   */
  async getDashboard(): Promise<DashboardResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Dashboard status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Dashboard fetch warning (using client fallback):', error);
      return null;
    }
  },

  /**
   * Fetch standardized phrases with optional category and search filters
   */
  async getPhrases(category?: string, search?: string): Promise<PhraseItem[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE_URL}/api/phrases?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Phrases status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Phrases fetch warning (using client fallback):', error);
      return [];
    }
  },

  /**
   * Fetch AAC touch communication categories
   */
  async getCommunicationCategories(): Promise<CommunicationCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/communication/categories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Categories status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Communication categories fetch warning (using client fallback):', error);
      return [];
    }
  },

  /**
   * Fetch AAC touch communication phrases
   */
  async getCommunicationPhrases(category_id?: string, search?: string): Promise<CommunicationPhrase[]> {
    try {
      const params = new URLSearchParams();
      if (category_id) params.append('category_id', category_id);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE_URL}/api/communication/phrases?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Communication phrases status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Communication phrases fetch warning (using client fallback):', error);
      return [];
    }
  },

  /**
   * Create custom phrase
   */
  async createCustomPhrase(payload: CustomPhrasePayload): Promise<CommunicationPhrase | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/communication/custom-phrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Create custom phrase error ${response.status}`);
      const data = await response.json();
      return data.phrase;
    } catch (error) {
      console.warn('Create custom phrase warning (using client fallback):', error);
      return null;
    }
  },

  /**
   * Get supported languages
   */
  async getLanguages(): Promise<LanguageInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/languages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Languages error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Languages fetch warning (using client fallback):', error);
      return [
        { code: 'en', name: 'English', native_name: 'English', locale: 'en-US', flag: '🌐', is_supported: true },
        { code: 'ta', name: 'Tamil', native_name: 'தமிழ்', locale: 'ta-IN', flag: '🇮🇳', is_supported: true },
        { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', locale: 'hi-IN', flag: '🇮🇳', is_supported: true },
        { code: 'te', name: 'Telugu', native_name: 'తెలుగు', locale: 'te-IN', flag: '🇮🇳', is_supported: true },
        { code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', locale: 'ml-IN', flag: '🇮🇳', is_supported: true },
        { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ', locale: 'kn-IN', flag: '🇮🇳', is_supported: true },
      ];
    }
  },

  /**
   * Get translation for a phrase ID
   */
  async getPhraseTranslation(phraseId: string): Promise<PhraseTranslationResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/translations/${phraseId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Translation error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`Translation fetch warning for ${phraseId}:`, error);
      return null;
    }
  },

  /**
   * Check AI service status
   */
  async getAiStatus(): Promise<AiStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`AI status error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('AI status check warning:', error);
      return {
        status: 'disconnected',
        service: 'Google Gemini Assistive AI',
        api_key_configured: false,
        model: 'gemini-1.5-flash',
        timeout_seconds: 15,
        supported_styles: ['simple', 'natural', 'polite'],
        supported_languages: ['en', 'ta', 'hi', 'te', 'ml', 'kn']
      };
    }
  },

  /**
   * Generate sentence from user-selected words using Gemini AI
   */
  async generateSentence(payload: AiGenerateSentencePayload): Promise<AiGenerateSentenceResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: 'Failed to generate sentence' }));
      throw new Error(errData.detail || `Server error ${response.status}`);
    }
    return await response.json();
  },

  /**
   * Translate text using Gemini AI
   */
  async translateWithAi(payload: AiTranslatePayload): Promise<AiTranslateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ detail: 'Failed to translate' }));
      throw new Error(errData.detail || `Server error ${response.status}`);
    }
    return await response.json();
  }
};
