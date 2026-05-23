import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../domain/constants/storage'
import type {
  CoinFlipHistoryEntry,
  RandomNumberHistoryEntry,
} from '../domain/types/random'
import {
  addCoinFlipHistoryEntry,
  clearCoinFlipHistory,
  clearRandomNumberHistory,
  loadCoinFlipHistory,
  loadRandomNumberHistory,
  saveCoinFlipHistory,
  saveRandomNumberHistory,
} from '../services/randomHistoryService'
import type { UserGroupsStorage } from '../services/storageService'

class InMemoryStorage implements UserGroupsStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

function createCoinEntry(index: number): CoinFlipHistoryEntry {
  return {
    id: `coin-${index}`,
    result: index % 2 === 0 ? 'Heads' : 'Tails',
    createdAt: '2026-05-23T10:00:00.000Z',
  }
}

function createRandomEntry(index: number): RandomNumberHistoryEntry {
  return {
    id: `random-${index}`,
    result: index,
    min: 1,
    max: 100,
    createdAt: '2026-05-23T10:00:00.000Z',
  }
}

describe('randomHistoryService', () => {
  it('coin history stores and loads entries', () => {
    const storage = new InMemoryStorage()
    const entry = createCoinEntry(1)

    saveCoinFlipHistory([entry], storage)

    expect(loadCoinFlipHistory(storage)).toEqual([entry])
  })

  it('random number history stores and loads entries', () => {
    const storage = new InMemoryStorage()
    const entry = createRandomEntry(17)

    saveRandomNumberHistory([entry], storage)

    expect(loadRandomNumberHistory(storage)).toEqual([entry])
  })

  it('each history is limited to the latest 20 entries', () => {
    const storage = new InMemoryStorage()
    Array.from({ length: 25 }, (_, index) => createCoinEntry(index)).forEach(
      (entry) => addCoinFlipHistoryEntry(entry, storage),
    )

    expect(loadCoinFlipHistory(storage)).toHaveLength(20)
    expect(loadCoinFlipHistory(storage)[0]?.id).toBe('coin-24')
  })

  it('histories remain separate', () => {
    const storage = new InMemoryStorage()
    saveCoinFlipHistory([createCoinEntry(1)], storage)
    saveRandomNumberHistory([createRandomEntry(2)], storage)

    expect(loadCoinFlipHistory(storage)).toHaveLength(1)
    expect(loadRandomNumberHistory(storage)).toHaveLength(1)
  })

  it('invalid stored JSON returns an empty history', () => {
    const storage = new InMemoryStorage()
    storage.setItem(STORAGE_KEYS.coinFlipHistory, '{broken')

    expect(loadCoinFlipHistory(storage)).toEqual([])
  })

  it('clearing coin history does not remove random history', () => {
    const storage = new InMemoryStorage()
    saveCoinFlipHistory([createCoinEntry(1)], storage)
    saveRandomNumberHistory([createRandomEntry(2)], storage)

    clearCoinFlipHistory(storage)

    expect(loadCoinFlipHistory(storage)).toEqual([])
    expect(loadRandomNumberHistory(storage)).toHaveLength(1)
  })

  it('clearing random history does not remove coin history', () => {
    const storage = new InMemoryStorage()
    saveCoinFlipHistory([createCoinEntry(1)], storage)
    saveRandomNumberHistory([createRandomEntry(2)], storage)

    clearRandomNumberHistory(storage)

    expect(loadRandomNumberHistory(storage)).toEqual([])
    expect(loadCoinFlipHistory(storage)).toHaveLength(1)
  })
})
