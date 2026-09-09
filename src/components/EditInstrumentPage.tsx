'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getInstrument, updateInstrument } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentDetailHref } from '@/lib/nav';
import { handleFormKeyDown } from '@/lib/form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InstrumentType, Radius } from '@/types';
import { STRING_COUNTS_GUITAR, STRING_COUNTS_BASS, STRING_COUNTS_UKULELE, MICRO_COUNTS, getAllBrands, addCustomBrand } from '@/lib/constants';
import { useI18n } from '@/i18n';
import { radiusDisplayLabel } from '@/lib/i18n-labels';

const DIAPASONS: { value: number; labelKey: string; unit: string; range: string }[] = [
  { value: 596, labelKey: 'newForm.diapason.jaguar', unit: 'mm', range: '23.46"' },
  { value: 609, labelKey: 'newForm.diapason.duosonic', unit: 'mm', range: '24.0"' },
  { value: 628, labelKey: 'newForm.diapason.short', unit: 'mm', range: '24.5–24.75"' },
  { value: 643, labelKey: 'newForm.diapason.medium', unit: 'mm', range: '25–25.5"' },
  { value: 650, labelKey: 'newForm.diapason.long', unit: 'mm', range: '25.5"+' },
  { value: 635, labelKey: 'newForm.diapason.prs', unit: 'mm', range: '25.0"' },
  { value: 702, labelKey: 'newForm.diapason.baritone', unit: 'mm', range: '27.6"' },
];

const RADII: { value: Radius }[] = [
  { value: 'r7_5' },
  { value: 'r9_5' },
  { value: 'r10' },
  { value: 'r12' },
  { value: 'r14' },
  { value: 'r16' },
  { value: 'compound' },
];

export default function EditInstrumentPage() {
  const router = useRouter();
  const id = useInstrumentId();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    type: '' as InstrumentType,
    marque: '',
    marqueCustom: '',
    modele: '',
    surnom: '',
    diapasonValue: 0,
    radius: 'r12' as Radius,
    nombreCordes: 6,
    nombreMicros: 2,
  });
  const [selectedBrand, setSelectedBrand] = useState('');

  const isCustomBrand = selectedBrand === 'Autres';
  const finalBrand = isCustomBrand ? form.marqueCustom : selectedBrand;

  useEffect(() => {
    getInstrument(id).then(inst => {
      if (inst) {
        const allBrands = getAllBrands();
        const brandExists = allBrands.includes(inst.marque as any);
        setSelectedBrand(brandExists ? inst.marque : 'Autres');
        setForm({
          type: inst.type,
          marque: inst.marque,
          marqueCustom: brandExists ? '' : inst.marque,
          modele: inst.modele,
          surnom: inst.surnom || '',
          diapasonValue: inst.diapason.value,
          radius: inst.radius,
          nombreCordes: inst.nombreCordes || 6,
          nombreMicros: inst.nombreMicros || 2,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalBrand?.trim() || !form.modele.trim()) return;

    const diapason = DIAPASONS.find(d => d.value === form.diapasonValue) || DIAPASONS[2];

    startTransition(async () => {
      try {
        if (isCustomBrand && form.marqueCustom.trim()) {
          addCustomBrand(form.marqueCustom.trim());
        }
        await updateInstrument(id, {
          type: form.type,
          marque: finalBrand.trim(),
          modele: form.modele.trim(),
          surnom: form.surnom.trim() || null,
          diapason: { value: diapason.value, unit: 'mm', label: t(diapason.labelKey) },
          radius: form.radius,
          nombreCordes: form.nombreCordes,
          nombreMicros: form.nombreMicros,
        });
        router.push(instrumentDetailHref(id));
      } catch (err) {
        console.error('Failed to update instrument:', err);
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
        <h1 className="text-2xl font-bold">{t('editForm.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>{t('newForm.typeLabel')}</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as InstrumentType }))}
            >
              <option value="guitar">{t('type.guitar')}</option>
              <option value="bass">{t('type.bass')}</option>
              <option value="ukulele">{t('type.ukulele')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('newForm.brandLabel')}</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              required
            >
              <option value="">{t('common.selectBrand')}</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {isCustomBrand && (
            <div className="form-group">
              <label>{t('newForm.customBrandLabel')}</label>
              <input
                type="text"
                value={form.marqueCustom}
                onChange={e => setForm(f => ({ ...f, marqueCustom: e.target.value }))}
                placeholder={t('newForm.brandPlaceholder')}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('newForm.modelLabel')}</label>
            <input type="text" value={form.modele} onChange={e => setForm(f => ({ ...f, modele: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label>{t('newForm.nicknameLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></label>
            <input type="text" value={form.surnom} onChange={e => setForm(f => ({ ...f, surnom: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>{t('newForm.stringCountLabel')}</label>
            <select
              value={form.nombreCordes}
              onChange={e => setForm(f => ({ ...f, nombreCordes: Number(e.target.value) }))}
            >
              {(form.type === 'bass' ? STRING_COUNTS_BASS : form.type === 'ukulele' ? STRING_COUNTS_UKULELE : STRING_COUNTS_GUITAR).map(s => (
                <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('newForm.micCountLabel')}</label>
            <select
              value={form.nombreMicros}
              onChange={e => setForm(f => ({ ...f, nombreMicros: Number(e.target.value) }))}
            >
              {MICRO_COUNTS.map(m => (
                <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('newForm.diapasonLabel')}</label>
            <select
              value={form.diapasonValue}
              onChange={e => setForm(f => ({ ...f, diapasonValue: Number(e.target.value) }))}
            >
              {DIAPASONS.map(d => (
                <option key={d.value} value={d.value}>{t(d.labelKey)} — {d.value} {d.unit} ({d.range})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('newForm.radiusLabel')}</label>
            <select value={form.radius} onChange={e => setForm(f => ({ ...f, radius: e.target.value as Radius }))}>
              {RADII.map(r => (<option key={r.value} value={r.value}>{radiusDisplayLabel(t, r.value)}</option>))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? t('editForm.saving') : t('editForm.submit')}
        </button>
      </form>
    </div>
  );
}
