'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getInstrument, getObservation, getMeasures, getReglages, deleteInstrument, DATA_CHANGED_EVENT } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentEditHref, instrumentMeasuresHref, instrumentObservationsHref, instrumentReglagesHref } from '@/lib/nav';
import Link from 'next/link';
import type { Instrument, Observation, Reglage } from '@/types';
import { ArrowLeft, Pencil, Trash2, ClipboardList, Ruler, Settings, History, ArrowUpDown } from 'lucide-react';
import { formatFrenchDate, formatTime } from '@/lib/dates';
import { useI18n } from '@/i18n';
import { instrumentTypeLabel, pickupPositionLabel, radiusDisplayLabel, radiusChevaletLabel } from '@/lib/i18n-labels';

type Tab = 'identification' | 'observations' | 'measures' | 'reglages';

export default function InstrumentDetailPage() {
  const router = useRouter();
  const id = useInstrumentId();
  const { t } = useI18n();

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [observation, setObservation] = useState<Observation | null>(null);
  const [measures, setMeasures] = useState<any[]>([]);
  const [measuresAsc, setMeasuresAsc] = useState(false);
  const [reglages, setReglages] = useState<Reglage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('identification');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const refresh = () => {
      Promise.all([
        getInstrument(id),
        getObservation(id),
        getMeasures(id),
        getReglages(id),
      ]).then(([inst, obs, meas, reg]) => {
        setInstrument(inst);
        setObservation(obs);
        setMeasures(meas || []);
        setReglages(reg || []);
        setLoading(false);
      });
    };
    refresh();
    window.addEventListener(DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, refresh);
  }, [id]);

  const handleDelete = () => {
    if (confirm(t('detail.deleteConfirm'))) {
      startTransition(async () => {
        await deleteInstrument(id);
        router.push('/instruments');
      });
    }
  };

  const measuresOrdered = measuresAsc ? [...measures].reverse() : measures;

  const measureTag = (i: number) => {
    const total = measuresOrdered.length;
    if (total === 1) return t('detail.meas.first');
    if (i === 0) return measuresAsc ? t('detail.meas.first') : t('detail.meas.last');
    if (i === total - 1) return measuresAsc ? t('detail.meas.last') : t('detail.meas.first');
    return formatTime(measuresOrdered[i].createdAt) ?? '';
  };

  const fretsLabel = (obs: Observation) => {
    if (obs.etatFrettes === 'ras') return t('state.frets.ras');
    if (obs.etatFrettes === 'polish') return t('state.frets.polish');
    if (obs.etatFrettes === 'planarity') return t('state.frets.planarity');
    return obs.frettesAutre || t('state.other');
  };

  const saddleLabel = (obs: Observation) => {
    if (obs.sillet === 'ok') return t('state.saddle.ok');
    if (obs.sillet === 'change') return t('state.saddle.change');
    if (obs.sillet === 'adjust') return t('state.saddle.adjust');
    return obs.silletAutre || t('state.other');
  };

  if (loading) return <div className="text-center py-12">{t('common.loading')}</div>;
  if (!instrument) return <div className="text-center py-12">{t('detail.notFound')}</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'identification', label: t('detail.tab.identification'), icon: <Pencil size={16} /> },
    { key: 'observations', label: t('detail.tab.observations'), icon: <ClipboardList size={16} /> },
    { key: 'measures', label: t('detail.tab.measures'), icon: <Ruler size={16} /> },
    { key: 'reglages', label: t('detail.tab.reglages'), icon: <Settings size={16} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/instruments" className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{instrument.marque} {instrument.modele}</h1>
            {instrument.surnom && <p className="text-sm text-muted-foreground">{instrument.surnom}</p>}
          </div>
        </div>
        <button onClick={handleDelete} className="btn-destructive p-2" aria-label={t('detail.deleteAria')}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'identification' && (
        <Link href={instrumentEditHref(id)} className="card block">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.type')}</span>
              <span>{instrumentTypeLabel(t, instrument.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.brand')}</span>
              <span>{instrument.marque}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.model')}</span>
              <span>{instrument.modele}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.diapason')}</span>
              <span>{instrument.diapason.value} mm ({instrument.diapason.label})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.radius')}</span>
              <span>{radiusDisplayLabel(t, instrument.radius)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('field.createdDate')}</span>
              <span>{formatFrenchDate(instrument.dateCreation) ?? instrument.dateCreation}</span>
            </div>
          </div>
          <p className="text-sm text-primary mt-4 text-center">{t('detail.editCta')} →</p>
        </Link>
      )}

      {activeTab === 'observations' && (
        observation ? (
          <>
            <div className="card space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('field.strings')}</span>
                <span>{observation.cordesGauge}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('field.stringsState')}</span>
                <span>{observation.etatCordes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('field.fretsState')}</span>
                <span>{fretsLabel(observation)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('field.saddle')}</span>
                <span>{saddleLabel(observation)}</span>
              </div>
              {observation.controles && (
                <div>
                  <span className="text-muted-foreground">{t('field.quickChecks')}</span>
                  <p className="mt-1">{observation.controles}</p>
                </div>
              )}
            </div>
            <Link href={instrumentObservationsHref(id)} className="btn-primary w-full block text-center mt-4">
              {t('detail.editObservations')}
            </Link>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('detail.noObservations')}</p>
            <Link href={instrumentObservationsHref(id)} className="btn-primary">{t('common.add')}</Link>
          </div>
        )
      )}

      {activeTab === 'measures' && (
        measures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('detail.noMeasures')}</p>
            <Link href={instrumentMeasuresHref(id)} className="btn-primary">{t('measForm.titleFirst')}</Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => setMeasuresAsc(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-accent transition-colors"
                aria-label={t('detail.sortAria')}
              >
                <ArrowUpDown size={14} />
                {measuresAsc ? t('detail.sortOldest') : t('detail.sortRecent')}
              </button>
            </div>
            {measuresOrdered.map((m, i) => (
              <div key={m.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{formatFrenchDate(m.dateMesure) ?? m.dateMesure}</span>
                  <span className="text-xs text-muted-foreground">{measureTag(i)}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('measForm.actionGrave')}</span><span>{m.actionBass12} mm</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('measForm.actionAigu')}</span><span>{m.actionTreble12} mm</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('measForm.relief')}</span><span>{m.courbureManche10} mm</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('measForm.bridgeShape')}</span><span>{t(m.formePontet === 'radius' ? 'shape.radius' : 'shape.adjust')}</span></div>
                </div>
                {m.micros.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1 text-sm">
                    <p className="text-xs text-muted-foreground">{t('field.microHeights')}</p>
                    {m.micros.map((mic: any) => (
                      <div key={mic.id} className="flex justify-between pl-3">
                        <span className="text-muted-foreground">{pickupPositionLabel(t, mic.position)}</span>
                        <span>{t('detail.micLine', { grave: mic.hauteurBass, aigu: mic.hauteurTreble })}</span>
                      </div>
                    ))}
                  </div>
                )}
                {m.test && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1 text-sm">
                    <p className="text-xs text-muted-foreground">{t('measForm.tests')}</p>
                    <div className="flex justify-between pl-3"><span className="text-muted-foreground">{t('measForm.fretBuzz')}</span><span>{m.test.frise ? t('common.yes') : t('common.no')}</span></div>
                    <div className="flex justify-between pl-3"><span className="text-muted-foreground">{t('measForm.vibrations')}</span><span>{m.test.vibrations ? t('common.yes') : t('common.no')}</span></div>
                    <div className="flex justify-between pl-3"><span className="text-muted-foreground">{t('measForm.sound')}</span><span>{t(m.test.son === 'ok' ? 'common.ok' : 'common.ko')}</span></div>
                  </div>
                )}
              </div>
            ))}
            <Link href={instrumentMeasuresHref(id)} className="btn-primary w-full block text-center">
              {t('detail.addMeasures')}
            </Link>
          </div>
        )
      )}

      {activeTab === 'reglages' && (
        <div className="space-y-3">
          {reglages.length > 0 ? (
            reglages.map((reg, i) => (
              <div key={reg.id} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <History size={16} className="text-muted-foreground" />
                  <span className="font-medium">{t('detail.reg.num', { n: i + 1 })}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{formatFrenchDate(reg.dateSaisie) ?? reg.dateSaisie}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">{t('field.relief')}:</span> {reg.courbureManche} mm</div>
                  <div><span className="text-muted-foreground">{t('detail.reg.actionBass')}:</span> {reg.action12fretteBass ?? '—'} mm</div>
                  <div><span className="text-muted-foreground">{t('detail.reg.actionTreble')}:</span> {reg.action12fretteTreble ?? '—'} mm</div>
                  <div><span className="text-muted-foreground">{t('field.radiusChevalet')}:</span> {radiusChevaletLabel(t, reg.radiusChevalet, reg.radiusChevaletAutre)}</div>
                  {reg.microBrand && <div><span className="text-muted-foreground">{t('detail.reg.microGlobal')}:</span> {reg.microBrand}</div>}
                </div>
                {reg.micros && reg.micros.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('detail.reg.microsHeader')}:</p>
                    {reg.micros.map(m => (
                      <div key={m.id} className="text-xs mb-1">
                        <span className="font-medium">{pickupPositionLabel(t, m.position)}</span>
                        {m.microBrand && <span className="text-muted-foreground ml-1">({m.microBrand})</span>}
                        <span className="text-muted-foreground ml-1">{m.hauteur} mm</span>
                      </div>
                    ))}
                  </div>
                )}
                {reg.cordes && reg.cordes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">{t('detail.reg.stringsHeader')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {reg.cordes.map(c => (
                        <span key={c.id} className="text-xs bg-accent px-2 py-1 rounded">
                          {c.stringLabel}: {c.hauteur}mm
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('detail.noReglages')}</p>
            </div>
          )}
          <Link href={instrumentReglagesHref(id)} className="btn-primary w-full block text-center">
            {t('reglagesForm.title')}
          </Link>
        </div>
      )}
    </div>
  );
}
