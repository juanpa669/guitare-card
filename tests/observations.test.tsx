import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ObservationsPage from '@/components/ObservationsPage'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getObservation: vi.fn(async () => null),
  createOrUpdateObservation: vi.fn(async () => ({ id: 'o1' })),
}))

describe('ObservationsPage multi-value placeholders', () => {
  it('asks to separate the optional fields with commas', async () => {
    render(<ObservationsPage />)
    const inputs = await screen.findAllByPlaceholderText(/virgule/i)
    expect(inputs).toHaveLength(2)
  })
})

describe('ObservationsPage spellcheck and autocorrect', () => {
  it('enables spellcheck, autocorrect and autocapitalize on text fields', async () => {
    render(<ObservationsPage />)
    const [loose] = await screen.findAllByPlaceholderText(/virgule/i)
    expect(loose).toHaveAttribute('spellcheck', 'true')
    expect(loose).toHaveAttribute('autocorrect', 'on')
    expect(loose).toHaveAttribute('autocapitalize', 'sentences')

    const textarea = screen.getByPlaceholderText(/Notes rapides/i)
    expect(textarea).toHaveAttribute('spellcheck', 'true')
    expect(textarea).toHaveAttribute('autocorrect', 'on')
    expect(textarea).toHaveAttribute('autocapitalize', 'sentences')
  })
})
