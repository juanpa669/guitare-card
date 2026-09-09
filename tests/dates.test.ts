import { describe, it, expect } from 'vitest'
import { formatFrenchDate, formatTime } from '@/lib/dates'

describe('formatFrenchDate', () => {
  it('formats YYYY-MM-DD as day + short French month + year', () => {
    expect(formatFrenchDate('2026-09-09')).toBe('09 Sept. 2026')
    expect(formatFrenchDate('2026-01-05')).toBe('05 Janv. 2026')
    expect(formatFrenchDate('2026-12-31')).toBe('31 Déc. 2026')
  })

  it('accepts full ISO timestamps and keeps the date part', () => {
    expect(formatFrenchDate('2026-09-09T14:32:00.000Z')).toBe('09 Sept. 2026')
  })

  it('returns null for missing or invalid values', () => {
    expect(formatFrenchDate(null)).toBeNull()
    expect(formatFrenchDate('not-a-date')).toBeNull()
    expect(formatFrenchDate('2026-13-01')).toBeNull()
  })
})

describe('formatTime', () => {
  it('formats an ISO timestamp as local HH:MM', () => {
    expect(formatTime('2026-09-09T14:32:00')).toBe('14:32')
  })

  it('returns null for missing or invalid values', () => {
    expect(formatTime(null)).toBeNull()
    expect(formatTime('2026-09-09')).toBeNull()
  })
})
