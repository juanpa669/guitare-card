import { describe, it, expect, vi } from 'vitest'
import { shouldBlockEnterKey, handleFormKeyDown } from '@/lib/form'

describe('shouldBlockEnterKey', () => {
  it('blocks Enter on a text input (implicit submit)', () => {
    expect(shouldBlockEnterKey('INPUT', 'Enter')).toBe(true)
  })

  it('does not block other keys on an input', () => {
    expect(shouldBlockEnterKey('INPUT', 'a')).toBe(false)
  })

  it('does not block Enter on a textarea (newline)', () => {
    expect(shouldBlockEnterKey('TEXTAREA', 'Enter')).toBe(false)
  })

  it('does not block Enter on a select', () => {
    expect(shouldBlockEnterKey('SELECT', 'Enter')).toBe(false)
  })

  it('does not block Enter on the submit button', () => {
    expect(shouldBlockEnterKey('BUTTON', 'Enter')).toBe(false)
  })

  it('handles missing target safely', () => {
    expect(shouldBlockEnterKey(null, 'Enter')).toBe(false)
    expect(shouldBlockEnterKey(undefined, 'Enter')).toBe(false)
  })
})

describe('handleFormKeyDown', () => {
  const makeEvent = (tagName: string | null, key: string) => ({
    key,
    target: tagName ? { tagName } : null,
    preventDefault: vi.fn(),
  })

  it('prevents default when Enter pressed in an input', () => {
    const e = makeEvent('INPUT', 'Enter')
    handleFormKeyDown(e as never)
    expect(e.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('does not prevent default for other keys', () => {
    const e = makeEvent('INPUT', 'x')
    handleFormKeyDown(e as never)
    expect(e.preventDefault).not.toHaveBeenCalled()
  })

  it('does not prevent default for Enter on a textarea', () => {
    const e = makeEvent('TEXTAREA', 'Enter')
    handleFormKeyDown(e as never)
    expect(e.preventDefault).not.toHaveBeenCalled()
  })

  it('does not prevent default without a target', () => {
    const e = makeEvent(null, 'Enter')
    handleFormKeyDown(e as never)
    expect(e.preventDefault).not.toHaveBeenCalled()
  })
})
