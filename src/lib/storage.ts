const STORAGE_KEY = 'guitar-card-data';

function loadAll(): Record<string, any[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, any[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save failed:', e);
    throw e;
  }
}

function genId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

function safeParseDiapason(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return val; }
}

export async function getInstruments(): Promise<any[]> {
  const data = loadAll();
  const items = data.instruments || [];
  return items
    .map(i => ({
      ...i,
      diapason: safeParseDiapason(i.diapason),
    }))
    .sort((a: any, b: any) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
}

export async function getInstrument(id: string): Promise<any | null> {
  const data = loadAll();
  const items = data.instruments || [];
  const item = items.find((i: any) => i.id === id);
  if (!item) return null;
  return {
    ...item,
    diapason: safeParseDiapason(item.diapason),
  };
}

export async function createInstrument(data: any): Promise<any> {
  const dataStore = loadAll();
  const id = genId();
  const record = {
    ...data,
    id,
    dateCreation: data.dateCreation || new Date().toISOString().split('T')[0],
    createdAt: now(),
    updatedAt: now(),
  };
  if (!dataStore.instruments) dataStore.instruments = [];
  dataStore.instruments.push(record);
  saveAll(dataStore);
  return record;
}

export async function updateInstrument(id: string, data: any): Promise<any> {
  const dataStore = loadAll();
  const items = dataStore.instruments || [];
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) throw new Error('Instrument not found');
  const updated = { ...items[idx], ...data, updatedAt: now() };
  dataStore.instruments[idx] = updated;
  saveAll(dataStore);
  return updated;
}

export async function deleteInstrument(id: string): Promise<void> {
  const dataStore = loadAll();
  dataStore.instruments = (dataStore.instruments || []).filter((i: any) => i.id !== id);
  if (dataStore.regolages) {
    dataStore.regolages = dataStore.regolages.filter((r: any) => r.instrumentId !== id);
  }
  if (dataStore.observations) {
    dataStore.observations = dataStore.observations.filter((o: any) => o.instrumentId !== id);
  }
  if (dataStore.measures) {
    dataStore.measures = dataStore.measures.filter((m: any) => m.instrumentId !== id);
  }
  saveAll(dataStore);
}

export async function getObservation(instrumentId: string): Promise<any | null> {
  const dataStore = loadAll();
  const items = (dataStore.observations || []).filter((o: any) => o.instrumentId === instrumentId);
  return items.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt))[0] || null;
}

export async function createOrUpdateObservation(data: any): Promise<any> {
  const dataStore = loadAll();
  if (!dataStore.observations) dataStore.observations = [];
  const items = dataStore.observations.filter((o: any) => o.instrumentId === data.instrumentId);
  if (items.length > 0) {
    const existing = items[0];
    const idx = dataStore.observations.indexOf(existing);
    const updated = { ...existing, ...data, updatedAt: now() };
    dataStore.observations[idx] = updated;
    saveAll(dataStore);
    return updated;
  }
  const id = genId();
  const record = { ...data, id, createdAt: now(), updatedAt: now() };
  dataStore.observations.push(record);
  saveAll(dataStore);
  return record;
}

export async function getMeasureOriginal(instrumentId: string): Promise<any | null> {
  const dataStore = loadAll();
  const items = (dataStore.measures || []).filter((m: any) => m.instrumentId === instrumentId);
  const measure = items.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!measure) return null;
  const micros = (dataStore.measureMicros || []).filter((m: any) => m.mesureOriginaleId === measure.id);
  const tests = (dataStore.tests || []).filter((t: any) => t.mesureOriginaleId === measure.id);
  return { ...measure, micros: micros.sort((a: any, b: any) => a.position.localeCompare(b.position)), test: tests[0] };
}

export async function createMeasureOriginal(data: any, micros: any[]): Promise<any> {
  const dataStore = loadAll();
  if (!dataStore.measures) dataStore.measures = [];
  if (!dataStore.measureMicros) dataStore.measureMicros = [];
  const id = genId();
  const record = { ...data, id, createdAt: now(), updatedAt: now() };
  dataStore.measures.push(record);
  for (const m of micros) {
    const mid = genId();
    dataStore.measureMicros.push({ ...m, id: mid, mesureOriginaleId: id, createdAt: now(), updatedAt: now() });
  }
  saveAll(dataStore);
  return record;
}

export async function createTestAfterMeasure(data: any): Promise<any> {
  const dataStore = loadAll();
  if (!dataStore.tests) dataStore.tests = [];
  const id = genId();
  const record = { ...data, id, createdAt: now(), updatedAt: now() };
  dataStore.tests.push(record);
  saveAll(dataStore);
  return record;
}

export async function getReglages(instrumentId: string): Promise<any[]> {
  const dataStore = loadAll();
  const items = (dataStore.regolages || []).filter((r: any) => r.instrumentId === instrumentId);
  return items.sort((a: any, b: any) => a.ordre - b.ordre);
}

export async function createReglage(data: any, micros: any[], cordes: any[]): Promise<any> {
  const dataStore = loadAll();
  if (!dataStore.regolages) dataStore.regolages = [];
  if (!dataStore.reglageMicros) dataStore.reglageMicros = [];
  if (!dataStore.reglageStrings) dataStore.reglageStrings = [];
  const count = dataStore.regolages.filter((r: any) => r.instrumentId === data.instrumentId).length;
  const id = genId();
  const record = { ...data, id, ordre: count + 1, createdAt: now(), updatedAt: now() };
  dataStore.regolages.push(record);
  for (const m of micros) {
    const mid = genId();
    dataStore.reglageMicros.push({ ...m, id: mid, reglageId: id, createdAt: now(), updatedAt: now() });
  }
  for (const c of cordes) {
    const cid = genId();
    dataStore.reglageStrings.push({ ...c, id: cid, reglageId: id, createdAt: now(), updatedAt: now() });
  }
  saveAll(dataStore);
  return record;
}

export async function clearAll(): Promise<void> {
  saveAll({});
}
