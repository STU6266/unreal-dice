import { describe, expect, it } from 'vitest'
import {
  createCoinFlipResult,
  createRandomNumberResult,
} from '../domain/utils/randomResultFactory'

describe('randomResultFactory', () => {
  it('coin result is always Heads or Tails', () => {
    expect(createCoinFlipResult(() => 0)).toBe('Heads')
    expect(createCoinFlipResult(() => 0.99)).toBe('Tails')
  })

  it('random number result is always inside the inclusive range 1 through max', () => {
    expect(createRandomNumberResult(20, () => 0)).toBe(1)
    expect(createRandomNumberResult(20, () => 0.999)).toBe(20)
  })

  it('invalid maximum below 2 is rejected', () => {
    expect(() => createRandomNumberResult(1)).toThrow(RangeError)
  })

  it('invalid maximum above 100 is rejected', () => {
    expect(() => createRandomNumberResult(101)).toThrow(RangeError)
  })
})
