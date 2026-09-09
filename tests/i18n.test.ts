import { describe, it, expect } from 'vitest'
import { translate, resolveMessage, type Lang } from '@/i18n/core'

const fr = {
  'home.title': 'GUITAR CARD',
  'common.save': 'Sauvegarder',
  'measures.done': 'Mesures enregistrées',
  'detail.reglage.n': 'Réglage {n}',
}

const en = {
  'home.title': 'GUITAR CARD',
  'measures.done': 'Measurements saved',
}

describe('translate', () => {
  it('returns the template untouched without params', () => {
    expect(translate('GUITAR CARD')).toBe('GUITAR CARD')
  })

  it('interpolates named params', () => {
    expect(translate('Réglage {n}', { n: 3 })).toBe('Réglage 3')
  })

  it('keeps unknown placeholders', () => {
    expect(translate('Réglage {n}', {})).toBe('Réglage {n}')
  })
})

describe('resolveMessage', () => {
  it('prefers the active language', () => {
    expect(resolveMessage({ fr, en }, 'en', 'measures.done')).toBe('Measurements saved')
  })

  it('falls back to French when the language dict lacks the key', () => {
    expect(resolveMessage({ fr, en }, 'en', 'common.save')).toBe('Sauvegarder')
  })

  it('falls back to the key itself when nothing matches', () => {
    expect(resolveMessage({ fr, en }, 'en', 'nope')).toBe('nope')
  })

  it('interpolates after resolution', () => {
    expect(resolveMessage({ fr, en }, 'fr', 'detail.reglage.n', { n: 2 })).toBe('Réglage 2')
  })
})

describe('Lang type shape', () => {
  it('exposes fr and en', () => {
    const langs: Lang[] = ['fr', 'en']
    expect(langs).toContain('fr')
    expect(langs).toContain('en')
  })
})
