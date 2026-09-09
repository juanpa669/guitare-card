'use client';

import { useEffect, useState } from 'react';
import { getInstruments } from '@/lib/storage';
import { instrumentDetailHref } from '@/lib/nav';
import Link from 'next/link';
import type { Instrument } from '@/types';
import { ArrowLeft, Music, Settings } from 'lucide-react';

export default function StatusPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstruments().then(setInstruments).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">État des instruments</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Chargement...</p>
      ) : instruments.length === 0 ? (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Aucun instrument</p>
          <Link href="/instruments" className="btn-primary mt-4 inline-block">Voir les instruments</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {instruments.map(inst => (
            <Link
              key={inst.id}
              href={instrumentDetailHref(inst.id)}
              className="card block hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {inst.marque} {inst.modele}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {inst.type === 'guitar' ? 'Guitare' : inst.type === 'bass' ? 'Basse' : 'Ukulélé'}
                      {inst.surnom ? ` — ${inst.surnom}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {inst.diapason.value}mm · Radius {inst.radius}
                    </p>
                  </div>
                </div>
                <Settings size={16} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
