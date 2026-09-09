import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import InstrumentsPage from '@/app/instruments/page'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getInstruments: vi.fn(async () => [
    {
      id: 'inst-1',
      type: 'guitar',
      marque: 'Fender',
      modele: 'Stratocaster',
      surnom: null,
      diapason: { value: 643, unit: 'mm', label: 'Moyen' },
      radius: 'r9_5',
      nombreCordes: 6,
      nombreMicros: 2,
      dateCreation: '2026-09-09',
    },
  ]),
}))

describe('instruments page header', () => {
  it('uses a round + button without overflowing text', async () => {
    render(<InstrumentsPage />)
    await screen.findByText('Fender Stratocaster')
    const link = screen.getByRole('link', { name: 'Nouvel instrument' })
    expect(link.className).toContain('rounded-full')
    expect(within(link).queryByText('Nouveau')).toBeNull()
    expect(link.querySelector('svg')).not.toBeNull()
    expect(screen.queryByText('Nouveau')).toBeNull()
  })
})
