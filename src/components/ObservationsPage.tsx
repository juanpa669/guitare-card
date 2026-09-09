'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getObservation, createOrUpdateObservation } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentDetailHref } from '@/lib/nav';
import { handleFormKeyDown } from '@/lib/form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { FretCondition, SaddleCondition } from '@/types';
import { useI18n } from '@/i18n';

const GAUGES = [
  '8-38', '9-42', '9-46', '10-46', '10-50', '11-52',
  '12-53', '13-56', '14-56', '16-58', '17-59', '18-60',
  '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60'
];

export default function ObservationsPage() {
  const router = useRouter();
  const id = useInstrumentId();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    cordesGauge: '',
    controles: '',
    etatCordes: '',
    etatFrettes: 'ras' as FretCondition,
    frettesAutre: '',
    elementsDevisses: '',
    piecesManquantes: '',
    sillet: 'ok' as SaddleCondition,
    silletAutre: '',
  });

  useEffect(() => {
    getObservation(id).then(obs => {
      if (obs) {
        setForm({
          cordesGauge: obs.cordesGauge,
          controles: obs.controles,
          etatCordes: obs.etatCordes,
          etatFrettes: obs.etatFrettes,
          frettesAutre: obs.frettesAutre || '',
          elementsDevisses: obs.elementsDevisses || '',
          piecesManquantes: obs.piecesManquantes || '',
          sillet: obs.sillet,
          silletAutre: obs.silletAutre || '',
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createOrUpdateObservation({
          instrumentId: id,
          ...form,
          frettesAutre: form.etatFrettes === 'other' ? form.frettesAutre : null,
          silletAutre: form.sillet === 'other' ? form.silletAutre : null,
        });
        router.push(instrumentDetailHref(id));
      } catch (err) {
        console.error('Failed to save observation:', err);
        alert(t('common.error.save', { message: (err as Error).message }));
      }
    });
  };

  if (loading) return <div className="text-center py-12">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={instrumentDetailHref(id)} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{t('obsForm.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>{t('obsForm.gaugeLabel')}</label>
            <select value={form.cordesGauge} onChange={e => setForm(f => ({ ...f, cordesGauge: e.target.value }))}>
              <option value="">{t('common.selectOption')}</option>
              {GAUGES.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('obsForm.stringsStateLabel')}</label>
            <input type="text" value={form.etatCordes} onChange={e => setForm(f => ({ ...f, etatCordes: e.target.value }))} placeholder={t('obsForm.stringsStatePlaceholder')} />
          </div>

          <div className="form-group">
            <label>{t('obsForm.fretsStateLabel')}</label>
            <select value={form.etatFrettes} onChange={e => setForm(f => ({ ...f, etatFrettes: e.target.value as FretCondition }))}>
              <option value="ras">{t('state.frets.ras')}</option>
              <option value="polish">{t('state.frets.polish')}</option>
              <option value="planarity">{t('state.frets.planarity')}</option>
              <option value="other">{t('state.other')}</option>
            </select>
          </div>

          {form.etatFrettes === 'other' && (
            <div className="form-group">
              <label>{t('common.specify')}</label>
              <input type="text" value={form.frettesAutre} onChange={e => setForm(f => ({ ...f, frettesAutre: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label>{t('obsForm.loosePartsLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></label>
            <input type="text" value={form.elementsDevisses} onChange={e => setForm(f => ({ ...f, elementsDevisses: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>{t('obsForm.missingPartsLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></label>
            <input type="text" value={form.piecesManquantes} onChange={e => setForm(f => ({ ...f, piecesManquantes: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>{t('obsForm.saddleLabel')}</label>
            <select value={form.sillet} onChange={e => setForm(f => ({ ...f, sillet: e.target.value as SaddleCondition }))}>
              <option value="ok">{t('state.saddle.ok')}</option>
              <option value="change">{t('state.saddle.change')}</option>
              <option value="adjust">{t('state.saddle.adjust')}</option>
              <option value="other">{t('state.other')}</option>
            </select>
          </div>

          {form.sillet === 'other' && (
            <div className="form-group">
              <label>{t('common.specify')}</label>
              <input type="text" value={form.silletAutre} onChange={e => setForm(f => ({ ...f, silletAutre: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label>{t('obsForm.quickChecksLabel')}</label>
            <textarea
              rows={4}
              value={form.controles}
              onChange={e => setForm(f => ({ ...f, controles: e.target.value }))}
              placeholder={t('obsForm.quickChecksPlaceholder')}
            />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? t('editForm.saving') : t('editForm.submit')}
        </button>
      </form>
    </div>
  );
}
