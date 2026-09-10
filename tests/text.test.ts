import { describe, it, expect } from 'vitest'
import { splitList, capitalizeFirst } from '@/lib/text'

describe('splitList', () => {
  it('splits a comma separated string, trims items and drops empties', () => {
    expect(splitList('pick guard, mécaniques')).toEqual(['pick guard', 'mécaniques'])
    expect(splitList(' vis , ,capot ')).toEqual(['vis', 'capot'])
  })

  it('returns an empty array for empty input', () => {
    expect(splitList('')).toEqual([])
    expect(splitList('   ')).toEqual([])
    expect(splitList(null)).toEqual([])
    expect(splitList(undefined)).toEqual([])
  })
})

describe('capitalizeFirst', () => {
  it('uppercases the first letter and keeps the rest untouched', () => {
    expect(capitalizeFirst('pick guard')).toBe('Pick guard')
    expect(capitalizeFirst('Mécaniques')).toBe('Mécaniques')
  })

  it('returns an empty string unchanged', () => {
    expect(capitalizeFirst('')).toBe('')
  })
})
