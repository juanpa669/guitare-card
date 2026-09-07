'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getInstrument, getObservation, getMeasureOriginal, getReglages, deleteInstrument } from '@/lib/actions';
import Link from 'next/link';
import type { Instrument, Observation, MeasureOriginal, Reglage } from '@/types';
import { ArrowLeft, Pencil, Trash2, Music, ClipboardList, Ruler, Settings, History } from 'lucide-react';

type Tab = 'identification' | 'observations' | 'measures' | 'reglages';

export default function InstrumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [observation, setObservation] = useState<Observation | null>(null);
  const [measure, setMeasure] = useState<(import('@/types').MeasureOriginal & { micros: import('@/types').MeasureMicro[]; test?: import('@/types').TestAfterMeasure }) | null>(null);
  const [reglages, setReglages] = useState<Reglage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('identification');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      getInstrument(id),
      getObservation(id),
      getMeasureOriginal(id),
      getReglages(id),
    ]).then(([inst, obs, meas, reg]) => {
      setInstrument(inst);
      setObservation(obs);
      setMeasure(meas || null);
      setReglages(reg || []);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = () => {
    if (confirm('Supprimer cet instrument et toutes ses données ?')) {
      startTransition(async () => {
        await deleteInstrument(id);
        router.push('/instruments');
      });
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!instrument) return <div className="text-center py-12">Instrument non trouvé</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'identification', label: 'Identification', icon: <Pencil size={16} /> },
    { key: 'observations', label: 'Observations', icon: <ClipboardList size={16} /> },
    { key: 'measures', label: 'Mesures', icon: <Ruler size={16} /> },
    { key: 'reglages', label: 'Réglages', icon: <Settings size={16} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/instruments" className="p-2 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{instrument.marque} {instrument.modele}</h1>
            {instrument.surnom && <p className="text-sm text-muted-foreground">{instrument.surnom}</p>}
          </div>
        </div>
        <button onClick={handleDelete} className="btn-destructive p-2">
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
        <Link href={`/instruments/${id}/edit`} className="card block">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{instrument.type === 'guitar' ? 'Guitare' : instrument.type === 'bass' ? 'Basse' : 'Ukulélé'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diapason</span>
              <span>{instrument.diapason.value} {instrument.diapason.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Radius</span>
              <span>{instrument.radius}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date création</span>
              <span>{instrument.dateCreation}</span>
            </div>
          </div>
          <p className="text-sm text-primary mt-4 text-center">Modifier →</p>
        </Link>
      )}

      {activeTab === 'observations' && (
        observation ? (
          <div className="card space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cordes</span>
              <span>{observation.cordesGauge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">État cordes</span>
              <span>{observation.etatCordes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">État frettes</span>
              <span>{observation.etatFrettes === 'ras' ? 'RAS' : observation.etatFrettes === 'polish' ? 'À polir' : observation.etatFrettes === 'planarity' ? 'Problème planéité' : observation.frettesAutre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sillet</span>
              <span>{observation.sillet === 'ok' ? 'OK' : observation.sillet === 'change' ? 'À changer' : observation.sillet === 'adjust' ? 'À régler' : observation.silletAutre}</span>
            </div>
            {observation.controles && (
              <div>
                <span className="text-muted-foreground">Contrôles</span>
                <p className="mt-1">{observation.controles}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Aucune observation</p>
            <Link href={`/instruments/${id}/observations`} className="btn-primary">Ajouter</Link>
          </div>
        )
      )}

      {activeTab === 'measures' && (
        measure ? (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-medium mb-3">Premières mesures</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Action (grave 12ème)</span><span>{measure.actionBass12} mm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Action (aigu 12ème)</span><span>{measure.actionTreble12} mm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Courbure manche (10ème)</span><span>{measure.courbureManche10} mm</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Forme pontet</span><span>{measure.formePontet === 'radius' ? 'Au radius' : 'À régler'}</span></div>
              </div>
            </div>
            {measure.micros.length > 0 && (
              <div className="card">
                <h3 className="font-medium mb-3">Hauteur micros</h3>
                {measure.micros.map(m => (
                  <div key={m.id} className="mb-2 last:mb-0">
                    <p className="text-sm font-medium">{m.position === 'neck' ? 'Neck' : m.position === 'middle' ? 'Middle' : 'Bridge'}</p>
                    <p className="text-sm text-muted-foreground">Grave: {m.hauteurBass} mm | Aigu: {m.hauteurTreble} mm</p>
                  </div>
                ))}
              </div>
            )}
            {measure.test && (
              <div className="card">
                <h3 className="font-medium mb-3">Tests</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Frise</span><span>{measure.test.frise ? 'Oui' : 'Non'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vibrations</span><span>{measure.test.vibrations ? 'Oui' : 'Non'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Son</span><span>{measure.test.son === 'ok' ? 'OK' : 'KO'}</span></div>
                </div>
              </div>
            )}
            <Link href={`/instruments/${id}/measures`} className="btn-primary w-full block text-center">
              Ajouter des mesures
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Aucune mesure</p>
            <Link href={`/instruments/${id}/measures`} className="btn-primary">Premières mesures</Link>
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
                  <span className="font-medium">Réglage {i + 1}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{reg.dateSaisie}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Action sillet:</span> {reg.actionSillet} mm</div>
                  <div><span className="text-muted-foreground">Courbure:</span> {reg.courbureManche} mm</div>
                  <div><span className="text-muted-foreground">Action 12ème:</span> {reg.action12frette} mm</div>
                  <div><span className="text-muted-foreground">Radius chevalet:</span> {reg.radiusChevalet}"</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun réglage</p>
            </div>
          )}
          <Link href={`/instruments/${id}/reglages`} className="btn-primary w-full block text-center">
            Nouveau réglage
          </Link>
        </div>
      )}
    </div>
  );
}
