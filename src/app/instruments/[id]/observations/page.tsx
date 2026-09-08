'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getObservation, createOrUpdateObservation } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { FretCondition, SaddleCondition } from '@/types';

const GAUGES = [
  '8-38', '9-42', '9-46', '10-46', '10-50', '11-52',
  '12-53', '13-56', '14-56', '16-58', '17-59', '18-60',
  '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60'
];

export default function ObservationsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
      await createOrUpdateObservation({
        instrumentId: id,
        ...form,
        frettesAutre: form.etatFrettes === 'other' ? form.frettesAutre : null,
        silletAutre: form.sillet === 'other' ? form.silletAutre : null,
      });
      router.push(`/instruments/${id}`);
    });
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/instruments/${id}`} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Observations</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>Tirant de cordes / Gauge</label>
            <select value={form.cordesGauge} onChange={e => setForm(f => ({ ...f, cordesGauge: e.target.value }))}>
              <option value="">Sélectionner...</option>
              {GAUGES.map(g => (<option key={g} value={g}>{g}</option>))}
            </select>
          </div>

          <div className="form-group">
            <label>État des cordes</label>
            <input type="text" value={form.etatCordes} onChange={e => setForm(f => ({ ...f, etatCordes: e.target.value }))} placeholder="Neuves, usées, rouillées..." />
          </div>

          <div className="form-group">
            <label>État des frettes</label>
            <select value={form.etatFrettes} onChange={e => setForm(f => ({ ...f, etatFrettes: e.target.value as FretCondition }))}>
              <option value="ras">RAS</option>
              <option value="polish">À polir</option>
              <option value="planarity">Problème planéité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {form.etatFrettes === 'other' && (
            <div className="form-group">
              <label>Préciser</label>
              <input type="text" value={form.frettesAutre} onChange={e => setForm(f => ({ ...f, frettesAutre: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label>Éléments dévissés <span className="text-muted-foreground font-normal">(facultatif)</span></label>
            <input type="text" value={form.elementsDevisses} onChange={e => setForm(f => ({ ...f, elementsDevisses: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Pièces manquantes <span className="text-muted-foreground font-normal">(facultatif)</span></label>
            <input type="text" value={form.piecesManquantes} onChange={e => setForm(f => ({ ...f, piecesManquantes: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Sillet</label>
            <select value={form.sillet} onChange={e => setForm(f => ({ ...f, sillet: e.target.value as SaddleCondition }))}>
              <option value="ok">OK</option>
              <option value="change">À changer</option>
              <option value="adjust">À régler</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {form.sillet === 'other' && (
            <div className="form-group">
              <label>Préciser</label>
              <input type="text" value={form.silletAutre} onChange={e => setForm(f => ({ ...f, silletAutre: e.target.value }))} />
            </div>
          )}

          <div className="form-group">
            <label>Contrôles rapides</label>
            <textarea
              rows={4}
              value={form.controles}
              onChange={e => setForm(f => ({ ...f, controles: e.target.value }))}
              placeholder="Notes rapides sur l'état général..."
            />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
