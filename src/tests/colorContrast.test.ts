import { describe, expect, it } from 'vitest'
import { hasReadableColorContrast } from '../domain/utils/colorContrast'

describe('colorContrast', () => {
  it('accepts readable black on white colors', () => {
    expect(hasReadableColorContrast('#000000', '#ffffff')).toBe(true)
  })

  it('warns for very low contrast colors', () => {
    expect(hasReadableColorContrast('#ffffff', '#ffffff')).toBe(false)
  })
})
