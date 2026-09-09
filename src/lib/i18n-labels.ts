export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function instrumentTypeLabel(t: TranslateFn, type: string): string {
  return t(type === 'guitar' ? 'type.guitar' : type === 'bass' ? 'type.bass' : 'type.ukulele');
}

export function pickupPositionLabel(t: TranslateFn, position: string): string {
  return t(position === 'neck' ? 'pos.neck' : position === 'middle' ? 'pos.middle' : 'pos.bridge');
}

export function radiusDisplayLabel(t: TranslateFn, value: string): string {
  if (value === 'compound') return t('radius.compound');
  return formatRadiusSafe(value);
}

export function radiusChevaletLabel(
  t: TranslateFn,
  state: string | null | undefined,
  autre: string | null | undefined,
): string {
  if (state === 'ok') return t('rc.ok');
  if (state === 'ko') return t('rc.ko');
  if (state === 'paufiner') return t('rc.paufiner');
  if (state === 'autre') return autre || t('rc.autre');
  if (!state) return '—';
  if (/^\d+(\.\d+)?$/.test(state)) return `${state}"`;
  return state;
}

function formatRadiusSafe(value: string): string {
  const map: Record<string, string> = {
    r7_5: '7.5"',
    r9_5: '9.5"',
    r10: '10"',
    r12: '12"',
    r14: '14"',
    r16: '16"',
  };
  return map[value] ?? value;
}
