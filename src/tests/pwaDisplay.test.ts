import { describe, expect, it } from 'vitest'
import { isStandaloneDisplay } from '../utils/pwaDisplay'

describe('pwaDisplay', () => {
  it('detects standalone display from media query', () => {
    expect(isStandaloneDisplay(true, false)).toBe(true)
  })

  it('detects iOS standalone display from navigator flag', () => {
    expect(isStandaloneDisplay(false, true)).toBe(true)
  })

  it('returns false when no standalone signals are present', () => {
    expect(isStandaloneDisplay(false, undefined)).toBe(false)
  })
})
