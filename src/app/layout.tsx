import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guitar Card',
  description: 'Fiche de suivi réglages Guitare/Basse',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d,l){try{var t=l.getItem('guitar-card-theme');if(!t&&d.matchMedia('(prefers-color-scheme:dark)').matches)t='dark';if(t==='light'){d.style.setProperty('--background','#fafafa');d.style.setProperty('--foreground','#0a0a0a');d.style.setProperty('--muted','#71717a');d.style.setProperty('--muted-foreground','#52525b');d.style.setProperty('--border','#e4e4e7');d.style.setProperty('--input','#ffffff');d.style.setProperty('--ring','#4f46e5');d.style.setProperty('--primary','#4f46e5');d.style.setProperty('--primary-foreground','#fafafa');d.style.setProperty('--secondary','#f4f4f5');d.style.setProperty('--secondary-foreground','#18181b');d.style.setProperty('--card','#ffffff');d.style.setProperty('--card-foreground','#18181b');d.style.setProperty('--accent','#f4f4f5');d.style.setProperty('--accent-foreground','#18181b');d.style.setProperty('--destructive','#dc2626');d.style.setProperty('--destructive-foreground','#fafafa')}l.setItem('guitar-card-theme',t||'dark')}catch(e){}})(document.documentElement,localStorage)`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <header className="flex justify-end p-4">
              <ThemeToggle />
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
