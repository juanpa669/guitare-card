import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import MeasuresPage from '@/components/MeasuresPage'
import {
  clearAll,
  createInstrument,
  createMeasureOriginal,
  getMeasureOriginal,
} from '@/lib/storage'

const mockUseSearchParams = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: (...args: unknown[]) => mockUseSearchParams(...args),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

const settle = async () => {
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

async function seedInstrument(nombreMicros = 2): Promise<string> {
  const inst = await createInstrument({
    type: 'guitar', marque: 'Fender', modele: 'Stratocaster', surnom: null,
    diapason: { value: 648, unit: 'mm', label: 'Moyen' }, radius: 'r9_5',
    nombreCordes: 6, nombreMicros, dateCreation: '2026-09-09',
  });
  return inst.id;
}

describe('measures sessions are stored per run', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('keeps every session and returns the latest one', async () => {
    const id = await seedInstrument()
    await createMeasureOriginal({ instrumentId: id, actionBass12: 2.5, actionTreble12: 1.8, courbureManche10: 0.3, formePontet: 'radius', dateMesure: '2026-09-01' }, [])
    await createMeasureOriginal({ instrumentId: id, actionBass12: 2.2, actionTreble12: 1.6, courbureManche10: 0.25, formePontet: 'adjust', dateMesure: '2026-09-09' }, [])

    const latest = await getMeasureOriginal(id)
    expect(latest.actionBass12).toBe(2.2)
    expect(latest.actionTreble12).toBe(1.6)
    expect(latest.courbureManche10).toBe(0.25)
  })
})

describe('measures wizard saves with the real storage', () => {
  beforeEach(async () => {
    await clearAll()
  })

  it('persists a new session through the wizard to done', async () => {
    const id = await seedInstrument()
    mockUseSearchParams.mockReturnValue({ get: (key: string) => (key === 'id' ? id : null) })

    render(<MeasuresPage />)
    expect(await screen.findByText('Premières mesures')).toBeInTheDocument()

    const spinbuttons = await screen.findAllByRole('spinbutton')
    fireEvent.change(spinbuttons[0], { target: { value: '2' } })
    fireEvent.change(spinbuttons[1], { target: { value: '1.5' } })
    fireEvent.change(spinbuttons[2], { target: { value: '0.25' } })
    await settle()

    fireEvent.click(screen.getByText('Voir le récapitulatif'))
    await settle()
    expect(screen.getAllByText('Récapitulatif').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByText('Tests'))
    await settle()

    fireEvent.click(screen.getByText('Enregistrer'))
    expect(await screen.findByText('Mesures enregistrées')).toBeInTheDocument()

    const saved = await getMeasureOriginal(id)
    expect(saved.actionBass12).toBe(2)
    expect(saved.actionTreble12).toBe(1.5)
    expect(saved.courbureManche10).toBe(0.25)
    expect(saved.test).toBeDefined()
  })

  it('saves the chosen position for a single-mic instrument', async () => {
    const id = await seedInstrument(1)
    mockUseSearchParams.mockReturnValue({ get: (key: string) => (key === 'id' ? id : null) })

    render(<MeasuresPage />)
    expect(await screen.findByText('Premières mesures')).toBeInTheDocument()
    await settle()

    const positionSelect = screen
      .getAllByRole('combobox')
      .find(s => within(s as HTMLElement).queryByText('Middle')) as HTMLSelectElement
    expect(positionSelect.value).toBe('neck')
    fireEvent.change(positionSelect, { target: { value: 'bridge' } })
    await settle()

    const spinbuttons = await screen.findAllByRole('spinbutton')
    fireEvent.change(spinbuttons[0], { target: { value: '2' } })
    fireEvent.change(spinbuttons[1], { target: { value: '1.5' } })
    fireEvent.change(spinbuttons[2], { target: { value: '0.25' } })
    await settle()

    fireEvent.click(screen.getByText('Voir le récapitulatif'))
    await settle()
    fireEvent.click(screen.getByText('Tests'))
    await settle()
    fireEvent.click(screen.getByText('Enregistrer'))
    expect(await screen.findByText('Mesures enregistrées')).toBeInTheDocument()

    const saved = await getMeasureOriginal(id)
    expect(saved.micros).toHaveLength(1)
    expect(saved.micros[0].position).toBe('bridge')
  })
})
