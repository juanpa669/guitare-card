export type InstrumentType = 'guitar' | 'bass' | 'ukulele';

export type FretCondition = 'ras' | 'polish' | 'planarity' | 'other';

export type SaddleCondition = 'ok' | 'change' | 'adjust' | 'other';

export type BridgeShape = 'radius' | 'adjust';

export type SoundResult = 'ok' | 'ko';

export type MicrophonePosition = 'neck' | 'middle' | 'bridge';

export interface Instrument {
  id: string;
  type: InstrumentType;
  marque: string;
  modele: string;
  surnom: string | null;
  diapason: Diapason;
  radius: Radius;
  nombreCordes: number | null;
  nombreMicros: number;
  dateCreation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Diapason {
  value: number;
  unit: 'mm';
  label: string;
}

export type Radius = 'r7_5' | 'r9_5' | 'r10' | 'r12' | 'r14' | 'r16' | 'compound';

export interface Observation {
  id: string;
  instrumentId: string;
  cordesGauge: string;
  controles: string;
  etatCordes: string;
  etatFrettes: FretCondition;
  frettesAutre: string | null;
  elementsDevisses: string | null;
  piecesManquantes: string | null;
  sillet: SaddleCondition;
  silletAutre: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeasureOriginal {
  id: string;
  instrumentId: string;
  actionBass12: number;
  actionTreble12: number;
  courbureManche10: number;
  formePontet: BridgeShape;
  dateMesure: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeasureMicro {
  id: string;
  mesureOriginaleId: string;
  position: MicrophonePosition;
  hauteurBass: number;
  hauteurTreble: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestAfterMeasure {
  id: string;
  mesureOriginaleId: string;
  frise: boolean;
  vibrations: boolean;
  son: SoundResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reglage {
  id: string;
  instrumentId: string;
  dateSaisie: string;
  courbureManche: number;
  action12fretteBass: number;
  action12fretteTreble: number;
  radiusChevalet: string;
  radiusChevaletAutre: string | null;
  intonation: string;
  microBrand: string | null;
  micros: ReglageMicro[];
  cordes: ReglageString[];
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReglageString {
  id: string;
  reglageId: string;
  stringNum: number;
  stringLabel: string;
  hauteur: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReglageMicro {
  id: string;
  reglageId: string;
  position: MicrophonePosition;
  hauteur: number;
  microBrand: string | null;
  createdAt: Date;
  updatedAt: Date;
}
