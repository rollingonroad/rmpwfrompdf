'use client';

import { createContext, useContext, ReactNode } from 'react';
import { en } from './en';
import { zh } from './zh';

type TranslationKeys = keyof typeof en;

const translations = { en, zh };

type Language = 'en' | 'zh';

interface I18nContextType {
  locale: Language;
  t: (key: TranslationKeys) => string;
  setLocale: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  locale = 'en',
}: {
  children: ReactNode;
  locale?: Language;
}) {
  const t = (key: TranslationKeys) => translations[locale][key] || key;
  const setLocale = (lang: Language) => {
    // In a real app, persist to cookie/localStorage
    console.log('setLocale:', lang);
  };

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export type { Language, TranslationKeys };