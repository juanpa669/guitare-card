import { describe, it, expect } from 'vitest'
import { getMicrophonePositions } from '@/lib/microphones'

describe('getMicrophonePositions', () => {
  it('returns no position for a mic-less instrument', () => {
    expect(getMicrophonePositions(0)).toEqual([])
    expect(getMicrophonePositions(-1)).toEqual([])
  })

  it('uses the chosen position for a single mic and defaults to neck', () => {
    expect(getMicrophonePositions(1)).toEqual(['neck'])
    expect(getMicrophonePositions(1, 'bridge')).toEqual(['bridge'])
  })

  it('returns neck and bridge for two mics regardless of the single position', () => {
    expect(getMicrophonePositions(2, 'bridge')).toEqual(['neck', 'bridge'])
  })

  it('returns neck, middle and bridge for three mics or more', () => {
    expect(getMicrophonePositions(3)).toEqual(['neck', 'middle', 'bridge'])
    expect(getMicrophonePositions(4)).toEqual(['neck', 'middle', 'bridge'])
  })
})
