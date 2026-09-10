const STATIC_GUITAR_BRANDS = [
  'Fender', 'Gibson', 'Epiphone', 'Music Man', 'Ernie Ball Music Man',
  'PRS', 'Yamaha', 'Ibanez', 'Cort', 'Aria', 'Aria Pro II',
  'ESP', 'ESP LTD', 'LTD', 'Jackson', 'Schecter', 'Gretsch',
  'Rickenbacker', 'G&L', 'Charvel', 'Squier', 'Guild', 'Washburn',
  'Reverend', 'Godin', 'Sterling by Music Man', 'Suhr', 'Kiesel',
  'Autres',
] as const;

const STATIC_PICKUP_BRANDS = [
  'Seymour Duncan', 'DiMarzio', 'EMG', 'Fishman', 'Lollar',
  'Bare Knuckle', 'Fralin', 'Lindy Fralin', 'Fender', 'Gibson',
  'Autres',
] as const;

export const GUITAR_BRANDS = [...STATIC_GUITAR_BRANDS] as const;
export const PICKUP_BRANDS = [...STATIC_PICKUP_BRANDS] as const;

const CUSTOM_BRANDS_KEY = 'guitarCard_customBrands';

export function getCustomBrands(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_BRANDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addCustomBrand(name: string): void {
  if (typeof window === 'undefined' || !name.trim()) return;
  const existing = getCustomBrands();
  if (!existing.includes(name.trim())) {
    localStorage.setItem(CUSTOM_BRANDS_KEY, JSON.stringify([...existing, name.trim()]));
  }
}

export function getAllBrands(): string[] {
  return sortBrandsWithAutresLast([...STATIC_GUITAR_BRANDS, ...getCustomBrands()]);
}

export function getAllPickupBrands(): string[] {
  return sortBrandsWithAutresLast([...STATIC_PICKUP_BRANDS, ...getCustomBrands()]);
}

const AUTRES_BRAND = 'Autres';

function sortBrandsWithAutresLast(brands: string[]): string[] {
  const sorted = Array.from(new Set(brands))
    .filter(brand => brand !== AUTRES_BRAND)
    .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  return [...sorted, AUTRES_BRAND];
}

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

import type { InstrumentType } from '@/types';

export const STRING_COUNTS_GUITAR = [
  { value: 6, labelKey: 'strCount.g6' },
  { value: 7, labelKey: 'strCount.g7' },
  { value: 8, labelKey: 'strCount.g8' },
  { value: 12, labelKey: 'strCount.g12' },
];

export const STRING_COUNTS_BASS = [
  { value: 4, labelKey: 'strCount.b4' },
  { value: 5, labelKey: 'strCount.b5' },
  { value: 6, labelKey: 'strCount.b6' },
];

export const STRING_COUNTS_UKULELE = [
  { value: 4, labelKey: 'strCount.u4' },
];

export const MICRO_COUNTS = [
  { value: 0, labelKey: 'micCount.zero' },
  { value: 1, labelKey: 'micCount.one' },
  { value: 2, labelKey: 'micCount.two' },
  { value: 3, labelKey: 'micCount.three' },
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
