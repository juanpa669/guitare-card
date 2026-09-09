import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import InstrumentDetailPage from '@/components/InstrumentDetailPage'
import type { Instrument } from '@/types'

const fixture: Instrument = {
  id: 'inst-1',
  type: 'guitar',
  marque: 'Fender',
  modele: 'Stratocaster',
  surnom: 'Ma strat',
  diapason: { value: 643, unit: 'mm', label: 'Moyen' },
  radius: 'r9_5',
  nombreCordes: 6,
  nombreMicros: 2,
  dateCreation: '2026-09-09',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push, back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getInstrument: vi.fn(async () => fixture),
  getObservation: vi.fn(async () => null),
  getMeasureOriginal: vi.fn(async () => null),
  getReglages: vi.fn(async () => []),
  deleteInstrument: vi.fn(async () => undefined),
}))

describe('instrument flow (query-param navigation)', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders the detail hub from the id given in the query string', async () => {
    render(<InstrumentDetailPage />)
    expect(await screen.findByText('Fender Stratocaster')).toBeInTheDocument()
    expect(screen.getByText('Ma strat')).toBeInTheDocument()
  })

  it('links to the static edit route carrying the id as query param', async () => {
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    expect(document.querySelector('a[href="/instrument/edit?id=inst-1"]')).not.toBeNull()
  })

  it('never links to a dynamic segment route', async () => {
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    expect(document.querySelector('a[href*="[id]"]')).toBeNull()
    expect(document.querySelector('a[href*="/instruments/inst-1"]')).toBeNull()
  })
})
