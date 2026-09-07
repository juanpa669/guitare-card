'use client';

import { useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createReglage, getMeasureOriginal } from '@/lib/actions';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { MicrophonePosition } from '@/types';

export default function ReglagesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [numMics, setNumMics] = useState(2);
  const [form, setForm] = useState({
    actionSillet: '',
    courbureManche: '',
    action12frette: '',
    radiusChevalet: '',
    intonation: '',
    dateSaisie: new Date().toISOString().split('T')[0],
  });
  const [micros, setMicros] = useState<{ hauteur: string }[]>([]);

  const positions: MicrophonePosition[] = numMics === 1 ? ['neck'] : numMics === 2 ? ['neck', 'bridge'] : ['neck', 'middle', 'bridge'];

  const updateMicro = (idx: number, value: string) => {
    const newMicros = [...micros];
    newMicros[idx] = { hauteur: value };
    setMicros(newMicros);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createReglage({
        instrumentId: id,
        dateSaisie: form.dateSaisie,
        actionSillet: parseFloat(form.actionSillet),
        courbureManche: parseFloat(form.courbureManche),
        action12frette: parseFloat(form.action12frette),
        radiusChevalet: parseFloat(form.radiusChevalet),
        intonation: form.intonation,
        ordre: 0,
      }, positions.map((pos, i) => ({
        position: pos,
        hauteur: parseFloat(micros[i]?.hauteur || '0'),
      })));
      router.push(`/instruments/${id}`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/instruments/${id}`} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nouveau réglage</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>Date de saisie</label>
            <input type="date" value={form.dateSaisie} onChange={e => setForm(f => ({ ...f, dateSaisie: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Action au sillet (mm)</label>
            <input type="number" step="0.1" value={form.actionSillet} onChange={e => setForm(f => ({ ...f, actionSillet: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Courbure du manche (mm)</label>
            <input type="number" step="0.01" value={form.courbureManche} onChange={e => setForm(f => ({ ...f, courbureManche: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Action 12ème frette (mm)</label>
            <input type="number" step="0.1" value={form.action12frette} onChange={e => setForm(f => ({ ...f, action12frette: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Radius cordes au chevalet (pouces)</label>
            <input type="number" step="0.1" value={form.radiusChevalet} onChange={e => setForm(f => ({ ...f, radiusChevalet: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Intonation</label>
            <input type="text" value={form.intonation} onChange={e => setForm(f => ({ ...f, intonation: e.target.value }))} placeholder="Notes ou remarques..." />
          </div>

          <div className="form-group">
            <label>Nombre de micros</label>
            <select value={numMics} onChange={e => { setNumMics(Number(e.target.value)); setMicros(Array(Number(e.target.value)).fill({ hauteur: '' })); }}>
              <option value="1">1 micro</option>
              <option value="2">2 micros</option>
              <option value="3">3 micros</option>
            </select>
          </div>

          {positions.map((pos, i) => (
            <div key={pos} className="card p-4">
              <p className="font-medium mb-2">{pos === 'neck' ? 'Neck' : pos === 'middle' ? 'Middle' : 'Bridge'}</p>
              <div className="form-group">
                <label>Hauteur (mm)</label>
                <input type="number" step="0.1" placeholder="0.0" value={micros[i]?.hauteur || ''} onChange={e => updateMicro(i, e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Enregistrement...' : 'Enregistrer le réglage'}
        </button>
      </form>
    </div>
  );
}
