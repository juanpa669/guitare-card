'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createInstrument } from '@/lib/storage';
import { handleFormKeyDown } from '@/lib/form';
import { TEXT_INPUT_PROPS } from '@/lib/inputProps';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InstrumentType, Diapason, Radius } from '@/types';
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

export default function NewInstrumentPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    type: 'guitar' as InstrumentType,
    marque: '',
    marqueCustom: '',
    modele: '',
    surnom: '',
    diapasonValue: 643,
    radius: 'r12' as Radius,
    nombreCordes: 6,
    nombreMicros: 2,
  });
  const [selectedBrand, setSelectedBrand] = useState('');

  const isCustomBrand = selectedBrand === 'Autres';
  const finalBrand = isCustomBrand ? form.marqueCustom : selectedBrand;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalBrand?.trim() || !form.modele.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const diapason = DIAPASONS.find(d => d.value === form.diapasonValue) || DIAPASONS[2];

    startTransition(async () => {
      try {
        if (isCustomBrand && form.marqueCustom.trim()) {
          addCustomBrand(form.marqueCustom.trim());
        }
        await createInstrument({
          type: form.type,
          marque: finalBrand.trim(),
          modele: form.modele.trim(),
          surnom: form.surnom.trim() || null,
          diapason: { value: diapason.value, unit: 'mm', label: t(diapason.labelKey) },
          radius: form.radius,
          nombreCordes: form.nombreCordes,
          nombreMicros: form.nombreMicros,
          dateCreation: today,
        });
        router.push('/instruments');
      } catch (err) {
        console.error('Failed to create instrument:', err);
        alert(t('common.error.save', { message: (err as Error).message }));
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/instruments" className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{t('newForm.title')}</h1>
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
                {...TEXT_INPUT_PROPS}
                value={form.marqueCustom}
                onChange={e => setForm(f => ({ ...f, marqueCustom: e.target.value }))}
                placeholder={t('newForm.brandPlaceholder')}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('newForm.modelLabel')}</label>
            <input
              type="text"
              {...TEXT_INPUT_PROPS}
              value={form.modele}
              onChange={e => setForm(f => ({ ...f, modele: e.target.value }))}
              required
              placeholder={t('newForm.modelPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label>{t('newForm.nicknameLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></label>
            <input
              type="text"
              {...TEXT_INPUT_PROPS}
              value={form.surnom}
              onChange={e => setForm(f => ({ ...f, surnom: e.target.value }))}
              placeholder={t('newForm.nicknamePlaceholder')}
            />
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
                <option key={d.value} value={d.value}>
                  {t(d.labelKey)} — {d.value} {d.unit} ({d.range})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('newForm.radiusLabel')}</label>
            <select
              value={form.radius}
              onChange={e => setForm(f => ({ ...f, radius: e.target.value as Radius }))}
            >
              {RADII.map(r => (
                <option key={r.value} value={r.value}>{radiusDisplayLabel(t, r.value)}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? t('newForm.creating') : t('newForm.submit')}
        </button>
      </form>
    </div>
  );
}
