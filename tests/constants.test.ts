import { describe, it, expect, beforeEach } from 'vitest'
import {
  formatRadius,
  getStringsForCount,
  getCustomBrands,
  addCustomBrand,
  getAllBrands,
  getAllPickupBrands,
  STRING_LABELS_GUITAR,
  STRING_LABELS_BASS,
  STRING_LABELS_UKULELE,
  STRING_LABELS_GUITAR_12,
  GUITAR_BRANDS,
  PICKUP_BRANDS,
} from '@/lib/constants'

describe('formatRadius', () => {
  it('should format r7_5 as 7.5"', () => {
    expect(formatRadius('r7_5')).toBe('7.5"')
  })

  it('should format r9_5 as 9.5"', () => {
    expect(formatRadius('r9_5')).toBe('9.5"')
  })

  it('should format r10 as 10"', () => {
    expect(formatRadius('r10')).toBe('10"')
  })

  it('should format r12 as 12"', () => {
    expect(formatRadius('r12')).toBe('12"')
  })

  it('should format r14 as 14"', () => {
    expect(formatRadius('r14')).toBe('14"')
  })

  it('should format r16 as 16"', () => {
    expect(formatRadius('r16')).toBe('16"')
  })

  it('should format compound as Composé', () => {
    expect(formatRadius('compound')).toBe('Composé')
  })

  it('should return unknown radius as-is', () => {
    expect(formatRadius('unknown')).toBe('unknown')
  })
})


describe('getStringsForCount', () => {
  describe('Guitar', () => {
    it('should return 6 string labels', () => {
      const strings = getStringsForCount(6, 'guitar')
      expect(strings).toHaveLength(6)
      expect(strings[0]).toEqual({ label: 'Mi grave', shortLabel: '6E' })
      expect(strings[5]).toEqual({ label: 'Mi aigu', shortLabel: '1E' })
    })

    it('should return 4 string labels', () => {
      const strings = getStringsForCount(4, 'guitar')
      expect(strings).toHaveLength(4)
      expect(strings[0]).toEqual({ label: 'Mi grave', shortLabel: '6E' })
      expect(strings[3]).toEqual({ label: 'Ré', shortLabel: '3D' })
    })

    it('should return 7 string labels', () => {
      const strings = getStringsForCount(7, 'guitar')
      expect(strings).toHaveLength(7)
      expect(strings[0].label).toBe('Mi grave')
      expect(strings[6].label).toBe('Si (grave)')
    })

    it('should return 8 string labels', () => {
      const strings = getStringsForCount(8, 'guitar')
      expect(strings).toHaveLength(8)
      expect(strings[0].label).toBe('Mi grave')
      expect(strings[7].label).toBe('Mi (aigu)')
    })

    it('should return 12 string labels', () => {
      const strings = getStringsForCount(12, 'guitar')
      expect(strings).toHaveLength(12)
      expect(strings[0]).toEqual({ label: 'Mi grave', shortLabel: '6E' })
      expect(strings[6]).toEqual({ label: 'Mi grave (oct)', shortLabel: '6E-o' })
      expect(strings[11]).toEqual({ label: 'Mi aigu (oct)', shortLabel: '1E-o' })
    })

    it('should return empty array for null count', () => {
      const strings = getStringsForCount(null, 'guitar')
      expect(strings).toHaveLength(0)
    })

    it('should return empty array for undefined type', () => {
      const strings = getStringsForCount(6)
      expect(strings).toHaveLength(6)
    })
  })

  describe('Bass', () => {
    it('should return 4 string labels', () => {
      const strings = getStringsForCount(4, 'bass')
      expect(strings).toHaveLength(4)
      expect(strings[0]).toEqual({ label: 'Mi grave', shortLabel: '4E' })
      expect(strings[3]).toEqual({ label: 'Sol', shortLabel: '1G' })
    })

    it('should return 5 string labels', () => {
      const strings = getStringsForCount(5, 'bass')
      expect(strings).toHaveLength(5)
      expect(strings[4]).toEqual({ label: 'Si', shortLabel: '5B' })
    })

    it('should return 6 string labels', () => {
      const strings = getStringsForCount(6, 'bass')
      expect(strings).toHaveLength(6)
      expect(strings[5]).toEqual({ label: 'Mi', shortLabel: '4E' })
    })

    it('should return 7 string labels', () => {
      const strings = getStringsForCount(7, 'bass')
      expect(strings).toHaveLength(7)
      expect(strings[6].label).toBe('Corde 1')
      expect(strings[6].shortLabel).toBe('1E')
    })
  })

  describe('Ukulele', () => {
    it('should return 4 string labels', () => {
      const strings = getStringsForCount(4, 'ukulele')
      expect(strings).toHaveLength(4)
      expect(strings[0]).toEqual({ label: 'Sol', shortLabel: '4G' })
      expect(strings[3]).toEqual({ label: 'La', shortLabel: '1A' })
    })

    it('should return 5 string labels with fallback', () => {
      const strings = getStringsForCount(5, 'ukulele')
      expect(strings).toHaveLength(5)
      expect(strings[4].label).toBe('Corde 1')
      expect(strings[4].shortLabel).toBe('1A')
    })
  })
})

describe('Custom Brands', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return empty array initially', () => {
    expect(getCustomBrands()).toEqual([])
  })

  it('should add a custom brand', () => {
    addCustomBrand('Custom Brand')
    expect(getCustomBrands()).toContain('Custom Brand')
  })

  it('should not add duplicate brands', () => {
    addCustomBrand('Custom Brand')
    addCustomBrand('Custom Brand')
    expect(getCustomBrands()).toHaveLength(1)
  })

  it('should trim brand names', () => {
    addCustomBrand('  Custom Brand  ')
    expect(getCustomBrands()).toContain('Custom Brand')
  })

  it('should not add empty names', () => {
    addCustomBrand('  ')
    expect(getCustomBrands()).toHaveLength(0)
  })

  it('should return static + custom brands', () => {
    addCustomBrand('MyBrand')
    const brands = getAllBrands()
    expect(brands).toContain('Fender')
    expect(brands).toContain('MyBrand')
  })

  it('should return static + custom pickup brands', () => {
    addCustomBrand('MyPickup')
    const brands = getAllPickupBrands()
    expect(brands).toContain('Seymour Duncan')
    expect(brands).toContain('MyPickup')
  })

  it('sorts pickup brands alphabetically and keeps Autres last', () => {
    addCustomBrand('Aria Custom')
    const brands = getAllPickupBrands()
    expect(brands[brands.length - 1]).toBe('Autres')
    expect(brands.indexOf('Aria Custom')).toBeGreaterThan(-1)
    expect(brands.indexOf('Aria Custom')).toBeLessThan(brands.indexOf('Bare Knuckle'))
    expect(brands.indexOf('DiMarzio')).toBeLessThan(brands.indexOf('Fender'))
  })

  it('sorts guitar brands alphabetically and keeps Autres last', () => {
    addCustomBrand('Zeta Custom')
    const brands = getAllBrands()
    expect(brands[brands.length - 1]).toBe('Autres')
    expect(brands.indexOf('Fender')).toBeLessThan(brands.indexOf('Gibson'))
    expect(brands.indexOf('Zeta Custom')).toBeLessThan(brands.indexOf('Autres'))
  })

  it('does not duplicate a custom brand that matches a static one', () => {
    addCustomBrand('Fender')
    const brands = getAllPickupBrands()
    expect(brands.filter(b => b === 'Fender')).toHaveLength(1)
    expect(brands[brands.length - 1]).toBe('Autres')
  })
})

describe('Static exports', () => {
  it('should have correct guitar string labels count', () => {
    expect(STRING_LABELS_GUITAR).toHaveLength(12)
  })

  it('should have correct bass string labels count', () => {
    expect(STRING_LABELS_BASS).toHaveLength(12)
  })

  it('should have correct ukulele string labels', () => {
    expect(STRING_LABELS_UKULELE).toEqual(['Sol', 'Do', 'Mi', 'La'])
  })

  it('should have 12-string guitar labels', () => {
    expect(STRING_LABELS_GUITAR_12).toHaveLength(12)
  })

  it('should have guitar brands', () => {
    expect(GUITAR_BRANDS).toContain('Fender')
    expect(GUITAR_BRANDS).toContain('Gibson')
  })

  it('should have pickup brands', () => {
    expect(PICKUP_BRANDS).toContain('Seymour Duncan')
    expect(PICKUP_BRANDS).toContain('DiMarzio')
  })
})


