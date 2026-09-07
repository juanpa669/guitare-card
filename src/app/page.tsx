'use client';

import Link from 'next/link';
import { Guitar } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">GUITAR CARD</h1>
        <p className="text-muted-foreground">Fiche de suivi réglages</p>
      </div>

      <div className="mb-12">
        <Guitar size={180} className="text-muted-foreground opacity-30" />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <Link
          href="/instruments"
          className="btn-primary flex flex-col items-center gap-2 py-6"
        >
          <Guitar size={24} />
          <span className="text-sm font-medium">Instrument</span>
        </Link>

        <Link
          href="/status"
          className="btn-secondary flex flex-col items-center gap-2 py-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8 6H4m0 0h8m-8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v4m12-4h4m0 0h-8m8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v4"/></svg>
          <span className="text-sm font-medium">État</span>
        </Link>

        <Link
          href="/measures"
          className="btn-secondary flex flex-col items-center gap-2 py-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          <span className="text-sm font-medium">Mesure</span>
        </Link>
      </div>
    </div>
  );
}
