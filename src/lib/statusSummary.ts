import type { MicrophonePosition } from '@/types';

export type StatusMicro = {
  position: MicrophonePosition;
  label: string;
  value: string;
};

export type StatusSummary = {
  basis: 'reglage' | 'initial';
  action: string;
  courbure: string;
  micros: StatusMicro[];
  recordedAt: string | null;
};

const POSITION_LABEL: Record<MicrophonePosition, string> = {
  neck: 'Neck',
  middle: 'Middle',
  bridge: 'Bridge',
};

const POSITION_ORDER: MicrophonePosition[] = ['neck', 'middle', 'bridge'];

export function formatNumber(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}

export function formatActionPair(bass: number | null | undefined, treble: number | null | undefined): string {
  const b = formatNumber(bass);
  const t = formatNumber(treble);
  if (!b && !t) return '—';
  return `${b ?? '—'} / ${t ?? '—'}`;
}

function orderedMicros<T extends { position: string }>(items: T[] | null | undefined): T[] {
  if (!Array.isArray(items)) return [];
  return [...items].sort(
    (a, b) => POSITION_ORDER.indexOf(a.position as MicrophonePosition) - POSITION_ORDER.indexOf(b.position as MicrophonePosition),
  );
}

function buildPairMicros(micros: { position: string; hauteurBass?: number | null; hauteurTreble?: number | null }[] | null | undefined): StatusMicro[] {
  const result: StatusMicro[] = [];
  for (const m of orderedMicros(micros)) {
    const bass = formatNumber(m.hauteurBass);
    const treble = formatNumber(m.hauteurTreble);
    if (!bass && !treble) continue;
    result.push({
      position: m.position as MicrophonePosition,
      label: POSITION_LABEL[m.position as MicrophonePosition] ?? m.position,
      value: `${bass ?? '—'} / ${treble ?? '—'}`,
    });
  }
  return result;
}

type ReglageLike = {
  action12fretteBass?: number | null;
  action12fretteTreble?: number | null;
  courbureManche?: number | null;
  createdAt?: string | null;
  micros?: { position: string; hauteurBass?: number | null; hauteurTreble?: number | null }[];
};

type MeasureLike = {
  actionBass12?: number | null;
  actionTreble12?: number | null;
  courbureManche10?: number | null;
  createdAt?: string | null;
  micros?: { position: string; hauteurBass?: number | null; hauteurTreble?: number | null }[];
};

export function buildStatusSummary(reglages: ReglageLike[] | null | undefined, measure: MeasureLike | null | undefined): StatusSummary | null {
  const lastReglage = Array.isArray(reglages) && reglages.length > 0 ? reglages[reglages.length - 1] : null;

  if (lastReglage) {
    return {
      basis: 'reglage',
      action: formatActionPair(lastReglage.action12fretteBass, lastReglage.action12fretteTreble),
      courbure: formatNumber(lastReglage.courbureManche) ?? '—',
      micros: buildPairMicros(lastReglage.micros),
      recordedAt: lastReglage.createdAt ?? null,
    };
  }

  if (measure) {
    return {
      basis: 'initial',
      action: formatActionPair(measure.actionBass12, measure.actionTreble12),
      courbure: formatNumber(measure.courbureManche10) ?? '—',
      micros: buildPairMicros(measure.micros),
      recordedAt: measure.createdAt ?? null,
    };
  }

  return null;
}
