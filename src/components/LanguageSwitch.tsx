'use client';

import { Languages } from 'lucide-react';
import { useI18n, isLang } from '@/i18n';
import en from '@/i18n/en';

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  const available = Object.keys(en).length > 0;
  if (!available) return null;

  const cycle = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    if (isLang(next)) setLang(next);
  };

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors flex items-center gap-1"
      aria-label={t('lang.switchAria')}
    >
      <Languages size={16} />
      <span className="text-xs font-semibold uppercase">{lang}</span>
    </button>
  );
}
