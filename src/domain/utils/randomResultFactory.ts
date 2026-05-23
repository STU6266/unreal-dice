import type {
  CoinFlipHistoryEntry,
  CoinFlipResult,
  RandomNumberHistoryEntry,
} from '../types/random'

export const RANDOM_NUMBER_LIMITS = {
  min: 2,
  max: 100,
} as const

export function createCoinFlipResult(
  random: () => number = Math.random,
): CoinFlipResult {
  return random() < 0.5 ? 'Heads' : 'Tails'
}

export function createRandomNumberResult(
  max: number,
  random: () => number = Math.random,
): number {
  assertValidRandomMax(max)
  return Math.floor(random() * max) + 1
}

export function createCoinFlipHistoryEntry(
  result: CoinFlipResult,
  idFactory: () => string = createRandomId,
  now: () => string = () => new Date().toISOString(),
): CoinFlipHistoryEntry {
  return {
    id: idFactory(),
    result,
    createdAt: now(),
  }
}

export function createRandomNumberHistoryEntry(
  result: number,
  max: number,
  idFactory: () => string = createRandomId,
  now: () => string = () => new Date().toISOString(),
): RandomNumberHistoryEntry {
  assertValidRandomMax(max)

  if (!Number.isInteger(result) || result < 1 || result > max) {
    throw new RangeError(`Random result must be an integer from 1 to ${max}.`)
  }

  return {
    id: idFactory(),
    result,
    min: 1,
    max,
    createdAt: now(),
  }
}

export function isValidRandomMax(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= RANDOM_NUMBER_LIMITS.min &&
    value <= RANDOM_NUMBER_LIMITS.max
  )
}

function assertValidRandomMax(max: number): void {
  if (!isValidRandomMax(max)) {
    throw new RangeError(
      `Maximum number must be an integer from ${RANDOM_NUMBER_LIMITS.min} to ${RANDOM_NUMBER_LIMITS.max}.`,
    )
  }
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
