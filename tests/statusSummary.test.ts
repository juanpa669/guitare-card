import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatActionPair,
  buildStatusSummary,
} from '@/lib/statusSummary'

describe('formatNumber', () => {
  it('formats decimals with a French comma', () => {
    expect(formatNumber(0.25)).toBe('0,25')
    expect(formatNumber(3.2)).toBe('3,2')
    expect(formatNumber(2)).toBe('2')
  })

  it('returns null for missing or invalid values', () => {
    expect(formatNumber(null)).toBeNull()
    expect(formatNumber(undefined)).toBeNull()
    expect(formatNumber(Number.NaN)).toBeNull()
  })
})

describe('formatActionPair', () => {
  it('joins grave and aigu values', () => {
    expect(formatActionPair(2, 1.5)).toBe('2 / 1,5')
  })

  it('handles missing sides', () => {
    expect(formatActionPair(null, 1.5)).toBe('— / 1,5')
    expect(formatActionPair(null, null)).toBe('—')
  })
})

describe('buildStatusSummary', () => {
  it('returns null without any source', () => {
    expect(buildStatusSummary(null, null)).toBeNull()
    expect(buildStatusSummary([], null)).toBeNull()
  })

  it('uses the last reglage when present', () => {
    const summary = buildStatusSummary(
      [
        { action12fretteBass: 2, action12fretteTreble: 1.5, courbureManche: 0.3, micros: [] },
        { action12fretteBass: 1.8, action12fretteTreble: 1.4, courbureManche: 0.25, micros: [{ position: 'bridge', hauteur: 2.8 }, { position: 'neck', hauteur: 3.2 }] },
      ],
      null,
    )
    expect(summary?.basis).toBe('reglage')
    expect(summary?.action).toBe('1,8 / 1,4')
    expect(summary?.courbure).toBe('0,25')
    expect(summary?.micros.map(m => `${m.label}:${m.value}`)).toEqual(['Neck:3,2', 'Bridge:2,8'])
  })

  it('falls back to the initial measures without any reglage', () => {
    const summary = buildStatusSummary([], {
      actionBass12: 2.2,
      actionTreble12: 1.6,
      courbureManche10: 0.3,
      micros: [{ position: 'neck', hauteurBass: 3.2, hauteurTreble: 3.0 }],
    })
    expect(summary?.basis).toBe('initial')
    expect(summary?.action).toBe('2,2 / 1,6')
    expect(summary?.courbure).toBe('0,3')
    expect(summary?.micros.map(m => `${m.label}:${m.value}`)).toEqual(['Neck:3,2 / 3'])
  })
})
