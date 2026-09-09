'use client';

import { useEffect, useState } from 'react';
import { getInstruments, getReglages, getMeasureOriginal, DATA_CHANGED_EVENT } from '@/lib/storage';
import { instrumentDetailHref } from '@/lib/nav';
import { buildStatusSummary, type StatusSummary } from '@/lib/statusSummary';
import { formatFrenchDate, formatTime } from '@/lib/dates';
import Link from 'next/link';
import type { Instrument } from '@/types';
import { ArrowLeft, Music, Settings } from 'lucide-react';
import { useI18n } from '@/i18n';
import { instrumentTypeLabel, radiusDisplayLabel, pickupPositionLabel } from '@/lib/i18n-labels';

export default function StatusPage() {
  const { t } = useI18n();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [summaries, setSummaries] = useState<Record<string, StatusSummary | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const insts = await getInstruments();
      setInstruments(insts);
      const entries = await Promise.all(insts.map(async inst => {
        const [reglages, measure] = await Promise.all([
          getReglages(inst.id),
          getMeasureOriginal(inst.id),
        ]);
        return [inst.id, buildStatusSummary(reglages, measure)] as const;
      }));
      setSummaries(Object.fromEntries(entries));
      setLoading(false);
    };
    load();
    window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{t('status.title')}</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">{t('common.loading')}</p>
      ) : instruments.length === 0 ? (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">{t('common.noInstruments')}</p>
          <Link href="/instruments" className="btn-primary mt-4 inline-block">{t('measuresList.seeInstruments')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {instruments.map(inst => {
            const summary = summaries[inst.id];
            return (
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
                        {instrumentTypeLabel(t, inst.type)}
                        {inst.surnom ? ` — ${inst.surnom}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inst.diapason.value}mm · {t('status.radiusLabel')} {radiusDisplayLabel(t, inst.radius)}
                      </p>
                    </div>
                  </div>
                  <Settings size={16} className="text-muted-foreground" />
                </div>

                {summary && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('status.actionLabel')} <span className="text-xs">{t('status.graveAigu')}</span></span>
                      <span className="font-medium tabular-nums">{summary.action} mm</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('status.reliefLabel')}</span>
                      <span className="font-medium tabular-nums">{summary.courbure} mm</span>
                    </div>
                    {summary.micros.length > 0 && (
                      <div className="pt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">{t('status.microHeights')}</p>
                        {summary.micros.map(m => (
                          <div key={m.position} className="flex items-center justify-between text-sm pl-3">
                            <span className="text-muted-foreground">{pickupPositionLabel(t, m.position)}</span>
                            <span className="font-medium tabular-nums">{m.value} mm</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {summary.recordedAt && (
                      <p className="text-[10px] text-muted-foreground pt-1 text-right">
                        {formatFrenchDate(summary.recordedAt)} · {formatTime(summary.recordedAt)}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
