import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { PWAProvider } from '@/components/PWAProvider';
import { I18nProvider } from '@/i18n';
import fr from '@/i18n/fr';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guitar Card',
  description: fr['meta.description'],
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Guitar Card',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const vars: Record<string, string> = {
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
  return (
    <html lang="fr" suppressHydrationWarning style={vars as React.CSSProperties}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d,l){try{var t=l.getItem('guitar-card-theme');if(!t&&d.matchMedia('(prefers-color-scheme:dark)').matches)t='dark';if(t==='light'){d.style.setProperty('--background','#fafafa');d.style.setProperty('--foreground','#0a0a0a');d.style.setProperty('--muted','#71717a');d.style.setProperty('--muted-foreground','#52525b');d.style.setProperty('--border','#e4e4e7');d.style.setProperty('--input','#ffffff');d.style.setProperty('--ring','#4f46e5');d.style.setProperty('--primary','#4f46e5');d.style.setProperty('--primary-foreground','#fafafa');d.style.setProperty('--secondary','#f4f4f5');d.style.setProperty('--secondary-foreground','#18181b');d.style.setProperty('--card','#ffffff');d.style.setProperty('--card-foreground','#18181b');d.style.setProperty('--accent','#f4f4f5');d.style.setProperty('--accent-foreground','#18181b');d.style.setProperty('--destructive','#dc2626');d.style.setProperty('--destructive-foreground','#fafafa')}l.setItem('guitar-card-theme',t||'dark')}catch(e){}})(document.documentElement,localStorage)`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            <PWAProvider />
            <div className="min-h-screen flex flex-col">
              <header className="flex justify-end items-center gap-2 p-4">
                <LanguageSwitch />
                <ThemeToggle />
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
