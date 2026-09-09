'use client';

import { useState, useTransition, useEffect } from 'react';
import { createMeasureOriginal, createTestAfterMeasure, getMeasureOriginal } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentDetailHref } from '@/lib/nav';
import { handleFormKeyDown } from '@/lib/form';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import type { BridgeShape, MicrophonePosition } from '@/types';
import { useI18n } from '@/i18n';
import { pickupPositionLabel } from '@/lib/i18n-labels';

export default function MeasuresPage() {
  const id = useInstrumentId();
  const { t } = useI18n();

  const [step, setStep] = useState<'form' | 'recap' | 'tests' | 'done'>('form');
  const [isPending, startTransition] = useTransition();
  const [numMics, setNumMics] = useState(2);
  const [form, setForm] = useState({
    actionBass12: '',
    actionTreble12: '',
    courbureManche10: '',
    formePontet: 'radius' as BridgeShape,
  });
  const [micros, setMicros] = useState<{ bass: string; treble: string }[]>([]);
  const [tests, setTests] = useState({ frise: false, vibrations: false, son: 'ok' as 'ok' | 'ko' });
  const [hasMeasure, setHasMeasure] = useState<boolean | null>(null);

  useEffect(() => {
    getMeasureOriginal(id).then(measure => setHasMeasure(!!measure));
  }, [id]);

  const positions: MicrophonePosition[] = numMics === 1 ? ['neck'] : numMics === 2 ? ['neck', 'bridge'] : ['neck', 'middle', 'bridge'];

  const getMicro = (_pos: MicrophonePosition, idx: number) => micros[idx] || { bass: '', treble: '' };

  const updateMicro = (pos: MicrophonePosition, field: 'bass' | 'treble', value: string) => {
    const idx = positions.indexOf(pos);
    if (idx === -1) return;
    setMicros(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleNext = () => {
    if (!form.actionBass12 || !form.actionTreble12 || !form.courbureManche10) return;
    setStep('recap');
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const measure = await createMeasureOriginal({
          instrumentId: id,
          actionBass12: parseFloat(form.actionBass12),
          actionTreble12: parseFloat(form.actionTreble12),
          courbureManche10: parseFloat(form.courbureManche10),
          formePontet: form.formePontet,
          dateMesure: new Date().toISOString().split('T')[0],
        }, positions.map((pos, i) => ({
          position: pos,
          hauteurBass: parseFloat(micros[i]?.bass || '0'),
          hauteurTreble: parseFloat(micros[i]?.treble || '0'),
        })));

        await createTestAfterMeasure({
          mesureOriginaleId: measure.id,
          ...tests,
        });

        setStep('done');
      } catch (err) {
        console.error('Failed to save measures:', err);
        alert(t('common.error.save', { message: (err as Error).message }));
      }
    });
  };

  const stepTitle = () => {
    if (step !== 'form') {
      return step === 'recap' ? t('measForm.recapTitle') : t('measForm.testsTitle');
    }
    if (hasMeasure === null) return t('common.loading');
    return hasMeasure ? t('measForm.titleNew') : t('measForm.titleFirst');
  };

  const recapItems = [
    { label: t('measForm.actionGrave'), value: `${form.actionBass12} mm` },
    { label: t('measForm.actionAigu'), value: `${form.actionTreble12} mm` },
    { label: t('measForm.relief'), value: `${form.courbureManche10} mm` },
    { label: t('measForm.bridgeShape'), value: t(form.formePontet === 'radius' ? 'shape.radius' : 'shape.adjust') },
    ...positions.map((pos, i) => ({
      label: t('measForm.micHeight', { position: pickupPositionLabel(t, pos) }),
      value: `${t('measForm.grave')}: ${micros[i]?.bass || 0} mm | ${t('measForm.aigu')}: ${micros[i]?.treble || 0} mm`,
    })),
    { label: t('measForm.fretBuzz'), value: tests.frise ? t('common.yes') : t('common.no') },
    { label: t('measForm.vibrations'), value: tests.vibrations ? t('common.yes') : t('common.no') },
    { label: t('measForm.sound'), value: t(tests.son === 'ok' ? 'common.ok' : 'common.ko') },
  ];

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Check size={48} className="mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-4">{t('measForm.doneTitle')}</h1>
        <p className="text-muted-foreground mb-8">{t('measForm.doneText')}</p>
        <Link href={instrumentDetailHref(id)} className="btn-primary">{t('measForm.backToInstrument')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={instrumentDetailHref(id)} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label={t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{stepTitle()}</h1>
      </div>

      {step === 'form' && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }} onKeyDown={handleFormKeyDown} className="space-y-6">
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>{t('measForm.actionGrave')} mm</label>
                <input type="number" step="0.1" value={form.actionBass12} onChange={e => setForm(f => ({ ...f, actionBass12: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>{t('measForm.actionAigu')} mm</label>
                <input type="number" step="0.1" value={form.actionTreble12} onChange={e => setForm(f => ({ ...f, actionTreble12: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label>{t('measForm.relief')} mm</label>
              <input type="number" step="0.01" value={form.courbureManche10} onChange={e => setForm(f => ({ ...f, courbureManche10: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>{t('measForm.bridgeShape')}</label>
              <select value={form.formePontet} onChange={e => setForm(f => ({ ...f, formePontet: e.target.value as BridgeShape }))}>
                <option value="radius">{t('shape.radius')}</option>
                <option value="adjust">{t('shape.adjust')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('measForm.micCount')}</label>
              <select value={numMics} onChange={e => { setNumMics(Number(e.target.value)); setMicros(Array(Number(e.target.value)).fill({ bass: '', treble: '' })); }}>
                <option value="1">{t('measForm.mics.one')}</option>
                <option value="2">{t('measForm.mics.two')}</option>
                <option value="3">{t('measForm.mics.three')}</option>
              </select>
            </div>

            {positions.map((pos, i) => (
              <div key={pos} className="card p-4">
                <p className="font-medium mb-2">{pickupPositionLabel(t, pos)}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>{t('measForm.sideGrave')} mm</label>
                    <input type="number" step="0.1" placeholder="0.0" value={micros[i]?.bass || ''} onChange={e => updateMicro(pos, 'bass', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{t('measForm.sideAigu')} mm</label>
                    <input type="number" step="0.1" placeholder="0.0" value={micros[i]?.treble || ''} onChange={e => updateMicro(pos, 'treble', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full">
            {t('measForm.seeRecap')}
          </button>
        </form>
      )}

      {step === 'recap' && (
        <div className="space-y-6">
          <div className="card space-y-3">
            <h3 className="font-medium text-lg mb-4">{t('measForm.recapTitle')}</h3>
            {recapItems.map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-secondary flex-1">
              {t('common.back')}
            </button>
            <button onClick={() => setStep('tests')} className="btn-primary flex-1">
              {t('measForm.tests')}
            </button>
          </div>
        </div>
      )}

      {step === 'tests' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-medium text-lg mb-4">{t('measForm.testsTitle')}</h3>

            <div className="form-group">
              <label>{t('measForm.fretBuzz')}</label>
              <select value={tests.frise ? 'yes' : 'no'} onChange={e => setTests(tst => ({ ...tst, frise: e.target.value === 'yes' }))}>
                <option value="yes">{t('common.yes')}</option>
                <option value="no">{t('common.no')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('measForm.vibrations')}</label>
              <select value={tests.vibrations ? 'yes' : 'no'} onChange={e => setTests(tst => ({ ...tst, vibrations: e.target.value === 'yes' }))}>
                <option value="yes">{t('common.yes')}</option>
                <option value="no">{t('common.no')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('measForm.sound')}</label>
              <select value={tests.son} onChange={e => setTests(tst => ({ ...tst, son: e.target.value as 'ok' | 'ko' }))}>
                <option value="ok">{t('common.ok')}</option>
                <option value="ko">{t('common.ko')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('recap')} className="btn-secondary flex-1">
              {t('common.back')}
            </button>
            <button onClick={handleSubmit} disabled={isPending} className="btn-primary flex-1">
              {isPending ? t('measForm.saving') : t('measForm.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
