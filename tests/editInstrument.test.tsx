import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import EditInstrumentPage from '@/components/EditInstrumentPage'
import { getInstrument } from '@/lib/storage'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getInstrument: vi.fn(),
  updateInstrument: vi.fn(),
}))

const base = {
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
}

const settle = async () => {
  await act(async () => {
    await Promise.resolve()
  })
  await act(async () => {
    await Promise.resolve()
  })
}

const micSelect = () =>
  screen
    .getAllByRole('combobox')
    .find(s => within(s as HTMLElement).queryByText('3 micros')) as HTMLSelectElement

describe('EditInstrumentPage keeps the saved mic count', () => {
  it('shows 0 micro when the instrument was saved without any mic', async () => {
    vi.mocked(getInstrument).mockResolvedValue({ ...base, nombreMicros: 0 } as never)
    render(<EditInstrumentPage />)
    await screen.findByText('Modifier l\u2019instrument')
    await settle()
    expect(micSelect().value).toBe('0')
  })

  it('shows the saved mic count (3) unchanged', async () => {
    vi.mocked(getInstrument).mockResolvedValue({ ...base, nombreMicros: 3 } as never)
    render(<EditInstrumentPage />)
    await screen.findByText('Modifier l\u2019instrument')
    await settle()
    expect(micSelect().value).toBe('3')
  })
})
