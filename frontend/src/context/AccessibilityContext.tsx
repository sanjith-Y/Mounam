/**
 * MOUNAM Accessibility & Global Preferences Context
 * Provides real-time text scaling, contrast enhancement, reduced motion,
 * theme switching, button size control, haptic feedback, and offline persistence.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSizeOption = 'normal' | 'large' | 'extra_large';
export type ContrastOption = 'standard' | 'high_contrast';
export type ThemeOption = 'light' | 'dark' | 'system';
export type ButtonSizeOption = 'standard' | 'large' | 'extra_large';

export interface AccessibilitySettings {
  textSize: TextSizeOption;
  contrast: ContrastOption;
  theme: ThemeOption;
  reducedMotion: boolean;
  buttonSize: ButtonSizeOption;
  simplifiedMode: boolean;
  hapticEnabled: boolean;
  speechRate: number;
}

export interface CommunicationPreferences {
  preferredLanguage: string;
  defaultCommunicationMode: 'express' | 'translate' | 'emergency';
  confirmBeforeSpeaking: boolean;
  frequentlyUsedFavorites: string[];
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  preferences: CommunicationPreferences;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  updatePreferences: (updates: Partial<CommunicationPreferences>) => void;
  triggerHaptic: (pattern?: number | number[]) => void;
  resetAccessibility: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  contrast: 'standard',
  theme: 'light',
  reducedMotion: false,
  buttonSize: 'standard',
  simplifiedMode: false,
  hapticEnabled: true,
  speechRate: 0.9,
};

const DEFAULT_PREFERENCES: CommunicationPreferences = {
  preferredLanguage: 'en',
  defaultCommunicationMode: 'express',
  confirmBeforeSpeaking: true,
  frequentlyUsedFavorites: [
    'I need water.',
    'Thank you very much.',
    'I need medical assistance.',
    'Please call my family.'
  ],
};

const SETTINGS_STORAGE_KEY = 'mounam_accessibility_settings';
const PREFS_STORAGE_KEY = 'mounam_communication_preferences';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [preferences, setPreferences] = useState<CommunicationPreferences>(() => {
    const saved = localStorage.getItem(PREFS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  // Apply settings to document HTML root for real CSS cascades
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));

    const root = document.documentElement;

    // 1. Text scaling class
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-extra-large');
    if (settings.textSize === 'large') root.classList.add('text-size-large');
    else if (settings.textSize === 'extra_large') root.classList.add('text-size-extra-large');
    else root.classList.add('text-size-normal');

    // 2. High contrast class
    if (settings.contrast === 'high_contrast') {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    // 3. Theme class
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 4. Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 5. Button size
    root.classList.remove('btn-size-standard', 'btn-size-large', 'btn-size-extra-large');
    root.classList.add(`btn-size-${settings.buttonSize}`);

    // 6. Simplified mode
    if (settings.simplifiedMode) {
      root.classList.add('simple-accessible-mode');
    } else {
      root.classList.remove('simple-accessible-mode');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const updatePreferences = (updates: Partial<CommunicationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const triggerHaptic = (pattern: number | number[] = 25) => {
    if (settings.hapticEnabled && typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // unsupported in some iframes or devices
      }
    }
  };

  const resetAccessibility = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        preferences,
        updateSettings,
        updatePreferences,
        triggerHaptic,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
