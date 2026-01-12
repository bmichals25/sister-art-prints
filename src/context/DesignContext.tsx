'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface DesignSettings {
  // Brand colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Typography
  headingFont: string;
  bodyFont: string;

  // Text content (editable strings)
  texts: Record<string, string>;
}

const defaultSettings: DesignSettings = {
  primaryColor: '#d4846a',
  secondaryColor: '#e8a87c',
  accentColor: '#f5d4be',
  backgroundColor: '#fff8f3',
  textColor: '#1f2937',
  headingFont: 'serif',
  bodyFont: 'sans-serif',
  texts: {
    'hero.title': 'Art That Speaks',
    'hero.subtitle': 'to Your Soul',
    'hero.description': 'Discover unique prints that transform your space into a personal gallery. Each piece tells a story.',
    'hero.cta': 'Explore Collection',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.cart': 'Cart',
    'footer.copyright': 'KatiaPrints. All rights reserved.',
    'about.title': 'About the Artist',
    'gallery.title': 'Gallery',
  },
};

interface DesignContextType {
  settings: DesignSettings;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  updateColor: (key: keyof DesignSettings, value: string) => void;
  updateFont: (key: 'headingFont' | 'bodyFont', value: string) => void;
  updateText: (key: string, value: string) => void;
  getText: (key: string, fallback?: string) => string;
  saveSettings: () => Promise<void>;
  resetToDefaults: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

const DesignContext = createContext<DesignContextType | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<DesignSettings>(defaultSettings);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from database
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('settings')
          .eq('id', 'design')
          .single();

        if (data?.settings) {
          const loaded = { ...defaultSettings, ...data.settings };
          setSettings(loaded);
          setOriginalSettings(loaded);
        }
      } catch {
        // Use defaults if not found
      } finally {
        setIsLoaded(true);
      }
    }

    loadSettings();
  }, []);

  // Apply CSS variables when settings change
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.primaryColor);
    root.style.setProperty('--color-secondary', settings.secondaryColor);
    root.style.setProperty('--color-accent', settings.accentColor);
    root.style.setProperty('--color-background', settings.backgroundColor);
    root.style.setProperty('--color-text', settings.textColor);
    root.style.setProperty('--font-heading', settings.headingFont);
    root.style.setProperty('--font-body', settings.bodyFont);
  }, [settings, isLoaded]);

  const updateColor = (key: keyof DesignSettings, value: string) => {
    if (typeof settings[key] === 'string' && key !== 'texts') {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const updateFont = (key: 'headingFont' | 'bodyFont', value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateText = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      texts: { ...prev.texts, [key]: value },
    }));
  };

  const getText = (key: string, fallback?: string) => {
    return settings.texts[key] ?? fallback ?? key;
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert({
          id: 'design',
          settings: settings,
          updated_at: new Date().toISOString(),
        });
      setOriginalSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  return (
    <DesignContext.Provider
      value={{
        settings,
        isEditMode,
        setIsEditMode,
        updateColor,
        updateFont,
        updateText,
        getText,
        saveSettings,
        resetToDefaults,
        isSaving,
        hasChanges,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
