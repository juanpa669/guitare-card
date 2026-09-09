const enc = (id: string): string => encodeURIComponent(id);

export function instrumentDetailHref(id: string): string {
  return `/instrument?id=${enc(id)}`;
}

export function instrumentEditHref(id: string): string {
  return `/instrument/edit?id=${enc(id)}`;
}

export function instrumentMeasuresHref(id: string): string {
  return `/instrument/measures?id=${enc(id)}`;
}

export function instrumentObservationsHref(id: string): string {
  return `/instrument/observations?id=${enc(id)}`;
}

export function instrumentReglagesHref(id: string): string {
  return `/instrument/reglages?id=${enc(id)}`;
}
