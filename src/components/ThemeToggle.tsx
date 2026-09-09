'use client';

import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '@/i18n';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
      aria-label={t('theme.toggleAria')}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
