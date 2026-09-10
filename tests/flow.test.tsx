import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import InstrumentDetailPage from '@/components/InstrumentDetailPage'
import type { Instrument } from '@/types'
import { getInstrument, getObservation, getMeasures, getReglages } from '@/lib/storage'

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
  getInstrument: vi.fn(),
  getObservation: vi.fn(),
  getMeasures: vi.fn(),
  getReglages: vi.fn(),
  deleteInstrument: vi.fn(),
  DATA_CHANGED_EVENT: 'guitar-card:data-changed',
}))

const observationFixture = {
  instrumentId: 'inst-1',
  cordesGauge: '10-46',
  etatCordes: 'Neuves',
  etatFrettes: 'ras',
  frettesAutre: null,
  elementsDevisses: null,
  piecesManquantes: null,
  sillet: 'ok',
  silletAutre: null,
  controles: '',
}

beforeEach(() => {
  push.mockClear()
  vi.mocked(getInstrument).mockResolvedValue(fixture as never)
  vi.mocked(getObservation).mockResolvedValue(null as never)
  vi.mocked(getMeasures).mockResolvedValue([] as never)
  vi.mocked(getReglages).mockResolvedValue([] as never)
})

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('instrument flow (query-param navigation)', () => {
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

  it('makes the observations tab editable when an observation exists', async () => {
    vi.mocked(getObservation).mockResolvedValueOnce(observationFixture as never)
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /observations/i }))
    await settle()
    expect(screen.getByText('Neuves')).toBeInTheDocument()
    expect(screen.getByText('Modifier les observations')).toBeInTheDocument()
    expect(document.querySelector('a[href="/instrument/observations?id=inst-1"]')).not.toBeNull()
  })

  it('lists the optional observation fields as bullet points, one per comma item', async () => {
    vi.mocked(getObservation).mockResolvedValueOnce({
      ...observationFixture,
      elementsDevisses: 'pick guard, mécaniques',
      piecesManquantes: 'vis',
    } as never)
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /observations/i }))
    await settle()

    expect(screen.getByText('Éléments dévissés')).toBeInTheDocument()
    expect(screen.getByText('Pick guard')).toBeInTheDocument()
    expect(screen.getByText('Mécaniques')).toBeInTheDocument()
    expect(screen.getByText('Pièces manquantes')).toBeInTheDocument()
    expect(screen.getByText('Vis')).toBeInTheDocument()
    expect(document.querySelectorAll('ul li')).toHaveLength(3)
  })

  it('hides the optional observation fields when they are empty', async () => {
    vi.mocked(getObservation).mockResolvedValueOnce(observationFixture as never)
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /observations/i }))
    await settle()
    expect(screen.queryByText('Éléments dévissés')).toBeNull()
    expect(screen.queryByText('Pièces manquantes')).toBeNull()
    expect(document.querySelectorAll('ul li')).toHaveLength(0)
  })

  it('lists measure sessions with dates, tags and a working sort toggle', async () => {
    vi.mocked(getMeasures).mockResolvedValueOnce([
      { id: 'm3', dateMesure: '2026-09-09', createdAt: '2026-09-09T14:00:00', actionBass12: 1, actionTreble12: 1, courbureManche10: 0.2, formePontet: 'radius', micros: [], test: null },
      { id: 'm2', dateMesure: '2026-08-20', createdAt: '2026-08-20T10:00:00', actionBass12: 1, actionTreble12: 1, courbureManche10: 0.2, formePontet: 'radius', micros: [], test: null },
      { id: 'm1', dateMesure: '2026-07-02', createdAt: '2026-07-02T09:00:00', actionBass12: 1, actionTreble12: 1, courbureManche10: 0.2, formePontet: 'radius', micros: [], test: null },
    ] as never)
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Mesures' }))
    await settle()
    expect(screen.getByText('Dernières mesures')).toBeInTheDocument()
    expect(screen.getByText('Premières mesures')).toBeInTheDocument()
    expect(screen.getByText('09 Sept. 2026')).toBeInTheDocument()
    expect(screen.getByText('02 Juil. 2026')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Inverser le tri des mesures' }))
    await settle()
    expect(screen.getByText('Dernières mesures')).toBeInTheDocument()
    expect(screen.getByText('Premières mesures')).toBeInTheDocument()
  })

  it('renders the reglages tab with the same clean layout as measures', async () => {
    vi.mocked(getReglages).mockResolvedValueOnce([
      {
        id: 'r1', instrumentId: 'inst-1', dateSaisie: '2026-09-09', courbureManche: 0.25,
        action12fretteBass: 2, action12fretteTreble: 1.5, radiusChevalet: 'ok',
        radiusChevaletAutre: null, intonation: 'regler', microBrand: null, ordre: 1,
        cordes: [{ id: 'c1', reglageId: 'r1', stringNum: 1, stringLabel: 'Mi grave', hauteur: 0.3 }],
        micros: [{ id: 'mi1', reglageId: 'r1', position: 'neck', hauteurBass: 1.2, hauteurTreble: 0.9, microBrand: 'EMG' }],
      },
    ] as never)
    render(<InstrumentDetailPage />)
    await screen.findByText('Fender Stratocaster')
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Réglages' }))
    await settle()

    expect(screen.getByText('Réglage 1')).toBeInTheDocument()
    expect(screen.getByText('09 Sept. 2026')).toBeInTheDocument()
    expect(screen.getByText('À régler')).toBeInTheDocument()
    expect(screen.getByText('Mi grave')).toBeInTheDocument()

    const card = screen.getByText('Réglage 1').closest('.card') as HTMLElement
    expect(within(card).getByText('Courbure manche')).toBeInTheDocument()
    expect(within(card).getByText('0.25 mm')).toBeInTheDocument()
    expect(within(card).getByText('Action 12e (grave)')).toBeInTheDocument()
    expect(within(card).getByText('2 mm')).toBeInTheDocument()
    expect(within(card).getByText('Action 12e (aigu)')).toBeInTheDocument()
    expect(within(card).getByText('1.5 mm')).toBeInTheDocument()
    expect(within(card).getByText('Intonation')).toBeInTheDocument()
    expect(within(card).getByText('À régler')).toBeInTheDocument()
    expect(within(card).getByText(/Neck/)).toBeInTheDocument()
    expect(within(card).getByText('Grave 1.2 mm · Aigu 0.9 mm')).toBeInTheDocument()
    expect(within(card).getByText('Mi grave')).toBeInTheDocument()
    expect(within(card).getByText('0.3 mm')).toBeInTheDocument()
  })
})
