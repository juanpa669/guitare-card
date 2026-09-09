const MONTHS_SHORT = [
  'Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
];

function parseDateParts(value: string | null | undefined): { y: string; m: string; d: string } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return { y: match[1], m: match[2], d: match[3] };
}

export function formatFrenchDate(value: string | null | undefined): string | null {
  const parts = parseDateParts(value);
  if (!parts) return null;
  const monthIndex = Number(parts.m) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return `${parts.d} ${MONTHS_SHORT[monthIndex]} ${parts.y}`;
}

export function formatTime(value: string | null | undefined): string | null {
  if (!value || !value.includes('T')) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
