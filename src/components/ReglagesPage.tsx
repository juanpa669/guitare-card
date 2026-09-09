'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createReglage, getInstrument } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentDetailHref } from '@/lib/nav';
import { handleFormKeyDown } from '@/lib/form';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import type { MicrophonePosition } from '@/types';
import { PICKUP_BRANDS, getStringsForCount, STRING_LABELS_GUITAR } from '@/lib/constants';
import { useI18n } from '@/i18n';
import { pickupPositionLabel } from '@/lib/i18n-labels';

const RADIUS_STATES = [
  { value: 'ok', key: 'rc.ok' },
  { value: 'ko', key: 'rc.ko' },
  { value: 'paufiner', key: 'rc.paufiner' },
  { value: 'autre', key: 'rc.autre' },
];

const TOOLTIPS: Record<string, string> = {
  actionSillet: 'tooltip.actionSillet',
  courbureManche: 'tooltip.courbureManche',
  action12frette: 'tooltip.action12frette',
  radiusChevalet: 'tooltip.radiusChevalet',
  intonation: 'tooltip.intonation',
};

export default function ReglagesPage() {
  const id = useInstrumentId();
  const router = useRouter();
  const { t } = useI18n();

  const [isPending, startTransition] = useTransition();
  const [numMics, setNumMics] = useState(2);
  const [instrument, setInstrument] = useState<any>(null);
  const [form, setForm] = useState({
    courbureManche: '',
    action12fretteBass: '',
    action12fretteTreble: '',
    radiusChevalet: 'ok',
    radiusChevaletAutre: '',
    intonation: '',
    dateSaisie: new Date().toISOString().split('T')[0],
  });
  const [micros, setMicros] = useState<{ hauteur: string; microBrand: string; microBrandCustom: string }[]>([]);
  const [cordes, setCordes] = useState<{ hauteur: string; stringNum: number; stringLabel: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getInstrument(id).then(inst => {
      if (inst) setInstrument(inst);
    });
  }, [id]);

  useEffect(() => {
    if (instrument?.nombreCordes) {
      const strings = getStringsForCount(instrument.nombreCordes, instrument.type);
      setCordes(strings.map((s, i) => ({
        hauteur: '',
        stringNum: i + 1,
        stringLabel: s.label,
      })));
    } else {
      setCordes(STRING_LABELS_GUITAR.slice(0, 6).map((label, i) => ({
        hauteur: '',
        stringNum: i + 1,
        stringLabel: label,
      })));
    }
  }, [instrument]);

  useEffect(() => {
    if (instrument?.nombreMicros) {
      setNumMics(instrument.nombreMicros);
      setMicros(Array(instrument.nombreMicros).fill({ hauteur: '', microBrand: '', microBrandCustom: '' }));
    } else {
      setNumMics(2);
      setMicros(Array(2).fill({ hauteur: '', microBrand: '', microBrandCustom: '' }));
    }
  }, [instrument]);

  const positions: MicrophonePosition[] = numMics === 1 ? ['neck'] : numMics === 2 ? ['neck', 'bridge'] : numMics === 3 ? ['neck', 'middle', 'bridge'] : [];

  const updateMicro = (idx: number, field: string, value: string) => {
    setMicros(prev => {
      const newMicros = [...prev];
      newMicros[idx] = { ...newMicros[idx], [field]: value };
      return newMicros;
    });
  };

  const updateCorde = (idx: number, value: string) => {
    const newCordes = [...cordes];
    newCordes[idx] = { ...newCordes[idx], hauteur: value };
    setCordes(newCordes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courbureManche || form.action12fretteBass === '' || form.action12fretteTreble === '') return;

    const mandatoryCordes = cordes.filter(c =>
      c.stringLabel.includes('grave') || c.stringLabel.includes('aigu')
    );
    const hasEmptyMandatory = mandatoryCordes.some(c => !c.hauteur);
    if (hasEmptyMandatory) {
      setErrorMsg(t('reglagesForm.mandatoryStrings'));
      return;
    }
    setErrorMsg('');

    startTransition(async () => {
      try {
        await createReglage({
          instrumentId: id,
          dateSaisie: form.dateSaisie,
          courbureManche: parseFloat(form.courbureManche),
          action12fretteBass: parseFloat(form.action12fretteBass),
          action12fretteTreble: parseFloat(form.action12fretteTreble),
          radiusChevalet: form.radiusChevalet,
          radiusChevaletAutre: form.radiusChevalet === 'autre' ? form.radiusChevaletAutre.trim() || null : null,
          intonation: form.intonation,
          ordre: 0,
        }, positions.map((pos, i) => {
          const micro = micros[i];
          return {
            position: pos,
            hauteur: parseFloat(micro?.hauteur || '0'),
            microBrand: micro?.microBrand
              ? micro.microBrand === 'Autres'
                ? micro.microBrandCustom || null
                : micro.microBrand
              : null,
          };
        }), cordes.map(c => ({
          stringNum: c.stringNum,
          stringLabel: c.stringLabel,
          hauteur: parseFloat(c.hauteur || '0'),
        })));
        router.push(instrumentDetailHref(id));
      } catch (err) {
        console.error('Failed to save reglage:', err);
        alert(t('common.error.save', { message: (err as Error).message }));
      }
    });
  };

  const renderTooltip = (key: string) => (
    <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label={t('common.info')}>
      <Info size={14} className="text-muted-foreground" />
      <span className="tooltip-text">{t(TOOLTIPS[key])}</span>
    </span>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={instrumentDetailHref(id)} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{t('reglagesForm.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>{t('reglagesForm.entryDate')}</label>
            <input type="date" value={form.dateSaisie} onChange={e => setForm(f => ({ ...f, dateSaisie: e.target.value }))} />
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>{t('reglagesForm.nutAction')}</label>
              {renderTooltip('actionSillet')}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{t('reglagesForm.mandatoryHint')}</p>
            {errorMsg && <p className="text-xs text-destructive mb-2">{errorMsg}</p>}
            <div className="space-y-2">
              {cordes.map((corde, idx) => {
                const isMandatory = corde.stringLabel.includes('grave') || corde.stringLabel.includes('aigu');
                return (
                  <div key={corde.stringNum} className="flex items-center gap-2">
                    <span className="text-sm w-20 flex-shrink-0">
                      {corde.stringLabel}
                      {isMandatory && <span className="text-destructive ml-1">*</span>}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="mm"
                      value={corde.hauteur}
                      onChange={e => updateCorde(idx, e.target.value)}
                      required={isMandatory}
                      className="flex-1"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>{t('reglagesForm.reliefLabel')}</label>
              {renderTooltip('courbureManche')}
            </div>
            <input type="number" step="0.01" value={form.courbureManche} onChange={e => setForm(f => ({ ...f, courbureManche: e.target.value }))} />
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>{t('reglagesForm.action12Label')}</label>
              {renderTooltip('action12frette')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>{t('common.grave')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.action12fretteBass}
                  onChange={e => setForm(f => ({ ...f, action12fretteBass: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>{t('common.aigu')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.action12fretteTreble}
                  onChange={e => setForm(f => ({ ...f, action12fretteTreble: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>{t('reglagesForm.radiusChevalet')}</label>
              {renderTooltip('radiusChevalet')}
            </div>
            <select
              value={form.radiusChevalet}
              onChange={e => setForm(f => ({ ...f, radiusChevalet: e.target.value }))}
            >
              {RADIUS_STATES.map(state => (
                <option key={state.value} value={state.value}>{t(state.key)}</option>
              ))}
            </select>
          </div>

          {form.radiusChevalet === 'autre' && (
            <div className="form-group">
              <label>{t('common.specify')}</label>
              <input
                type="text"
                value={form.radiusChevaletAutre}
                onChange={e => setForm(f => ({ ...f, radiusChevaletAutre: e.target.value }))}
                placeholder={t('reglagesForm.radiusChevaletPlaceholder')}
              />
            </div>
          )}

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>{t('reglagesForm.intonation')}</label>
              {renderTooltip('intonation')}
            </div>
            <input type="text" value={form.intonation} onChange={e => setForm(f => ({ ...f, intonation: e.target.value }))} placeholder={t('reglagesForm.intonationPlaceholder')} />
          </div>

          <div className="form-group">
            <label>{t('measForm.micCount')}</label>
            <select
              value={numMics}
              onChange={e => {
                setNumMics(Number(e.target.value));
                setMicros(Array(Number(e.target.value)).fill({ hauteur: '', microBrand: '', microBrandCustom: '' }));
              }}
            >
              <option value="1">{t('measForm.mics.one')}</option>
              <option value="2">{t('measForm.mics.two')}</option>
              <option value="3">{t('measForm.mics.three')}</option>
            </select>
          </div>

          {positions.map((pos, i) => {
            const posIndex = positions.indexOf(pos);
            const micro = micros[posIndex] || { hauteur: '', microBrand: '', microBrandCustom: '' };
            const isCustomMicroBrand = micro.microBrand === 'Autres';
            return (
              <div key={pos} className="card p-4">
                <p className="font-medium mb-2">{pickupPositionLabel(t, pos)}</p>
                <div className="form-group">
                  <label>{t('reglagesForm.microBrand')}</label>
                  <select
                    value={micro.microBrand}
                    onChange={e => {
                      updateMicro(posIndex, 'microBrand', e.target.value);
                      if (e.target.value !== 'Autres') {
                        updateMicro(posIndex, 'microBrandCustom', '');
                      }
                    }}
                  >
                    <option value="">{t('common.selectOption')}</option>
                    {PICKUP_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                {isCustomMicroBrand && (
                  <div className="form-group">
                    <label>{t('reglagesForm.customBrand')}</label>
                    <input
                      type="text"
                      value={micro.microBrandCustom}
                      onChange={e => updateMicro(posIndex, 'microBrandCustom', e.target.value)}
                      placeholder={t('reglagesForm.customBrandPlaceholder')}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>{t('reglagesForm.height')}</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={micro.hauteur}
                    onChange={e => updateMicro(posIndex, 'hauteur', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? t('reglagesForm.saving') : t('reglagesForm.submit')}
        </button>
      </form>
    </div>
  );
}
