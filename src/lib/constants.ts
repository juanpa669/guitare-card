export const GUITAR_BRANDS = [
  'Fender', 'Gibson', 'Epiphone', 'Music Man', 'Ernie Ball Music Man',
  'PRS', 'Yamaha', 'Ibanez', 'Cort', 'Aria', 'Aria Pro II',
  'ESP', 'ESP LTD', 'LTD', 'Jackson', 'Schecter', 'Gretsch',
  'Rickenbacker', 'G&L', 'Charvel', 'Squier', 'Guild', 'Washburn',
  'Reverend', 'Godin', 'Sterling by Music Man', 'Suhr', 'Kiesel',
  'Autres',
] as const;

export const PICKUP_BRANDS = [
  'Seymour Duncan', 'DiMarzio', 'EMG', 'Fishman', 'Lollar',
  'Bare Knuckle', 'Fralin', 'Lindy Fralin', 'Fender', 'Gibson',
  'Autres',
] as const;

export const STRING_LABELS_GUITAR = [
  'Mi grave', 'Si', 'Sol', 'Ré', 'La', 'Mi aigu',
  'Si (grave)', 'Mi (aigu)',
  'Si (aigu)', 'Mi (très aigu)',
  'Fa# (grave)', 'Si (très grave)',
] as const;

export const STRING_LABELS_GUITAR_12 = [
  'Mi grave', 'Si', 'Sol', 'Ré', 'La', 'Mi aigu',
  'Mi grave (oct)', 'Si (oct)', 'Sol (oct)', 'Ré (oct)', 'La (oct)', 'Mi aigu (oct)',
] as const;

export const STRING_LABELS_GUITAR_SHORT = [
  '6E', '5B', '4G', '3D', '2A', '1E',
  '7E', '1E',
  '2E', '1E',
  '8F#', '7B',
] as const;

export const STRING_LABELS_GUITAR_12_SHORT = [
  '6E', '5B', '4G', '3D', '2A', '1E',
  '6E-o', '5B-o', '4G-o', '3D-o', '2A-o', '1E-o',
] as const;

export const STRING_LABELS_BASS = [
  'Mi grave', 'La', 'Ré', 'Sol',
  'Si', 'Mi', 'La', 'Ré',
  'Sol', 'Do',
  'Mi', 'La',
] as const;

export const STRING_LABELS_BASS_SHORT = [
  '4E', '3A', '2D', '1G',
  '5B', '4E', '3A', '2D',
  '1G', '6C',
  '5B', '4E',
] as const;

export const STRING_LABELS_UKULELE = [
  'Sol', 'Do', 'Mi', 'La',
] as const;

export const STRING_LABELS_UKULELE_SHORT = [
  '4G', '3C', '2E', '1A',
] as const;

export type GuitarBrand = typeof GUITAR_BRANDS[number];
export type PickupBrand = typeof PICKUP_BRANDS[number];
export type StringLabel = typeof STRING_LABELS_GUITAR[number];

export interface PickupPreset {
  brand: string;
  position: string;
  bass: number;
  treble: number;
  method: string;
}

export const PICKUP_PRESETS: PickupPreset[] = [
  // Fender
  { brand: 'Fender', position: 'Neck', bass: 2.0, treble: 1.6, method: 'Last fret pressed' },
  { brand: 'Fender', position: 'Neck (Vintage)', bass: 2.4, treble: 2.0, method: 'Last fret pressed' },
  { brand: 'Fender', position: 'Neck (Texas Special)', bass: 3.6, treble: 2.4, method: 'Last fret pressed' },
  { brand: 'Fender', position: 'Neck (Noiseless)', bass: 3.6, treble: 2.4, method: 'Last fret pressed' },
  { brand: 'Fender', position: 'Bridge (Humbucker)', bass: 1.6, treble: 1.6, method: 'Last fret pressed' },
  // Music Man
  { brand: 'Music Man', position: 'Neck', bass: 6.5, treble: 4.75, method: 'Strings open' },
  { brand: 'Music Man', position: 'Middle', bass: 5.5, treble: 4.0, method: 'Strings open' },
  { brand: 'Music Man', position: 'Bridge', bass: 4.75, treble: 3.25, method: 'Strings open' },
  { brand: 'Music Man St. Vincent', position: 'Neck', bass: 4.75, treble: 0, method: 'Strings open' },
  { brand: 'Music Man St. Vincent', position: 'Middle', bass: 4.0, treble: 0, method: 'Strings open' },
  { brand: 'Music Man St. Vincent', position: 'Bridge', bass: 3.2, treble: 0, method: 'Strings open' },
  { brand: 'Music Man Axis Super Sport', position: 'Neck', bass: 4.8, treble: 0, method: 'Last fret pressed' },
  { brand: 'Music Man Axis Super Sport', position: 'Bridge', bass: 3.2, treble: 0, method: 'Last fret pressed' },
  // Yamaha
  { brand: 'Yamaha', position: 'Neck', bass: 2.0, treble: 1.5, method: 'Last fret pressed' },
  { brand: 'Yamaha', position: 'Bridge', bass: 2.5, treble: 1.5, method: 'Last fret pressed' },
  // DiMarzio
  { brand: 'DiMarzio', position: 'Bridge (Humbucker)', bass: 2.0, treble: 1.5, method: 'Last fret pressed' },
];

export function getPickupPresets(brand: string): PickupPreset[] {
  return PICKUP_PRESETS.filter(p => p.brand === brand);
}

import type { InstrumentType } from '@/types';

export const STRING_COUNTS_GUITAR = [
  { value: 6, label: '6 cordes (Standard)' },
  { value: 7, label: '7 cordes' },
  { value: 8, label: '8 cordes' },
  { value: 12, label: '12 cordes' },
];

export const STRING_COUNTS_BASS = [
  { value: 4, label: '4 cordes (Standard)' },
  { value: 5, label: '5 cordes' },
  { value: 6, label: '6 cordes' },
];

export const STRING_COUNTS_UKULELE = [
  { value: 4, label: '4 cordes' },
];

export const MICRO_COUNTS = [
  { value: 1, label: '1 micro' },
  { value: 2, label: '2 micros' },
  { value: 3, label: '3 micros' },
];

export function formatRadius(radius: string): string {
  const radiusMap: Record<string, string> = {
    'r7_5': '7.5"',
    'r9_5': '9.5"',
    'r10': '10"',
    'r12': '12"',
    'r14': '14"',
    'r16': '16"',
    'compound': 'Composé',
  };
  return radiusMap[radius] || radius;
}

export function getStringsForCount(count: number | null, type: InstrumentType = 'guitar'): { label: string; shortLabel: string }[] {
  if (!count) return [];

  if (type === 'bass') {
    if (count <= 4) {
      return STRING_LABELS_BASS.slice(0, count).map((label, i) => ({ label, shortLabel: STRING_LABELS_BASS_SHORT[i] }));
    }
    if (count <= 6) {
      return STRING_LABELS_BASS.slice(0, count).map((label, i) => ({ label, shortLabel: STRING_LABELS_BASS_SHORT[i] }));
    }
    return Array.from({ length: count }, (_, i) => ({
      label: `Corde ${count - i}`,
      shortLabel: `${count - i}E`,
    }));
  }

  if (type === 'ukulele') {
    if (count <= 4) {
      return STRING_LABELS_UKULELE.slice(0, count).map((label, i) => ({ label, shortLabel: STRING_LABELS_UKULELE_SHORT[i] }));
    }
    return Array.from({ length: count }, (_, i) => ({
      label: `Corde ${count - i}`,
      shortLabel: `${count - i}A`,
    }));
  }

  // Guitar
  if (count === 12) {
    return STRING_LABELS_GUITAR_12.map((label, i) => ({ label, shortLabel: STRING_LABELS_GUITAR_12_SHORT[i] }));
  }

  if (count <= 6) {
    return STRING_LABELS_GUITAR.slice(0, count).map((label, i) => ({ label, shortLabel: STRING_LABELS_GUITAR_SHORT[i] }));
  }
  if (count === 7) {
    return STRING_LABELS_GUITAR.slice(0, 7).map((label, i) => ({ label, shortLabel: STRING_LABELS_GUITAR_SHORT[i] }));
  }
  if (count === 8) {
    return STRING_LABELS_GUITAR.slice(0, 8).map((label, i) => ({ label, shortLabel: STRING_LABELS_GUITAR_SHORT[i] }));
  }
  return Array.from({ length: count }, (_, i) => ({
    label: `Corde ${count - i}`,
    shortLabel: `${count - i}E`,
  }));
}
