import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import MeasuresPage from '@/components/MeasuresPage'
import { getMeasureOriginal } from '@/lib/storage'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? 'inst-1' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

vi.mock('@/lib/storage', () => ({
  getMeasureOriginal: vi.fn(),
  createMeasureOriginal: vi.fn(async () => ({ id: 'm1' })),
  createTestAfterMeasure: vi.fn(async () => ({ id: 't1' })),
}))

beforeEach(() => {
  vi.mocked(getMeasureOriginal).mockResolvedValue(null as never)
})

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

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
