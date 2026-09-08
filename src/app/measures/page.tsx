'use client';

import { useEffect, useState } from 'react';
import { getInstruments } from '@/lib/storage';
import Link from 'next/link';
import type { Instrument } from '@/types';
import { ArrowLeft, Ruler } from 'lucide-react';

export default function MeasuresPage() {
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
        <h1 className="text-2xl font-bold">Mesures</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Chargement...</p>
      ) : instruments.length === 0 ? (
        <div className="text-center py-12">
          <Ruler size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">Aucun instrument pour créer des mesures</p>
          <Link href="/instruments" className="btn-primary">Voir les instruments</Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm mb-4">Sélectionnez un instrument pour ajouter des mesures</p>
          {instruments.map(inst => (
            <Link
              key={inst.id}
              href={`/instruments/${inst.id}/measures`}
              className="card block hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Ruler size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {inst.marque} {inst.modele}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {inst.type === 'guitar' ? 'Guitare' : inst.type === 'bass' ? 'Basse' : 'Ukulélé'}
                    {inst.surnom ? ` — ${inst.surnom}` : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
