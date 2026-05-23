import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../domain/constants/storage'
import {
  addSetHistoryEntry,
  clearSetHistory,
  createSetHistoryEntry,
  loadSetHistory,
} from '../services/setHistoryService'
import type { UserGroupsStorage } from '../services/storageService'
import { createTestSet } from './testFixtures'

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

function createEntry(index: number, setId = 'set-1') {
  return createSetHistoryEntry(
    createTestSet({ id: setId, name: `Set ${setId}` }),
    [{ value: index, locked: index % 2 === 0 }],
    'exclude',
    index,
    () => `entry-${index}`,
    () => `2026-05-23T10:${String(index).padStart(2, '0')}:00.000Z`,
  )
}

describe('setHistoryService', () => {
  it('adding a history entry stores it for the correct set', () => {
    const storage = new InMemoryStorage()
    const entry = createEntry(1)

    addSetHistoryEntry(entry, storage)

    expect(loadSetHistory('set-1', storage)).toEqual([entry])
  })

  it('maximum 20 history rows per set is enforced', () => {
    const storage = new InMemoryStorage()

    Array.from({ length: 25 }, (_, index) => createEntry(index)).forEach((entry) =>
      addSetHistoryEntry(entry, storage),
    )

    expect(loadSetHistory('set-1', storage)).toHaveLength(20)
  })

  it('newest history entry is first', () => {
    const storage = new InMemoryStorage()

    addSetHistoryEntry(createEntry(1), storage)
    addSetHistoryEntry(createEntry(2), storage)

    expect(loadSetHistory('set-1', storage)[0]?.id).toBe('entry-2')
  })

  it('clearing one set history does not clear another set history', () => {
    const storage = new InMemoryStorage()

    addSetHistoryEntry(createEntry(1, 'set-1'), storage)
    addSetHistoryEntry(createEntry(2, 'set-2'), storage)
    clearSetHistory('set-1', storage)

    expect(loadSetHistory('set-1', storage)).toEqual([])
    expect(loadSetHistory('set-2', storage)).toHaveLength(1)
  })

  it('invalid stored history safely returns empty data', () => {
    const storage = new InMemoryStorage()
    storage.setItem(STORAGE_KEYS.setHistory, '{broken')

    expect(loadSetHistory('set-1', storage)).toEqual([])
  })

  it('history entry preserves locked die flags, locked counting, and total', () => {
    const entry = createSetHistoryEntry(
      createTestSet({ id: 'set-1' }),
      [{ value: 6, locked: true }],
      'include',
      6,
      () => 'entry-1',
      () => '2026-05-23T10:00:00.000Z',
    )

    expect(entry.diceResults[0]?.locked).toBe(true)
    expect(entry.lockedDiceCounting).toBe('include')
    expect(entry.total).toBe(6)
  })
})
