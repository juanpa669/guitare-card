'use client';

import { useState, useTransition } from 'react';
import { createMeasureOriginal, createTestAfterMeasure, getMeasureOriginal } from '@/lib/storage';
import { useInstrumentId } from '@/hooks/useInstrumentId';
import { instrumentDetailHref } from '@/lib/nav';
import { handleFormKeyDown } from '@/lib/form';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { BridgeShape, MicrophonePosition } from '@/types';

export default function MeasuresPage() {
  const id = useInstrumentId();

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

  const positions: MicrophonePosition[] = numMics === 1 ? ['neck'] : numMics === 2 ? ['neck', 'bridge'] : ['neck', 'middle', 'bridge'];

  const getMicro = (_pos: MicrophonePosition, idx: number) => micros[idx] || { bass: '', treble: '' };

  const updateMicro = (pos: MicrophonePosition, field: 'bass' | 'treble', value: string) => {
    const idx = positions.indexOf(pos);
    if (idx === -1) return;
    const newMicros = [...micros];
    newMicros[idx] = { ...newMicros[idx], [field]: value };
    setMicros(newMicros);
  };

  const handleNext = () => {
    if (!form.actionBass12 || !form.actionTreble12 || !form.courbureManche10) return;
    setStep('recap');
  };

  const handleSubmit = () => {
    startTransition(async () => {
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
    });
  };

  const recapItems = [
    { label: 'Action grave (12ème)', value: `${form.actionBass12} mm` },
    { label: 'Action aigu (12ème)', value: `${form.actionTreble12} mm` },
    { label: 'Courbure manche (10ème)', value: `${form.courbureManche10} mm` },
    { label: 'Forme pontet', value: form.formePontet === 'radius' ? 'Au radius' : 'À régler' },
    ...positions.map((pos, i) => ({
      label: `Micro ${pos === 'neck' ? 'Neck' : pos === 'middle' ? 'Middle' : 'Bridge'}`,
      value: `Grave: ${micros[i]?.bass || 0} mm | Aigu: ${micros[i]?.treble || 0} mm`,
    })),
    { label: 'Frise', value: tests.frise ? 'Oui' : 'Non' },
    { label: 'Vibrations', value: tests.vibrations ? 'Oui' : 'Non' },
    { label: 'Son', value: tests.son === 'ok' ? 'OK' : 'KO' },
  ];

  if (step === 'done') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Check size={48} className="mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-4">Mesures enregistrées</h1>
        <p className="text-muted-foreground mb-8">Les mesures et tests ont été sauvegardés avec succès.</p>
        <Link href={instrumentDetailHref(id)} className="btn-primary">Retour à l&apos;instrument</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={instrumentDetailHref(id)} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">
          {step === 'form' ? 'Premières mesures' : step === 'recap' ? 'Récapitulatif' : 'Tests après mesures'}
        </h1>
      </div>

      {step === 'form' && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }} onKeyDown={handleFormKeyDown} className="space-y-6">
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Action (grave 12ème) mm</label>
                <input type="number" step="0.1" value={form.actionBass12} onChange={e => setForm(f => ({ ...f, actionBass12: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Action (aigu 12ème) mm</label>
                <input type="number" step="0.1" value={form.actionTreble12} onChange={e => setForm(f => ({ ...f, actionTreble12: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label>Courbure manche (10ème) mm</label>
              <input type="number" step="0.01" value={form.courbureManche10} onChange={e => setForm(f => ({ ...f, courbureManche10: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Forme des pontets</label>
              <select value={form.formePontet} onChange={e => setForm(f => ({ ...f, formePontet: e.target.value as BridgeShape }))}>
                <option value="radius">Au radius</option>
                <option value="adjust">À régler</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nombre de micros</label>
              <select value={numMics} onChange={e => { setNumMics(Number(e.target.value)); setMicros(Array(Number(e.target.value)).fill({ bass: '', treble: '' })); }}>
                <option value="1">1 micro</option>
                <option value="2">2 micros</option>
                <option value="3">3 micros</option>
              </select>
            </div>

            {positions.map((pos, i) => (
              <div key={pos} className="card p-4">
                <p className="font-medium mb-2">{pos === 'neck' ? 'Neck' : pos === 'middle' ? 'Middle' : 'Bridge'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Côté grave mm</label>
                    <input type="number" step="0.1" placeholder="0.0" value={micros[i]?.bass || ''} onChange={e => updateMicro(pos, 'bass', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Côté aigu mm</label>
                    <input type="number" step="0.1" placeholder="0.0" value={micros[i]?.treble || ''} onChange={e => updateMicro(pos, 'treble', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full">
            Voir le récapitulatif
          </button>
        </form>
      )}

      {step === 'recap' && (
        <div className="space-y-6">
          <div className="card space-y-3">
            <h3 className="font-medium text-lg mb-4">Récapitulatif</h3>
            {recapItems.map(item => (
              <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-secondary flex-1">
              Retour
            </button>
            <button onClick={() => setStep('tests')} className="btn-primary flex-1">
              Tests
            </button>
          </div>
        </div>
      )}

      {step === 'tests' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-medium text-lg mb-4">Tests après mesures</h3>

            <div className="form-group">
              <label>Frise</label>
              <select value={tests.frise ? 'yes' : 'no'} onChange={e => setTests(t => ({ ...t, frise: e.target.value === 'yes' }))}>
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vibrations parasites</label>
              <select value={tests.vibrations ? 'yes' : 'no'} onChange={e => setTests(t => ({ ...t, vibrations: e.target.value === 'yes' }))}>
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>
            </div>

            <div className="form-group">
              <label>Son</label>
              <select value={tests.son} onChange={e => setTests(t => ({ ...t, son: e.target.value as 'ok' | 'ko' }))}>
                <option value="ok">OK</option>
                <option value="ko">KO</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('recap')} className="btn-secondary flex-1">
              Retour
            </button>
            <button onClick={handleSubmit} disabled={isPending} className="btn-primary flex-1">
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
