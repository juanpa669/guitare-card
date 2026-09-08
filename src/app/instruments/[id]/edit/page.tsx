'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getInstrument, updateInstrument } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { InstrumentType, Radius } from '@/types';
import { GUITAR_BRANDS, STRING_COUNTS_GUITAR, STRING_COUNTS_BASS, STRING_COUNTS_UKULELE, MICRO_COUNTS, getAllBrands, addCustomBrand } from '@/lib/constants';

const DIAPASONS: { value: number; label: string; unit: string; range: string }[] = [
  { value: 596, label: 'Fender Jaguar/Jazzmaster', unit: 'mm', range: '23.46"' },
  { value: 609, label: 'Fender Duo-Sonic', unit: 'mm', range: '24.0"' },
  { value: 628, label: 'Court', unit: 'mm', range: '24.5–24.75"' },
  { value: 643, label: 'Moyen', unit: 'mm', range: '25–25.5"' },
  { value: 650, label: 'Long', unit: 'mm', range: '25.5"+' },
  { value: 635, label: 'PRS/National', unit: 'mm', range: '25.0"' },
  { value: 702, label: 'Baritone', unit: 'mm', range: '27.6"' },
];

const RADII: { value: Radius; label: string }[] = [
  { value: 'r7_5', label: '7.5"' },
  { value: 'r9_5', label: '9.5"' },
  { value: 'r10', label: '10"' },
  { value: 'r12', label: '12"' },
  { value: 'r14', label: '14"' },
  { value: 'r16', label: '16"' },
  { value: 'compound', label: 'Composé' },
];

export default function EditInstrumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
          diapason: { value: diapason.value, unit: 'mm', label: diapason.label },
          radius: form.radius,
          nombreCordes: form.nombreCordes,
          nombreMicros: form.nombreMicros,
        });
        router.push(`/instruments/${id}`);
      } catch (err) {
        console.error('Failed to update instrument:', err);
        alert('Erreur lors de la sauvegarde: ' + (err as Error).message);
      }
    });
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/instruments/${id}`} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Modifier l&apos;instrument</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="form-group">
            <label>Type d&apos;instrument</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as InstrumentType }))}
            >
              <option value="guitar">Guitare</option>
              <option value="bass">Basse</option>
              <option value="ukulele">Ukulélé</option>
            </select>
          </div>

          <div className="form-group">
            <label>Marque</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              required
            >
              <option value="">Sélectionner une marque</option>
              {getAllBrands().map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {isCustomBrand && (
            <div className="form-group">
              <label>Marque personnalisée</label>
              <input
                type="text"
                value={form.marqueCustom}
                onChange={e => setForm(f => ({ ...f, marqueCustom: e.target.value }))}
                placeholder="Nom de la marque..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Modèle</label>
            <input type="text" value={form.modele} onChange={e => setForm(f => ({ ...f, modele: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label>Surnom <span className="text-muted-foreground font-normal">(facultatif)</span></label>
            <input type="text" value={form.surnom} onChange={e => setForm(f => ({ ...f, surnom: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>Nombre de cordes</label>
            <select
              value={form.nombreCordes}
              onChange={e => setForm(f => ({ ...f, nombreCordes: Number(e.target.value) }))}
            >
              {(form.type === 'bass' ? STRING_COUNTS_BASS : form.type === 'ukulele' ? STRING_COUNTS_UKULELE : STRING_COUNTS_GUITAR).map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nombre de micros</label>
            <select
              value={form.nombreMicros}
              onChange={e => setForm(f => ({ ...f, nombreMicros: Number(e.target.value) }))}
            >
              {MICRO_COUNTS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Diapason</label>
            <select
              value={form.diapasonValue}
              onChange={e => setForm(f => ({ ...f, diapasonValue: Number(e.target.value) }))}
            >
              {DIAPASONS.map(d => (
                <option key={d.value} value={d.value}>{d.label} — {d.value} {d.unit} ({d.range})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Radius touche</label>
            <select value={form.radius} onChange={e => setForm(f => ({ ...f, radius: e.target.value as Radius }))}>
              {RADII.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
