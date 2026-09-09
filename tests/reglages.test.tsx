import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, act } from '@testing-library/react'
import ReglagesPage from '@/components/ReglagesPage'

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
