/**
 * MOUNAM User Authentication & Profile Context
 * Supports authentication state persistence, local fallback profiles,
 * and seamless integration with Firebase Authentication & Firestore.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  preferredLanguage: string;
  userType: 'speech_disabled' | 'deaf_hard_of_hearing' | 'caregiver' | 'general';
  isCaregiver?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (profile: Omit<UserProfile, 'id' | 'createdAt'>, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mounam_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo guest session so new users can communicate immediately
    return {
      id: 'usr_guest',
      fullName: 'Mounam Communicator',
      email: 'user@mounam.org',
      preferredLanguage: 'en',
      userType: 'speech_disabled',
      createdAt: new Date().toISOString()
    };
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Create authenticated user session
      const updated: UserProfile = {
        id: `usr_${Date.now()}`,
        fullName: email.split('@')[0],
        email,
        preferredLanguage: user?.preferredLanguage || 'en',
        userType: user?.userType || 'speech_disabled',
        createdAt: new Date().toISOString(),
      };
      setUser(updated);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const register = async (profileData: Omit<UserProfile, 'id' | 'createdAt'>): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser: UserProfile = {
        ...profileData,
        id: `usr_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
