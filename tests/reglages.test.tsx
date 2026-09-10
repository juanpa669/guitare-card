import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import ReglagesPage from '@/components/ReglagesPage'
import { getInstrument, createReglage } from '@/lib/storage'
import { addCustomBrand, getCustomBrands } from '@/lib/constants'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getInstrument: vi.fn(async () => null),
  getMeasureOriginal: vi.fn(async () => null),
  createReglage: vi.fn(async () => ({ id: 'r1' })),
}))

const numMicsSelect = () => {
  const el = screen
    .getAllByRole('combobox')
    .find(s => within(s as HTMLElement).queryByText('3 micros'))
  return el as HTMLSelectElement
}

const positionCard = (label: string) => {
  const heading = screen.getByText(label)
  return heading.closest('.card') as HTMLElement
}

const brandSelectOf = (label: string) =>
  within(positionCard(label)).getByRole('combobox') as HTMLSelectElement

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('ReglagesPage micro-brand selects', () => {
  it('shows one brand select per micro position and no global select', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    expect(screen.getAllByText('Marque du micro')).toHaveLength(2)
  })

  it('shows a working brand select for Neck, Middle and Bridge with 3 micros', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    fireEvent.change(numMicsSelect(), { target: { value: '3' } })
    await settle()
    expect(screen.getAllByText('Marque du micro')).toHaveLength(3)
    expect(screen.getByText('Middle')).toBeInTheDocument()
    fireEvent.change(brandSelectOf('Middle'), { target: { value: 'EMG' } })
    await settle()
    expect(brandSelectOf('Middle').value).toBe('EMG')
  })

  it('keeps brand selection independent per position', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    fireEvent.change(brandSelectOf('Neck'), { target: { value: 'EMG' } })
    await settle()
    expect(brandSelectOf('Neck').value).toBe('EMG')
    expect(brandSelectOf('Bridge').value).toBe('')
  })

  it('shows the custom brand input only in the position that chose Autres', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    fireEvent.change(brandSelectOf('Neck'), { target: { value: 'Autres' } })
    await settle()
    expect(within(positionCard('Neck')).getByPlaceholderText('Nom du fabricant...')).toBeInTheDocument()
    expect(within(positionCard('Bridge')).queryByPlaceholderText('Nom du fabricant...')).toBeNull()
  })
})

describe('ReglagesPage action and radius chevalet fields', () => {
  const groupOf = (label: string) =>
    screen.getByText(label).closest('.form-group') as HTMLElement

  it('provides two action fields: grave and aigu', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    const group = groupOf('Action 12ème frette (mm)')
    expect(within(group).getByText('Grave')).toBeInTheDocument()
    expect(within(group).getByText('Aigu')).toBeInTheDocument()
    expect(within(group).getAllByRole('spinbutton')).toHaveLength(2)
  })

  it('offers OK/KO/À peaufiner/Autres for the chevalet radius and a text field for Autres', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    const group = groupOf('Radius cordes au chevalet')
    const select = within(group).getByRole('combobox') as HTMLSelectElement
    expect(Array.from(select.options).map(o => o.text)).toEqual(['OK', 'KO', 'À peaufiner', 'Autres'])
    fireEvent.change(select, { target: { value: 'autre' } })
    await settle()
    expect(screen.getByPlaceholderText('Détail du problème...')).toBeInTheDocument()
  })
})

describe('ReglagesPage intonation field', () => {
  const groupOf = (label: string) =>
    screen.getByText(label).closest('.form-group') as HTMLElement

  it('offers OK/KO/À régler/À peaufiner as a select defaulting to OK', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    const select = within(groupOf('Intonation')).getByRole('combobox') as HTMLSelectElement
    expect(Array.from(select.options).map(o => o.text)).toEqual(['OK', 'KO', 'À régler', 'À peaufiner'])
    expect(select.value).toBe('ok')
    fireEvent.change(select, { target: { value: 'regler' } })
    await settle()
    expect(select.value).toBe('regler')
  })
})

describe('ReglagesPage mic count follows the instrument', () => {
  const instrumentWith = (nombreMicros: number) => ({
    type: 'guitar',
    nombreCordes: 6,
    nombreMicros,
  })

  const positionSelect = () =>
    screen
      .getAllByRole('combobox')
      .find(s => within(s as HTMLElement).queryByText('Middle')) as HTMLSelectElement

  it('prefills 3 micros for a 3-mic instrument', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce(instrumentWith(3) as never)
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    expect(numMicsSelect().value).toBe('3')
    expect(screen.getAllByText('Marque du micro')).toHaveLength(3)
  })

  it('prefills 0 micro and hides every mic card for a mic-less instrument', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce(instrumentWith(0) as never)
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    expect(numMicsSelect().value).toBe('0')
    expect(screen.queryAllByText('Marque du micro')).toHaveLength(0)
  })

  it('offers a position choice for a single mic instead of forcing Neck', async () => {
    vi.mocked(getInstrument).mockResolvedValueOnce(instrumentWith(1) as never)
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    const select = positionSelect()
    expect(select).toBeDefined()
    expect(select.value).toBe('neck')
    fireEvent.change(select, { target: { value: 'bridge' } })
    await settle()
    expect(positionSelect().value).toBe('bridge')
    expect(screen.getAllByText('Marque du micro')).toHaveLength(1)
    expect(
      screen.getAllByRole('combobox').find(s => within(s as HTMLElement).queryByText('EMG')),
    ).toBeDefined()
  })
})

describe('ReglagesPage pickup brand list', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('proposes persisted custom pickup brands and keeps Autres last', async () => {
    addCustomBrand('Aria Custom')
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()
    const options = Array.from(brandSelectOf('Neck').options).map(o => o.value)
    expect(options).toContain('Aria Custom')
    expect(options[options.length - 1]).toBe('Autres')
  })

  it('refreshes the other mic selects when a custom brand is created', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()

    fireEvent.change(brandSelectOf('Neck'), { target: { value: 'Autres' } })
    await settle()
    const input = within(positionCard('Neck')).getByPlaceholderText('Nom du fabricant...')
    fireEvent.change(input, { target: { value: 'Aria Custom' } })
    fireEvent.blur(input)
    await settle()

    const bridgeOptions = Array.from(brandSelectOf('Bridge').options).map(o => o.value)
    expect(bridgeOptions).toContain('Aria Custom')
  })

  it('persists a custom mic brand entered through Autres when saving', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()

    fireEvent.change(brandSelectOf('Neck'), { target: { value: 'Autres' } })
    await settle()
    fireEvent.change(
      within(positionCard('Neck')).getByPlaceholderText('Nom du fabricant...'),
      { target: { value: 'Aria Custom' } },
    )

    const cordeInputs = screen.getAllByPlaceholderText('mm')
    fireEvent.change(cordeInputs[0], { target: { value: '0.3' } })
    fireEvent.change(cordeInputs[5], { target: { value: '0.2' } })

    const groupOf = (label: string) =>
      screen.getByText(label).closest('.form-group') as HTMLElement
    fireEvent.change(within(groupOf('Courbure du manche (mm)')).getByRole('spinbutton'), {
      target: { value: '0.25' },
    })
    const actions = within(groupOf('Action 12ème frette (mm)')).getAllByRole('spinbutton')
    fireEvent.change(actions[0], { target: { value: '2' } })
    fireEvent.change(actions[1], { target: { value: '1.5' } })

    const submit = screen.getByRole('button', { name: 'Enregistrer le réglage' })
    fireEvent.submit(submit.closest('form') as HTMLFormElement)
    await settle()

    expect(getCustomBrands()).toContain('Aria Custom')
  })
})

describe('ReglagesPage mic heights', () => {
  const groupOf = (label: string) =>
    screen.getByText(label).closest('.form-group') as HTMLElement

  beforeEach(() => {
    localStorage.clear()
    vi.mocked(createReglage).mockClear()
  })

  it('offers a grave and an aigu height field per micro and saves both', async () => {
    render(<ReglagesPage />)
    await screen.findByText('Nombre de micros')
    await settle()

    const neck = positionCard('Neck')
    expect(within(neck).getByText(/Côté grave/)).toBeInTheDocument()
    expect(within(neck).getByText(/Côté aigu/)).toBeInTheDocument()
    const heights = within(neck).getAllByRole('spinbutton')
    expect(heights).toHaveLength(2)
    fireEvent.change(heights[0], { target: { value: '1.2' } })
    fireEvent.change(heights[1], { target: { value: '0.9' } })

    const cordeInputs = screen.getAllByPlaceholderText('mm')
    fireEvent.change(cordeInputs[0], { target: { value: '0.3' } })
    fireEvent.change(cordeInputs[5], { target: { value: '0.2' } })

    fireEvent.change(within(groupOf('Courbure du manche (mm)')).getByRole('spinbutton'), {
      target: { value: '0.25' },
    })
    const actions = within(groupOf('Action 12ème frette (mm)')).getAllByRole('spinbutton')
    fireEvent.change(actions[0], { target: { value: '2' } })
    fireEvent.change(actions[1], { target: { value: '1.5' } })

    const submit = screen.getByRole('button', { name: 'Enregistrer le réglage' })
    fireEvent.submit(submit.closest('form') as HTMLFormElement)
    await settle()

    const micros = vi.mocked(createReglage).mock.calls[0][1] as unknown as Record<string, unknown>[]
    expect(micros[0]).toMatchObject({ position: 'neck', hauteurBass: 1.2, hauteurTreble: 0.9 })
  })
})
