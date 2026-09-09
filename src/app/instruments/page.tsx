'use client';

import { useEffect, useState } from 'react';
import { getInstruments } from '@/lib/storage';
import { instrumentDetailHref } from '@/lib/nav';
import Link from 'next/link';
import type { Instrument } from '@/types';
import { Guitar, Plus, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/i18n';
import { instrumentTypeLabel } from '@/lib/i18n-labels';

export default function InstrumentsPage() {
  const { t } = useI18n();
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
        <h1 className="text-2xl font-bold">{t('instruments.title')}</h1>
        <div className="flex-1" />
        <Link
          href="/instruments/new"
          aria-label={t('instruments.addAria')}
          className="rounded-full w-12 h-12 flex items-center justify-center shrink-0 bg-primary text-primary-foreground shadow-lg hover:opacity-90 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : instruments.length === 0 ? (
        <div className="text-center py-12">
          <Guitar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">{t('instruments.empty')}</p>
          <Link href="/instruments/new" className="btn-primary">
            {t('instruments.createCta')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {instruments.map(inst => (
            <Link
              key={inst.id}
              href={instrumentDetailHref(inst.id)}
              className="card block hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Guitar size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {inst.marque} {inst.modele}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {instrumentTypeLabel(t, inst.type)}
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
