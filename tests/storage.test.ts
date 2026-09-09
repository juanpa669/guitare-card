import { describe, it, expect, beforeEach } from 'vitest'
import {
  getInstruments,
  getInstrument,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getObservation,
  createOrUpdateObservation,
  getMeasureOriginal,
  createMeasureOriginal,
  createTestAfterMeasure,
  getReglages,
  createReglage,
  clearAll,
} from '@/lib/storage'

describe('getInstruments', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should return empty array when no instruments', async () => {
    const result = await getInstruments()
    expect(result).toEqual([])
  })

  it('should return instruments sorted by creation date descending', async () => {
    await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    await createInstrument({ type: 'guitar', marque: 'Gibson', modele: 'Les Paul', surnom: null, diapason: { value: 628, unit: 'mm', label: '628mm' }, radius: 'r12', nombreCordes: 6, nombreMicros: 2, dateCreation: '2024-06-01' })

    const result = await getInstruments()
    expect(result).toHaveLength(2)
    expect(result[0].marque).toBe('Gibson')
    expect(result[1].marque).toBe('Fender')
  })
})

describe('getInstrument', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should return null for non-existent instrument', async () => {
    const result = await getInstrument('non-existent')
    expect(result).toBeNull()
  })

  it('should return instrument by id', async () => {
    const instrument = await createInstrument({ type: 'bass', marque: 'Music Man', modele: 'StingRay', surnom: null, diapason: { value: 864, unit: 'mm', label: '864mm' }, radius: 'r10', nombreCordes: 4, nombreMicros: 1, dateCreation: '2024-01-01' })
    const result = await getInstrument(instrument.id)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(instrument.id)
    expect(result!.marque).toBe('Music Man')
    expect(result!.type).toBe('bass')
  })
})

describe('createInstrument', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should create an instrument with generated id', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    expect(instrument.id).toBeDefined()
    expect(instrument.createdAt).toBeDefined()
    expect(instrument.updatedAt).toBeDefined()
    expect(instrument.dateCreation).toBe('2024-01-01')
  })

  it('should generate default dateCreation', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Gibson', modele: 'SG', surnom: null, diapason: { value: 628, unit: 'mm', label: '628mm' }, radius: 'r12', nombreCordes: 6, nombreMicros: 2 })
    expect(instrument.dateCreation).toBeDefined()
  })
})

describe('updateInstrument', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should update an existing instrument', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const updated = await updateInstrument(instrument.id, { modele: 'Stratocaster Custom' })
    expect(updated.modele).toBe('Stratocaster Custom')
    expect(updated.updatedAt).toBeDefined()
  })

  it('should throw error for non-existent instrument', async () => {
    await expect(updateInstrument('non-existent', { modele: 'Test' })).rejects.toThrow('Instrument not found')
  })
})

describe('deleteInstrument', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should delete an instrument', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    await deleteInstrument(instrument.id)
    const result = await getInstruments()
    expect(result).toHaveLength(0)
  })

  it('should cascade delete related data', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })

    await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '10-46', controles: 'ok', etatCordes: 'ok', etatFrettes: 'ras', sillet: 'ok' })
    await createReglage({ instrumentId: instrument.id, dateSaisie: '2024-01-01', courbureManche: 0.5, action12frette: 2, radiusChevalet: 12, intonation: 'ok' }, [], [])

    await deleteInstrument(instrument.id)

    expect((await getInstruments()).length).toBe(0)
    expect((await getObservation(instrument.id))).toBeNull()
    expect((await getReglages(instrument.id)).length).toBe(0)
  })
})

describe('getObservation', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should return null when no observation exists', async () => {
    const result = await getObservation('non-existent')
    expect(result).toBeNull()
  })

  it('should return the latest observation', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })

    await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '9-42', controles: 'ok', etatCordes: 'change', etatFrettes: 'polish', sillet: 'ok' })
    await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '10-46', controles: 'ok', etatCordes: 'ok', etatFrettes: 'ras', sillet: 'change' })

    const result = await getObservation(instrument.id)
    expect(result).not.toBeNull()
    expect(result!.cordesGauge).toBe('10-46')
  })
})

describe('createOrUpdateObservation', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should create a new observation', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const observation = await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '10-46', controles: 'ok', etatCordes: 'ok', etatFrettes: 'ras', sillet: 'ok' })
    expect(observation.id).toBeDefined()
    expect(observation.instrumentId).toBe(instrument.id)
  })

  it('should update existing observation', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })

    await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '9-42', controles: 'ok', etatCordes: 'ok', etatFrettes: 'ras', sillet: 'ok' })
    await createOrUpdateObservation({ instrumentId: instrument.id, cordesGauge: '10-46', controles: 'ok', etatCordes: 'change', etatFrettes: 'polish', sillet: 'adjust' })

    const result = await getObservation(instrument.id)
    expect(result!.cordesGauge).toBe('10-46')
    expect(result!.etatCordes).toBe('change')
  })
})

describe('createMeasureOriginal', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should create a measure with micros', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const micros = [
      { position: 'neck', hauteurBass: 4, hauteurTreble: 3 },
      { position: 'bridge', hauteurBass: 3.5, hauteurTreble: 2.5 },
    ]
    const measure = await createMeasureOriginal({ instrumentId: instrument.id, actionBass12: 2, actionTreble12: 1.5, courbureManche10: 0.5, formePontet: 'radius', dateMesure: '2024-01-01' }, micros)
    expect(measure.id).toBeDefined()
  })
})

describe('createTestAfterMeasure', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should create a test after measure', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const measure = await createMeasureOriginal({ instrumentId: instrument.id, actionBass12: 2, actionTreble12: 1.5, courbureManche10: 0.5, formePontet: 'radius', dateMesure: '2024-01-01' }, [])
    const test = await createTestAfterMeasure({ mesureOriginaleId: measure.id, frise: true, vibrations: true, son: 'ok' })
    expect(test.id).toBeDefined()
    expect(test.frise).toBe(true)
    expect(test.vibrations).toBe(true)
    expect(test.son).toBe('ok')
  })
})

describe('getMeasureOriginal', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should return null when no measure exists', async () => {
    const result = await getMeasureOriginal('non-existent')
    expect(result).toBeNull()
  })

  it('should return measure with micros and tests', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const micros = [{ position: 'neck', hauteurBass: 4, hauteurTreble: 3 }]
    const measure = await createMeasureOriginal({ instrumentId: instrument.id, actionBass12: 2, actionTreble12: 1.5, courbureManche10: 0.5, formePontet: 'radius', dateMesure: '2024-01-01' }, micros)
    await createTestAfterMeasure({ mesureOriginaleId: measure.id, frise: true, vibrations: false, son: 'ok' })

    const result = await getMeasureOriginal(instrument.id)
    expect(result).not.toBeNull()
    expect(result!.id).toBe(measure.id)
    expect(result!.micros).toHaveLength(1)
    expect(result!.test).not.toBeNull()
  })
})

describe('getReglages', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should return empty array when no regolages exist', async () => {
    const result = await getReglages('non-existent')
    expect(result).toEqual([])
  })

  it('should return regolages sorted by ordre', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })

    await createReglage({ instrumentId: instrument.id, dateSaisie: '2024-01-01', courbureManche: 0.5, action12frette: 2, radiusChevalet: 12, intonation: 'ok' }, [], [])
    await createReglage({ instrumentId: instrument.id, dateSaisie: '2024-01-02', courbureManche: 0.6, action12frette: 2.2, radiusChevalet: 12, intonation: 'ok' }, [], [])

    const result = await getReglages(instrument.id)
    expect(result).toHaveLength(2)
    expect(result[0].ordre).toBe(1)
    expect(result[1].ordre).toBe(2)
  })
})

describe('createReglage', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should create a reglage with micros and strings', async () => {
    const instrument = await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    const micros = [{ position: 'neck', hauteur: 4, microBrand: 'Seymour Duncan' }]
    const cordes = [{ stringNum: 1, stringLabel: 'Mi aigu', hauteur: 2 }]
    const reglage = await createReglage({ instrumentId: instrument.id, dateSaisie: '2024-01-01', courbureManche: 0.5, action12frette: 2, radiusChevalet: 12, intonation: 'ok' }, micros, cordes)
    expect(reglage.id).toBeDefined()
    expect(reglage.ordre).toBe(1)
  })
})

describe('getReglages legacy fields', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('normalizes old single-action and numeric-radius reglages on read', async () => {
    await createReglage({ instrumentId: 'legacy-1', dateSaisie: '2024-01-01', courbureManche: 0.5, action12frette: 2, radiusChevalet: 12, intonation: 'ok' }, [], [])
    const reglages = await getReglages('legacy-1')
    expect(reglages).toHaveLength(1)
    expect(reglages[0].action12fretteBass).toBe(2)
    expect(reglages[0].action12fretteTreble).toBe(2)
    expect(reglages[0].radiusChevalet).toBe('12')
    expect(reglages[0].radiusChevaletAutre).toBeNull()
  })

  it('keeps new-format fields untouched', async () => {
    await createReglage({ instrumentId: 'new-1', dateSaisie: '2024-01-01', courbureManche: 0.5, action12fretteBass: 1.8, action12fretteTreble: 1.4, radiusChevalet: 'ok', radiusChevaletAutre: null, intonation: 'ok' }, [], [])
    const reglages = await getReglages('new-1')
    expect(reglages[0].action12fretteBass).toBe(1.8)
    expect(reglages[0].action12fretteTreble).toBe(1.4)
    expect(reglages[0].radiusChevalet).toBe('ok')
  })
})

describe('clearAll', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('should clear all data', async () => {
    await createInstrument({ type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null, diapason: { value: 650, unit: 'mm', label: '650mm' }, radius: 'r9_5', nombreCordes: 6, nombreMicros: 3, dateCreation: '2024-01-01' })
    await clearAll()
    expect((await getInstruments()).length).toBe(0)
  })
})
