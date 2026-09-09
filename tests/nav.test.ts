import { describe, it, expect } from 'vitest'
import {
  instrumentDetailHref,
  instrumentEditHref,
  instrumentMeasuresHref,
  instrumentObservationsHref,
  instrumentReglagesHref,
} from '@/lib/nav'

describe('instrument nav helpers', () => {
  const id = 'abc-123'

  it('detail href has no dynamic segment and carries the id as query param', () => {
    expect(instrumentDetailHref(id)).toBe('/instrument?id=abc-123')
    expect(instrumentDetailHref(id)).not.toContain('[id]')
  })

  it('edit href points to the static edit route', () => {
    expect(instrumentEditHref(id)).toBe('/instrument/edit?id=abc-123')
    expect(instrumentEditHref(id)).not.toContain('[id]')
  })

  it('measures href points to the static measures route', () => {
    expect(instrumentMeasuresHref(id)).toBe('/instrument/measures?id=abc-123')
    expect(instrumentMeasuresHref(id)).not.toContain('[id]')
  })

  it('observations href points to the static observations route', () => {
    expect(instrumentObservationsHref(id)).toBe('/instrument/observations?id=abc-123')
    expect(instrumentObservationsHref(id)).not.toContain('[id]')
  })

  it('reglages href points to the static reglages route', () => {
    expect(instrumentReglagesHref(id)).toBe('/instrument/reglages?id=abc-123')
    expect(instrumentReglagesHref(id)).not.toContain('[id]')
  })

  it('encodes special characters in the id', () => {
    expect(instrumentDetailHref('a b&c')).toBe('/instrument?id=a%20b%26c')
  })
})
