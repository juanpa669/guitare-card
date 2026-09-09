'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { resolveMessage, type Dict, type Lang } from './core';
import fr from './fr';
import en from './en';

export type { Lang };

const LANGS: Lang[] = ['fr', 'en'];
const STORAGE_KEY = 'guitar-card-lang';
const DICTS: Record<Lang, Dict> = { fr, en };

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function fallbackT(key: string, params?: Record<string, string | number>): string {
  return resolveMessage(DICTS, 'fr', key, params);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'fr' || stored === 'en') setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number>) =>
    resolveMessage(DICTS, lang, key, params);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  // Hors provider (tests, rendus isolés) : français par défaut, stable.
  return { lang: 'fr', setLang: () => {}, t: fallbackT };
}

export function isLang(value: string | null): value is Lang {
  return value === 'fr' || value === 'en';
}

export { LANGS };
