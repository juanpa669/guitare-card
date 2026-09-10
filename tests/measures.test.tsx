import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import MeasuresPage from '@/components/MeasuresPage'
import { getMeasureOriginal, getInstrument } from '@/lib/storage'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getMeasureOriginal: vi.fn(),
  getInstrument: vi.fn(),
  createMeasureOriginal: vi.fn(async () => ({ id: 'm1' })),
  createTestAfterMeasure: vi.fn(async () => ({ id: 't1' })),
}))

beforeEach(() => {
  vi.mocked(getMeasureOriginal).mockResolvedValue(null as never)
  vi.mocked(getInstrument).mockResolvedValue(null as never)
})

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

const micSelect = () =>
  screen
    .getAllByRole('combobox')
    .find(s => within(s as HTMLElement).queryByText('3 micros')) as HTMLSelectElement

const positionSelect = () =>
  screen
    .getAllByRole('combobox')
    .find(s => within(s as HTMLElement).queryByText('Middle')) as HTMLSelectElement

describe('MeasuresPage heading', () => {
  it("is 'Premières mesures' when the instrument has no measure yet", async () => {
    render(<MeasuresPage />)
    expect(await screen.findByText('Premières mesures')).toBeInTheDocument()
  })

  it("is 'Nouvelles mesures' when first measures already exist", async () => {
    vi.mocked(getMeasureOriginal).mockResolvedValueOnce({ id: 'm1', micros: [], test: null } as never)
    render(<MeasuresPage />)
    await settle()
    expect(await screen.findByText('Nouvelles mesures')).toBeInTheDocument()
    expect(screen.queryByText('Premières mesures')).toBeNull()
  })
})

describe('MeasuresPage mic count follows the instrument', () => {
  it('prefills 3 micros for a 3-mic instrument and shows the three positions', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce({ nombreMicros: 3 } as never)
    render(<MeasuresPage />)
    await screen.findByText('Premières mesures')
    await settle()
    expect(micSelect().value).toBe('3')
    expect(screen.getByText('Neck')).toBeInTheDocument()
    expect(screen.getByText('Middle')).toBeInTheDocument()
    expect(screen.getByText('Bridge')).toBeInTheDocument()
  })

  it('prefills 0 micro and hides every mic card for a mic-less instrument', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce({ nombreMicros: 0 } as never)
    render(<MeasuresPage />)
    await screen.findByText('Premières mesures')
    await settle()
    expect(micSelect().value).toBe('0')
    expect(screen.queryByText('Neck')).toBeNull()
    expect(screen.queryByText('Bridge')).toBeNull()
  })

  it('offers a position choice for a single mic instead of forcing Neck', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce({ nombreMicros: 1 } as never)
    render(<MeasuresPage />)
    await screen.findByText('Premières mesures')
    await settle()
    const select = positionSelect()
    expect(select).toBeDefined()
    expect(select.value).toBe('neck')
    fireEvent.change(select, { target: { value: 'bridge' } })
    await settle()
    expect(positionSelect().value).toBe('bridge')
  })
})
