'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggle: () => {},
});

const darkVars: Record<string, string> = {
  '--background': '#0a0a0a',
  '--foreground': '#fafafa',
  '--muted': '#a1a1aa',
  '--muted-foreground': '#71717a',
  '--border': '#27272a',
  '--input': '#18181b',
  '--ring': '#6366f1',
  '--primary': '#6366f1',
  '--primary-foreground': '#fafafa',
  '--secondary': '#27272a',
  '--secondary-foreground': '#fafafa',
  '--card': '#18181b',
  '--card-foreground': '#fafafa',
  '--accent': '#27272a',
  '--accent-foreground': '#fafafa',
  '--destructive': '#ef4444',
  '--destructive-foreground': '#fafafa',
};

const lightVars: Record<string, string> = {
  '--background': '#fafafa',
  '--foreground': '#0a0a0a',
  '--muted': '#71717a',
  '--muted-foreground': '#52525b',
  '--border': '#e4e4e7',
  '--input': '#ffffff',
  '--ring': '#4f46e5',
  '--primary': '#4f46e5',
  '--primary-foreground': '#fafafa',
  '--secondary': '#f4f4f5',
  '--secondary-foreground': '#18181b',
  '--card': '#ffffff',
  '--card-foreground': '#18181b',
  '--accent': '#f4f4f5',
  '--accent-foreground': '#18181b',
  '--destructive': '#dc2626',
  '--destructive-foreground': '#fafafa',
};

function applyVars(vars: Record<string, string>) {
  const s = document.documentElement.style;
  for (const [k, v] of Object.entries(vars)) {
    s.setProperty(k, v);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const getInitialTheme = (): Theme => {
    try {
      const stored = localStorage.getItem('guitar-card-theme') as Theme | null;
      if (stored) return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    } catch {
      return 'dark';
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyVars(theme === 'dark' ? darkVars : lightVars);
    localStorage.setItem('guitar-card-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
