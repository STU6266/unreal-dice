import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../domain/constants/storage'
import { createStoredUserGroupsData } from '../domain/validation/validators'
import {
  clearUserGroups,
  loadUserGroups,
  saveUserGroups,
  StorageValidationError,
  type UserGroupsStorage,
} from '../services/storageService'
import { createTestGroup } from './testFixtures'

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

describe('storageService', () => {
  it('loads an empty array when nothing is stored', () => {
    const storage = new InMemoryStorage()

    expect(loadUserGroups(storage)).toEqual([])
  })

  it('saves and loads a valid group', () => {
    const storage = new InMemoryStorage()
    const group = createTestGroup()

    saveUserGroups([group], storage)

    expect(loadUserGroups(storage)).toEqual([group])
  })

  it('loads old stored groups without modifier data by adding a disabled modifier', () => {
    const storage = new InMemoryStorage()
    const group = createTestGroup()
    const oldGroup = {
      ...group,
      sets: group.sets.map((set) => {
        const oldSet: Partial<typeof set> = { ...set }
        delete oldSet.modifier
        return oldSet
      }),
    }

    storage.setItem(
      STORAGE_KEYS.userGroups,
      JSON.stringify(createStoredUserGroupsData([oldGroup as typeof group])),
    )

    expect(loadUserGroups(storage)[0]?.sets[0]?.modifier.enabled).toBe(false)
  })

  it('loads old stored groups without symbol dice by adding an empty symbol dice list', () => {
    const storage = new InMemoryStorage()
    const group = createTestGroup()
    const oldGroup = {
      ...group,
      sets: group.sets.map((set) => {
        const oldSet: Partial<typeof set> = { ...set }
        delete oldSet.symbolDice
        return oldSet
      }),
    }

    storage.setItem(
      STORAGE_KEYS.userGroups,
      JSON.stringify(createStoredUserGroupsData([oldGroup as typeof group])),
    )

    expect(loadUserGroups(storage)[0]?.sets[0]?.symbolDice).toEqual([])
  })

  it('returns an empty array for invalid stored JSON without crashing', () => {
    const storage = new InMemoryStorage()
    storage.setItem(STORAGE_KEYS.userGroups, '{broken json')

    expect(loadUserGroups(storage)).toEqual([])
  })

  it('returns an empty array for invalid stored group data', () => {
    const storage = new InMemoryStorage()
    storage.setItem(
      STORAGE_KEYS.userGroups,
      JSON.stringify(createStoredUserGroupsData([createTestGroup({ sets: [] })])),
    )

    expect(loadUserGroups(storage)).toEqual([])
  })

  it('rejects saving invalid groups and does not write bad data', () => {
    const storage = new InMemoryStorage()

    expect(() => saveUserGroups([createTestGroup({ sets: [] })], storage)).toThrow(
      StorageValidationError,
    )
    expect(storage.getItem(STORAGE_KEYS.userGroups)).toBeNull()
  })

  it('clears only the user groups key', () => {
    const storage = new InMemoryStorage()
    storage.setItem(STORAGE_KEYS.userGroups, 'saved groups')
    storage.setItem(STORAGE_KEYS.userPreferences, 'preferences')

    clearUserGroups(storage)

    expect(storage.getItem(STORAGE_KEYS.userGroups)).toBeNull()
    expect(storage.getItem(STORAGE_KEYS.userPreferences)).toBe('preferences')
  })
})
