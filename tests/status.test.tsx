import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusPage from '@/app/status/page'
import { getReglages, getMeasureOriginal } from '@/lib/storage'

vi.mock('@/lib/storage', () => ({
  getInstruments: vi.fn(async () => [
    {
      id: 'inst-1',
      type: 'guitar',
      marque: 'Fender',
      modele: 'Stratocaster',
      surnom: 'Ma strat',
      diapason: { value: 648, unit: 'mm', label: 'Moyen' },
      radius: 'r9_5',
      dateCreation: '2026-09-09',
    },
  ]),
  getReglages: vi.fn(),
  getMeasureOriginal: vi.fn(),
  DATA_CHANGED_EVENT: 'guitar-card:data-changed',
}))

beforeEach(() => {
  vi.mocked(getReglages).mockResolvedValue([])
  vi.mocked(getMeasureOriginal).mockResolvedValue(null)
})

describe('status page summary block', () => {
  it('shows action, relief and pickup heights from the last reglage', async () => {
    vi.mocked(getReglages).mockResolvedValue([
      {
        id: 'r1',
        action12fretteBass: 1.8,
        action12fretteTreble: 1.4,
        courbureManche: 0.25,
        createdAt: '2026-09-09T14:32:00',
        micros: [
          { position: 'bridge', hauteurBass: 2.8, hauteurTreble: 2.6 },
          { position: 'neck', hauteurBass: 3.2, hauteurTreble: 3.0 },
        ],
      },
    ] as never)
    render(<StatusPage />)
    expect(await screen.findByText('Action 12e')).toBeInTheDocument()
    expect(screen.getByText('1,8 / 1,4 mm')).toBeInTheDocument()
    expect(screen.getByText('Courbure manche')).toBeInTheDocument()
    expect(screen.getByText('0,25 mm')).toBeInTheDocument()
    expect(screen.getByText('Hauteur micros')).toBeInTheDocument()
    expect(screen.getByText('3,2 / 3 mm')).toBeInTheDocument()
    expect(screen.getByText('2,8 / 2,6 mm')).toBeInTheDocument()
    expect(screen.getByText('09 Sept. 2026 · 14:32')).toBeInTheDocument()
  })

  it('falls back to the initial measures and shows its date and time', async () => {
    vi.mocked(getMeasureOriginal).mockResolvedValue({
      id: 'm1',
      actionBass12: 2.2,
      actionTreble12: 1.6,
      courbureManche10: 0.3,
      createdAt: '2026-09-09T10:05:00',
      micros: [{ position: 'neck', hauteurBass: 3.2, hauteurTreble: 3 }],
    } as never)
    render(<StatusPage />)
    expect(await screen.findByText('Action 12e')).toBeInTheDocument()
    expect(screen.getByText('2,2 / 1,6 mm')).toBeInTheDocument()
    expect(screen.getByText('0,3 mm')).toBeInTheDocument()
    expect(screen.getByText('09 Sept. 2026 · 10:05')).toBeInTheDocument()
  })

  it('formats the radius as inches', async () => {
    render(<StatusPage />)
    expect(await screen.findByText(/Radius 9\.5"/)).toBeInTheDocument()
  })

  it('refreshes values when data changes elsewhere in the app', async () => {
    vi.mocked(getMeasureOriginal).mockResolvedValue({
      id: 'm1',
      actionBass12: 2.2,
      actionTreble12: 1.6,
      courbureManche10: 0.3,
      micros: [{ position: 'neck', hauteurBass: 3.2, hauteurTreble: 3 }],
    } as never)
    render(<StatusPage />)
    expect(await screen.findByText('2,2 / 1,6 mm')).toBeInTheDocument()

    vi.mocked(getMeasureOriginal).mockResolvedValue({
      id: 'm2',
      actionBass12: 1.1,
      actionTreble12: 1.0,
      courbureManche10: 0.2,
      micros: [],
    } as never)
    window.dispatchEvent(new Event('guitar-card:data-changed'))
    expect(await screen.findByText('1,1 / 1 mm')).toBeInTheDocument()
  })

  it('stays compact when no data exists yet', async () => {
    render(<StatusPage />)
    expect(await screen.findByText('Fender Stratocaster')).toBeInTheDocument()
    expect(screen.queryByText('Action 12e')).toBeNull()
  })
})
