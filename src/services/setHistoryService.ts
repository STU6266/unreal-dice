import { APP_LIMITS } from '../domain/constants/limits'
import { STORAGE_KEYS } from '../domain/constants/storage'
import type { LockedDiceCounting } from '../domain/types/dice'
import type { DiceSet } from '../domain/types/dice'
import type { IndividualDieResult, SetHistoryEntry } from '../domain/types/history'
import { normalizeDieMode, normalizeDiceModifier } from '../domain/utils/modifierUtils'
import type { UserGroupsStorage } from './storageService'

type StoredSetHistories = Record<string, SetHistoryEntry[]>

// I store roll history snapshots separately from editable set definitions so
// old results stay understandable even after a set is renamed or recolored.
export function loadSetHistory(
  setId: string,
  storage: UserGroupsStorage = window.localStorage,
): SetHistoryEntry[] {
  return loadAllSetHistories(storage)[setId] ?? []
}

export function addSetHistoryEntry(
  entry: SetHistoryEntry,
  storage: UserGroupsStorage = window.localStorage,
): SetHistoryEntry[] {
  const histories = loadAllSetHistories(storage)
  const entries = [entry, ...(histories[entry.setId] ?? [])].slice(
    0,
    APP_LIMITS.maxHistoryEntriesPerSet,
  )

  histories[entry.setId] = entries
  saveAllSetHistories(enforceGlobalCap(histories), storage)
  return entries
}

export function clearSetHistory(
  setId: string,
  storage: UserGroupsStorage = window.localStorage,
): void {
  const histories = loadAllSetHistories(storage)
  delete histories[setId]
  saveAllSetHistories(histories, storage)
}

export function createSetHistoryEntry(
  set: DiceSet,
  diceResults: readonly IndividualDieResult[],
  lockedDiceCounting: LockedDiceCounting,
  total: number,
  idFactory: () => string = createRandomId,
  now: () => string = () => new Date().toISOString(),
  setModifierActive = set.modifier.enabled && set.modifier.application === 'set-total',
): SetHistoryEntry {
  return {
    id: idFactory(),
    setId: set.id,
    setName: set.name,
    diceCount: set.diceCount,
    sides: set.sides,
    diceResults: diceResults.map((die) => ({ ...die })),
    modifier: normalizeDiceModifier(set.modifier),
    setModifierActive,
    lockedDiceCounting,
    total,
    rolledAt: now(),
  }
}

function loadAllSetHistories(
  storage: UserGroupsStorage = window.localStorage,
): StoredSetHistories {
  const rawValue = storage.getItem(STORAGE_KEYS.setHistory)

  if (rawValue === null) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!isRecord(parsedValue)) {
      return {}
    }

    const histories: StoredSetHistories = {}
    Object.entries(parsedValue).forEach(([setId, entries]) => {
      if (!Array.isArray(entries)) {
        return
      }

      const validEntries = entries
        .map(normalizeSetHistoryEntry)
        .filter((entry): entry is SetHistoryEntry => entry !== null)
        .slice(0, APP_LIMITS.maxHistoryEntriesPerSet)

      if (validEntries.length > 0) {
        histories[setId] = validEntries
      }
    })

    return histories
  } catch {
    return {}
  }
}

function saveAllSetHistories(
  histories: StoredSetHistories,
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.setItem(STORAGE_KEYS.setHistory, JSON.stringify(histories))
}

function enforceGlobalCap(histories: StoredSetHistories): StoredSetHistories {
  const allEntries = Object.values(histories)
    .flat()
    .sort((left, right) => Date.parse(right.rolledAt) - Date.parse(left.rolledAt))

  const allowedIds = new Set(
    allEntries.slice(0, APP_LIMITS.globalHistorySafetyCap).map((entry) => entry.id),
  )

  return Object.fromEntries(
    Object.entries(histories)
      .map(([setId, entries]) => [
        setId,
        entries.filter((entry) => allowedIds.has(entry.id)),
      ])
      .filter(([, entries]) => entries.length > 0),
  )
}

function normalizeSetHistoryEntry(value: unknown): SetHistoryEntry | null {
  if (!(
      isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.setId === 'string' &&
    typeof value.setName === 'string' &&
    Number.isInteger(value.diceCount) &&
    Number.isInteger(value.sides) &&
    Array.isArray(value.diceResults) &&
    (value.lockedDiceCounting === 'include' || value.lockedDiceCounting === 'exclude') &&
    typeof value.total === 'number' &&
    typeof value.rolledAt === 'string' &&
    !Number.isNaN(Date.parse(value.rolledAt))
  )) {
    return null
  }

  return {
    id: value.id,
    setId: value.setId,
    setName: value.setName,
    diceCount: Number(value.diceCount),
    sides: Number(value.sides),
    diceResults: value.diceResults
      .map(normalizeIndividualDieResult)
      .filter((die): die is IndividualDieResult => die !== null),
    modifier: normalizeDiceModifier(value.modifier),
    setModifierActive: value.setModifierActive === true,
    lockedDiceCounting: value.lockedDiceCounting,
    total: Number(value.total),
    rolledAt: value.rolledAt,
  }
}

function normalizeIndividualDieResult(value: unknown): IndividualDieResult | null {
  if (!isRecord(value) || !Number.isInteger(value.value)) {
    return null
  }

  return {
    value: Number(value.value),
    mode: normalizeDieMode(value),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
