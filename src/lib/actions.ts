'use server';

import { prisma } from './prisma';
import type {
  Instrument,
  Observation,
  MeasureOriginal,
  MeasureMicro,
  TestAfterMeasure,
  Reglage,
  ReglageMicro,
  ReglageString,
  InstrumentType,
  FretCondition,
  SaddleCondition,
  BridgeShape,
  SoundResult,
  MicrophonePosition,
  Radius,
} from '@/types';

function toInstrument(i: any): Instrument {
  return {
    id: i.id,
    type: i.type as InstrumentType,
    marque: i.marque,
    modele: i.modele,
    surnom: i.surnom,
    diapason: JSON.parse(i.diapason),
    radius: i.radius as Radius,
    nombreCordes: i.nombreCordes,
    nombreMicros: i.nombreMicros,
    dateCreation: i.dateCreation,
    createdAt: i.createdAt instanceof Date ? i.createdAt : new Date(i.createdAt),
    updatedAt: i.updatedAt instanceof Date ? i.updatedAt : new Date(i.updatedAt),
  };
}

function toObservation(o: any): Observation {
  return {
    id: o.id,
    instrumentId: o.instrumentId,
    cordesGauge: o.cordesGauge,
    controles: o.controles,
    etatCordes: o.etatCordes,
    etatFrettes: o.etatFrettes as FretCondition,
    frettesAutre: o.frettesAutre,
    elementsDevisses: o.elementsDevisses,
    piecesManquantes: o.piecesManquantes,
    sillet: o.sillet as SaddleCondition,
    silletAutre: o.silletAutre,
    createdAt: o.createdAt instanceof Date ? o.createdAt : new Date(o.createdAt),
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt : new Date(o.updatedAt),
  };
}

function toMeasureOriginal(m: any): MeasureOriginal {
  return {
    id: m.id,
    instrumentId: m.instrumentId,
    actionBass12: m.actionBass12,
    actionTreble12: m.actionTreble12,
    courbureManche10: m.courbureManche10,
    formePontet: m.formePontet as BridgeShape,
    dateMesure: m.dateMesure,
    createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt),
  };
}

function toMeasureMicro(m: any): MeasureMicro {
  return {
    id: m.id,
    mesureOriginaleId: m.mesureOriginaleId,
    position: m.position as MicrophonePosition,
    hauteurBass: m.hauteurBass,
    hauteurTreble: m.hauteurTreble,
    createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt),
  };
}

function toTestAfterMeasure(t: any): TestAfterMeasure {
  return {
    id: t.id,
    mesureOriginaleId: t.mesureOriginaleId,
    frise: t.frise,
    vibrations: t.vibrations,
    son: t.son as SoundResult,
    createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt),
  };
}

function toReglage(r: any): Reglage {
  return {
    id: r.id,
    instrumentId: r.instrumentId,
    dateSaisie: r.dateSaisie,
    courbureManche: r.courbureManche,
    action12fretteBass: r.action12fretteBass ?? r.action12frette ?? 0,
    action12fretteTreble: r.action12fretteTreble ?? r.action12frette ?? 0,
    radiusChevalet: String(r.radiusChevalet ?? 'ok'),
    radiusChevaletAutre: r.radiusChevaletAutre ?? null,
    intonation: r.intonation,
    microBrand: r.microBrand,
    ordre: r.ordre,
    cordes: (r.cordes || []).map((c: any) => ({
      id: c.id,
      reglageId: c.reglageId,
      stringNum: c.stringNum,
      stringLabel: c.stringLabel,
      hauteur: c.hauteur,
      createdAt: c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt),
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt : new Date(c.updatedAt),
    })),
    micros: (r.micros || []).map((m: any) => ({
      id: m.id,
      reglageId: m.reglageId,
      position: m.position as MicrophonePosition,
      hauteur: m.hauteur,
      microBrand: m.microBrand,
      createdAt: m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
      updatedAt: m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt),
    })),
    createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt),
  };
}

export async function getInstruments(): Promise<Instrument[]> {
  const instruments = await prisma.instrument.findMany({
    orderBy: { dateCreation: 'desc' },
    include: { observations: { take: 1 } },
  });
  return instruments.map(toInstrument);
}

export async function getInstrument(id: string): Promise<Instrument | null> {
  const instrument = await prisma.instrument.findUnique({
    where: { id },
  });
  return instrument ? toInstrument(instrument) : null;
}

export async function createInstrument(data: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>): Promise<Instrument> {
  const instrument = await prisma.instrument.create({
    data: {
      ...data,
      diapason: JSON.stringify(data.diapason),
    },
  });
  return toInstrument(instrument);
}

export async function updateInstrument(id: string, data: Partial<Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Instrument> {
  const updateData: any = { ...data };
  if (data.diapason) {
    updateData.diapason = JSON.stringify(data.diapason);
  }
  const instrument = await prisma.instrument.update({
    where: { id },
    data: updateData,
  });
  return toInstrument(instrument);
}

export async function deleteInstrument(id: string): Promise<void> {
  await prisma.instrument.delete({ where: { id } });
}

export async function getObservation(instrumentId: string): Promise<Observation | null> {
  const obs = await prisma.observation.findFirst({
    where: { instrumentId },
    orderBy: { createdAt: 'desc' },
  });
  return obs ? toObservation(obs) : null;
}

export async function createOrUpdateObservation(data: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Observation> {
  const existing = await prisma.observation.findFirst({ where: { instrumentId: data.instrumentId } });
  if (existing) {
    const obs = await prisma.observation.update({
      where: { id: existing.id },
      data,
    });
    return toObservation(obs);
  }
  const obs = await prisma.observation.create({ data });
  return toObservation(obs);
}

export async function getMeasureOriginal(instrumentId: string): Promise<(MeasureOriginal & { micros: MeasureMicro[]; test?: TestAfterMeasure }) | null> {
  const measure = await prisma.measureOriginal.findFirst({
    where: { instrumentId },
    include: { micros: { orderBy: { position: 'asc' } }, test: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!measure) return null;
  return {
    ...toMeasureOriginal(measure),
    micros: measure.micros.map(toMeasureMicro),
    test: measure.test ? toTestAfterMeasure(measure.test) : undefined,
  };
}

export async function createMeasureOriginal(data: Omit<MeasureOriginal, 'id' | 'createdAt' | 'updatedAt'>, micros: Omit<MeasureMicro, 'id' | 'mesureOriginaleId' | 'createdAt' | 'updatedAt'>[]): Promise<MeasureOriginal> {
  const measure = await prisma.measureOriginal.create({
    data: {
      ...data,
      micros: { create: micros },
    },
  });
  return toMeasureOriginal(measure);
}

export async function createTestAfterMeasure(data: Omit<TestAfterMeasure, 'id' | 'createdAt' | 'updatedAt'>): Promise<TestAfterMeasure> {
  const test = await prisma.testAfterMeasure.create({ data });
  return toTestAfterMeasure(test);
}

export async function getReglages(instrumentId: string): Promise<Reglage[]> {
  const regolages = await prisma.reglage.findMany({
    where: { instrumentId },
    orderBy: { ordre: 'asc' },
    include: { cordes: true, micros: true },
  });
  return regolages.map(toReglage);
}

export async function createReglage(data: Omit<Reglage, 'id' | 'createdAt' | 'updatedAt' | 'cordes' | 'micros'>, micros: Omit<ReglageMicro, 'id' | 'reglageId' | 'createdAt' | 'updatedAt'>[], cordes: Omit<ReglageString, 'id' | 'reglageId' | 'createdAt' | 'updatedAt'>[]): Promise<Reglage> {
  const nextOrdre = await prisma.reglage.count({ where: { instrumentId: data.instrumentId } });
  const reglage = await prisma.reglage.create({
    data: {
      ...data,
      ordre: nextOrdre + 1,
      micros: { create: micros },
      cordes: { create: cordes },
    },
    include: { cordes: true },
  });
  return toReglage(reglage);
}
