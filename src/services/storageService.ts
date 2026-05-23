import { STORAGE_KEYS } from '../domain/constants/storage'
import type { DiceGroup } from '../domain/types/groups'
import {
  createStoredUserGroupsData,
  validateStoredUserGroupsData,
} from '../domain/validation/validators'

export interface UserGroupsStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageValidationError'
  }
}

// I keep browser persistence behind this service so the application can later
// move to IndexedDB or native mobile storage without changing feature screens.
export function loadUserGroups(
  storage: UserGroupsStorage = window.localStorage,
): DiceGroup[] {
  const rawValue = storage.getItem(STORAGE_KEYS.userGroups)

  if (rawValue === null) {
    return []
  }

  const parsedValue = parseStoredValue(rawValue)
  if (parsedValue === null) {
    return []
  }

  const validation = validateStoredUserGroupsData(parsedValue)
  if (!validation.isValid || !isStoredUserGroupsData(parsedValue)) {
    return []
  }

  return parsedValue.groups
}

export function saveUserGroups(
  groups: DiceGroup[],
  storage: UserGroupsStorage = window.localStorage,
): void {
  const data = createStoredUserGroupsData(groups)
  const validation = validateStoredUserGroupsData(data)

  if (!validation.isValid) {
    const messages = validation.issues
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join('; ')
    throw new StorageValidationError(`Cannot save invalid user groups. ${messages}`)
  }

  storage.setItem(STORAGE_KEYS.userGroups, JSON.stringify(data))
}

export function clearUserGroups(
  storage: UserGroupsStorage = window.localStorage,
): void {
  storage.removeItem(STORAGE_KEYS.userGroups)
}

function parseStoredValue(rawValue: string): unknown | null {
  try {
    return JSON.parse(rawValue) as unknown
  } catch {
    return null
  }
}

function isStoredUserGroupsData(
  value: unknown,
): value is ReturnType<typeof createStoredUserGroupsData> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    'groups' in value &&
    Array.isArray(value.groups)
  )
}
