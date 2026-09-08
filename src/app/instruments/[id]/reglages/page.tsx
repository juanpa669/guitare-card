'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createReglage, getMeasureOriginal, getInstrument } from '@/lib/actions';
import { ArrowLeft, Plus, X, Info } from 'lucide-react';
import Link from 'next/link';
import type { MicrophonePosition } from '@/types';
import { PICKUP_BRANDS, getPickupPresets, getStringsForCount, PICKUP_PRESETS, type PickupPreset } from '@/lib/constants';
import type { InstrumentType } from '@/types';

const FIELD_TOOLTIPS: Record<string, string> = {
  actionSillet: 'Mesurer la hauteur des cordes au sillet (1ère frette) avec des cales. Viser 0.3-0.5mm pour E grave et 0.2-0.3mm pour E aigu.',
  courbureManche: 'Mesurer avec des cales la distance entre la frette et la corde à la dixième case. Viser 0.2 mm pour une action basse, 0.1 mm pour une action moyenne.',
  action12frette: 'Mesurer la hauteur des cordes à la 12ème frette. Viser 1.5mm grave / 1.0mm aigu pour une action standard.',
  radiusChevalet: 'Ajuster le rayon des pontets pour correspondre au rayon de la touche.',
  intonation: 'Vérifier l\'intonation case par case. La note à la 12ème frette doit être identique à l\'octave supérieure (corde à vide).',
};

export default function ReglagesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [numMics, setNumMics] = useState(2);
  const [instrument, setInstrument] = useState<any>(null);
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('guitar');
  const [form, setForm] = useState({
    courbureManche: '',
    action12frette: '',
    radiusChevalet: '',
    intonation: '',
    dateSaisie: new Date().toISOString().split('T')[0],
  });
  const [micros, setMicros] = useState<{ hauteur: string; microBrand: string; microBrandCustom: string }[]>([]);
  const [microBrand, setMicroBrand] = useState('');
  const [microBrandCustom, setMicroBrandCustom] = useState('');
  const [cordes, setCordes] = useState<{ hauteur: string; stringNum: number; stringLabel: string }[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [presets, setPresets] = useState<PickupPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isCustomBrand = microBrand === 'Autres';
  const finalBrand = isCustomBrand ? microBrandCustom : microBrand;

  useEffect(() => {
    getInstrument(id).then(inst => {
      if (inst) {
        setInstrument(inst);
        setInstrumentType(inst.type);
      }
    });
  }, [id]);

  useEffect(() => {
    if (finalBrand && !isCustomBrand) {
      const found = PICKUP_PRESETS.find(p => p.brand === finalBrand);
      if (found) {
        setPresets(getPickupPresets(finalBrand));
      } else {
        setPresets([]);
      }
    } else {
      setPresets([]);
    }
  }, [finalBrand, isCustomBrand]);

  useEffect(() => {
    if (instrument?.nombreCordes) {
      const strings = getStringsForCount(instrument.nombreCordes, instrument.type);
      setCordes(strings.map((s, i) => ({
        hauteur: '',
        stringNum: i + 1,
        stringLabel: s.label,
      })));
    } else {
      setCordes([
        { hauteur: '', stringNum: 1, stringLabel: 'Mi grave' },
        { hauteur: '', stringNum: 2, stringLabel: 'Si' },
        { hauteur: '', stringNum: 3, stringLabel: 'Sol' },
        { hauteur: '', stringNum: 4, stringLabel: 'Ré' },
        { hauteur: '', stringNum: 5, stringLabel: 'La' },
        { hauteur: '', stringNum: 6, stringLabel: 'Mi aigu' },
      ]);
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
    const newMicros = [...micros];
    newMicros[idx] = { ...newMicros[idx], [field]: value };
    setMicros(newMicros);
  };

  const updateCorde = (idx: number, value: string) => {
    const newCordes = [...cordes];
    newCordes[idx] = { ...newCordes[idx], hauteur: value };
    setCordes(newCordes);
  };

  const applyPreset = (preset: PickupPreset) => {
    const posIndex = positions.findIndex(p => {
      const presetPos = preset.position.toLowerCase();
      if (preset.position.includes('Neck') || presetPos.includes('neck')) return p === 'neck';
      if (preset.position.includes('Middle') || presetPos.includes('middle')) return p === 'middle';
      if (preset.position.includes('Bridge') || presetPos.includes('bridge')) return p === 'bridge';
      return false;
    });

    if (posIndex >= 0) {
      const newMicros = [...micros];
      newMicros[posIndex] = { ...newMicros[posIndex], hauteur: preset.bass.toString() };
      setMicros(newMicros);
      setSelectedPreset(preset.position);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courbureManche || !form.action12frette) return;

    const mandatoryCordes = cordes.filter(c =>
      c.stringLabel.includes('grave') || c.stringLabel.includes('aigu')
    );
    const hasEmptyMandatory = mandatoryCordes.some(c => !c.hauteur);
    if (hasEmptyMandatory) {
      setErrorMsg('E grave et E aigu sont obligatoires');
      return;
    }
    setErrorMsg('');

    startTransition(async () => {
      await createReglage({
        instrumentId: id,
        dateSaisie: form.dateSaisie,
        courbureManche: parseFloat(form.courbureManche),
        action12frette: parseFloat(form.action12frette),
        radiusChevalet: parseFloat(form.radiusChevalet) || 0,
        intonation: form.intonation,
        microBrand: finalBrand || null,
        ordre: 0,
      }, positions.map((pos, i) => {
        const micro = micros[i];
        let microBrandVal: string | null = null;
        if (numMics === 1 && microBrand) {
          microBrandVal = microBrand === 'Autres' ? microBrandCustom || null : microBrand;
        } else if (micro?.microBrand) {
          microBrandVal = micro.microBrand === 'Autres' ? micro.microBrandCustom || null : micro.microBrand;
        }
        return {
          position: pos,
          hauteur: parseFloat(micro?.hauteur || '0'),
          microBrand: microBrandVal,
        };
      }), cordes.map(c => ({
        stringNum: c.stringNum,
        stringLabel: c.stringLabel,
        hauteur: parseFloat(c.hauteur || '0'),
      })));
      router.push(`/instruments/${id}`);
    });
  };

  const selectedStringCount = instrument?.nombreCordes || cordes.length;

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
            <div className="flex items-center gap-2">
              <label>Action au sillet par corde</label>
              <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label="Info">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text">
                  {FIELD_TOOLTIPS.actionSillet}
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">E grave et E aigu obligatoires</p>
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
              <label>Courbure du manche (mm)</label>
              <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label="Info">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text">
                  {FIELD_TOOLTIPS.courbureManche}
                </span>
              </span>
            </div>
            <input type="number" step="0.01" value={form.courbureManche} onChange={e => setForm(f => ({ ...f, courbureManche: e.target.value }))} />
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>Action 12ème frette (mm)</label>
              <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label="Info">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text">
                  {FIELD_TOOLTIPS.action12frette}
                </span>
              </span>
            </div>
            <input type="number" step="0.1" value={form.action12frette} onChange={e => setForm(f => ({ ...f, action12frette: e.target.value }))} />
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>Radius cordes au chevalet (pouces)</label>
              <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label="Info">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text">
                  {FIELD_TOOLTIPS.radiusChevalet}
                </span>
              </span>
            </div>
            <input type="number" step="0.1" value={form.radiusChevalet} onChange={e => setForm(f => ({ ...f, radiusChevalet: e.target.value }))} />
          </div>

          <div className="form-group">
            <div className="flex items-center gap-2">
              <label>Intonation</label>
              <span className="tooltip-trigger group relative" tabIndex={0} role="button" aria-label="Info">
                <Info size={14} className="text-muted-foreground" />
                <span className="tooltip-text">
                  {FIELD_TOOLTIPS.intonation}
                </span>
              </span>
            </div>
            <input type="text" value={form.intonation} onChange={e => setForm(f => ({ ...f, intonation: e.target.value }))} placeholder="Notes ou remarques..." />
          </div>

          <div className="form-group">
            <label>Marque du micro</label>
            <select
              value={microBrand}
              onChange={e => {
                setMicroBrand(e.target.value);
                setMicroBrandCustom('');
                setSelectedPreset(null);
              }}
            >
              <option value="">Sélectionner une marque</option>
              {PICKUP_BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {isCustomBrand && (
            <div className="form-group">
              <label>Marque personnalisée</label>
              <input
                type="text"
                value={microBrandCustom}
                onChange={e => setMicroBrandCustom(e.target.value)}
                placeholder="Nom du fabricant..."
              />
            </div>
          )}

          {presets.length > 0 && (
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Préréglages {finalBrand}</p>
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="text-sm text-primary hover:underline"
                >
                  {showPresets ? 'Masquer' : 'Afficher'}
                </button>
              </div>

              {showPresets && presets.map((preset, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{preset.position}</span>
                    <button
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-xs text-primary hover:underline"
                    >
                      Appliquer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Grave: {preset.bass} mm</span>
                    <span>Aigu: {preset.treble > 0 ? `${preset.treble} mm` : '-'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{preset.method}</p>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Nombre de micros</label>
            <select
              value={numMics}
              onChange={e => {
                setNumMics(Number(e.target.value));
                setMicros(Array(Number(e.target.value)).fill({ hauteur: '', microBrand: '', microBrandCustom: '' }));
                setSelectedPreset(null);
              }}
            >
              <option value="1">1 micro</option>
              <option value="2">2 micros</option>
              <option value="3">3 micros</option>
            </select>
          </div>

          {positions.map((pos, i) => {
            const posLabel = pos === 'neck' ? 'Neck' : pos === 'middle' ? 'Middle' : 'Bridge';
            const posIndex = positions.indexOf(pos);
            const micro = micros[posIndex] || { hauteur: '', microBrand: '', microBrandCustom: '' };
            const isCustomMicroBrand = micro.microBrand === 'Autres';
            const showPerPositionBrand = numMics > 1 || !microBrand;
            const effectiveMicroBrand = showPerPositionBrand ? micro.microBrand : microBrand;
            const effectiveMicroBrandCustom = showPerPositionBrand ? micro.microBrandCustom : microBrandCustom;
            const isCustomEffective = effectiveMicroBrand === 'Autres';
            return (
              <div key={pos} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{posLabel}</p>
                  {selectedPreset && selectedPreset.toLowerCase().includes(pos) && (
                    <span className="text-xs text-primary">✓ Préréglé</span>
                  )}
                </div>
                {showPerPositionBrand && (
                  <div className="form-group">
                    <label>Marque du micro</label>
                    <select
                      value={micro.microBrand}
                      onChange={e => {
                        updateMicro(posIndex, 'microBrand', e.target.value);
                        if (e.target.value !== 'Autres') {
                          updateMicro(posIndex, 'microBrandCustom', '');
                        }
                      }}
                    >
                      <option value="">Sélectionner</option>
                      {PICKUP_BRANDS.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}
                {isCustomEffective && (
                  <div className="form-group">
                    <label>Marque personnalisée</label>
                    <input
                      type="text"
                      value={effectiveMicroBrandCustom}
                      onChange={e => {
                        if (showPerPositionBrand) {
                          updateMicro(posIndex, 'microBrandCustom', e.target.value);
                        } else {
                          setMicroBrandCustom(e.target.value);
                        }
                      }}
                      placeholder="Nom du fabricant..."
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Hauteur (mm)</label>
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
          {isPending ? 'Enregistrement...' : 'Enregistrer le réglage'}
        </button>
      </form>
    </div>
  );
}
