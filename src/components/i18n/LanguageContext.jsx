import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { uiTranslations, LANGUAGES } from './translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'suttain_language';

/**
 * Detects a default language from the browser locale.
 */
function detectBrowserLanguage() {
  const browserLang = navigator.language?.toLowerCase() || 'en';
  if (browserLang.startsWith('hi')) return 'hi';
  if (browserLang.startsWith('sw')) return 'sw';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || detectBrowserLanguage();
  });

  // Persist to localStorage immediately on change
  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update <html lang="..."> for accessibility / SEO
    document.documentElement.lang = lang;
  }, []);

  // Sync language from User entity when auth state changes.
  // The Layout's fetchUserAndSetState calls this via the `syncLanguageFromUser` function.
  const syncLanguageFromUser = useCallback((userLanguage) => {
    if (userLanguage && LANGUAGES.some(l => l.code === userLanguage)) {
      setLanguage(userLanguage);
    }
  }, [setLanguage]);

  // Persist language preference to the User entity (for logged-in users)
  const persistLanguageToUser = useCallback(async (lang) => {
    try {
      await base44.auth.updateMe({ language: lang });
    } catch (err) {
      // Silently fail — user may not be logged in
      console.debug('Could not persist language to user entity:', err.message);
    }
  }, []);

  // Public setter: updates state, localStorage, and user entity
  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    persistLanguageToUser(lang);
  }, [setLanguage, persistLanguageToUser]);

  // Set html lang on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translation function: returns the translated string for the current language,
  // falling back to English, then to the key itself.
  const t = useCallback((key) => {
    const langDict = uiTranslations[language] || {};
    const enDict = uiTranslations.en || {};
    return langDict[key] ?? enDict[key] ?? key;
  }, [language]);

  const value = {
    language,
    changeLanguage,
    syncLanguageFromUser,
    t,
    languages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};