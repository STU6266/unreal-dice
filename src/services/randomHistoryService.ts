import { STORAGE_KEYS } from '../domain/constants/storage'
import type {
  CoinFlipHistoryEntry,
  RandomNumberHistoryEntry,
} from '../domain/types/random'
import type { UserGroupsStorage } from './storageService'

const MAX_RANDOM_HISTORY_ENTRIES = 20

// I store coin flips and random numbers separately because they answer different
// questions, and clearing one history should never erase the other by surprise.
export function loadCoinFlipHistory(
  storage: UserGroupsStorage = window.localStorage,
): CoinFlipHistoryEntry[] {
  return loadHistory(storage, STORAGE_KEYS.coinFlipHistory, isCoinFlipHistoryEntry)
}

export function saveCoinFlipHistory(
  entries: readonly CoinFlipHistoryEntry[],
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.setItem(
    STORAGE_KEYS.coinFlipHistory,
    JSON.stringify(entries.slice(0, MAX_RANDOM_HISTORY_ENTRIES)),
  )
}

export function addCoinFlipHistoryEntry(
  entry: CoinFlipHistoryEntry,
  storage: UserGroupsStorage = window.localStorage,
): CoinFlipHistoryEntry[] {
  const entries = [entry, ...loadCoinFlipHistory(storage)].slice(
    0,
    MAX_RANDOM_HISTORY_ENTRIES,
  )
  saveCoinFlipHistory(entries, storage)
  return entries
}

export function clearCoinFlipHistory(
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.removeItem(STORAGE_KEYS.coinFlipHistory)
}

export function loadRandomNumberHistory(
  storage: UserGroupsStorage = window.localStorage,
): RandomNumberHistoryEntry[] {
  return loadHistory(
    storage,
    STORAGE_KEYS.randomNumberHistory,
    isRandomNumberHistoryEntry,
  )
}

export function saveRandomNumberHistory(
  entries: readonly RandomNumberHistoryEntry[],
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.setItem(
    STORAGE_KEYS.randomNumberHistory,
    JSON.stringify(entries.slice(0, MAX_RANDOM_HISTORY_ENTRIES)),
  )
}

export function addRandomNumberHistoryEntry(
  entry: RandomNumberHistoryEntry,
  storage: UserGroupsStorage = window.localStorage,
): RandomNumberHistoryEntry[] {
  const entries = [entry, ...loadRandomNumberHistory(storage)].slice(
    0,
    MAX_RANDOM_HISTORY_ENTRIES,
  )
  saveRandomNumberHistory(entries, storage)
  return entries
}

export function clearRandomNumberHistory(
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.removeItem(STORAGE_KEYS.randomNumberHistory)
}

function loadHistory<Entry>(
  storage: UserGroupsStorage,
  key: string,
  isEntry: (value: unknown) => value is Entry,
): Entry[] {
  const rawValue = storage.getItem(key)

  if (rawValue === null) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isEntry).slice(0, MAX_RANDOM_HISTORY_ENTRIES)
  } catch {
    return []
  }
}

function isCoinFlipHistoryEntry(value: unknown): value is CoinFlipHistoryEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    (value.result === 'Heads' || value.result === 'Tails') &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt))
  )
}

function isRandomNumberHistoryEntry(
  value: unknown,
): value is RandomNumberHistoryEntry {
  if (!isRecord(value)) {
    return false
  }

  const result = value.result
  const max = value.max

  return (
    typeof value.id === 'string' &&
    Number.isInteger(result) &&
    value.min === 1 &&
    Number.isInteger(max) &&
    typeof result === 'number' &&
    typeof max === 'number' &&
    result >= 1 &&
    result <= max &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt))
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
