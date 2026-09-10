import { describe, it, expect } from 'vitest'
import { intonationLabel, type TranslateFn } from '@/lib/i18n-labels'
import { resolveMessage } from '@/i18n/core'
import fr from '@/i18n/fr'

const t: TranslateFn = (key, params) => resolveMessage({ fr, en: {} }, 'fr', key, params)

describe('intonationLabel', () => {
  it('translates the known states', () => {
    expect(intonationLabel(t, 'ok')).toBe('OK')
    expect(intonationLabel(t, 'ko')).toBe('KO')
    expect(intonationLabel(t, 'regler')).toBe('À régler')
    expect(intonationLabel(t, 'paufiner')).toBe('À peaufiner')
  })

  it('falls back to the raw value for legacy free text', () => {
    expect(intonationLabel(t, 'Bon')).toBe('Bon')
  })

  it('shows a dash when empty', () => {
    expect(intonationLabel(t, '')).toBe('—')
    expect(intonationLabel(t, null)).toBe('—')
    expect(intonationLabel(t, undefined)).toBe('—')
  })
})
