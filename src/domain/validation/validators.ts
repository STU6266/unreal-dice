import { APP_LIMITS } from '../constants/limits'
import { DATA_SCHEMA_VERSION } from '../constants/storage'
import type { LockedDiceCounting } from '../types/dice'
import type { DiceGroup, GroupSource } from '../types/groups'
import type { StoredUserGroupsData } from '../types/storage'
import {
  createValidationResult,
  type ValidationIssue,
  type ValidationResult,
} from './validationTypes'

const VALID_GROUP_SOURCES = [
  'user',
  'quick-start',
  'quick-start-copy',
  'imported',
] as const satisfies readonly GroupSource[]

const EDITABLE_GROUP_SOURCES = [
  'user',
  'quick-start-copy',
  'imported',
] as const satisfies readonly GroupSource[]

const VALID_LOCKED_DICE_COUNTING = [
  'exclude',
  'include',
] as const satisfies readonly LockedDiceCounting[]

export function validateDiceSet(
  value: unknown,
  path = 'set',
): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([
      { path, message: 'Set must be an object.' },
    ])
  }

  addNonEmptyStringIssue(issues, value.id, `${path}.id`, 'Set ID is required.')

  if (typeof value.name !== 'string') {
    issues.push({ path: `${path}.name`, message: 'Set name must be a string.' })
  }

  if (!isIntegerInRange(value.diceCount, 1, APP_LIMITS.maxDicePerSet)) {
    issues.push({
      path: `${path}.diceCount`,
      message: `Dice count must be an integer between 1 and ${APP_LIMITS.maxDicePerSet}.`,
    })
  }

  if (
    !isIntegerInRange(
      value.sides,
      APP_LIMITS.minSidesPerDie,
      APP_LIMITS.maxSidesPerDie,
    )
  ) {
    issues.push({
      path: `${path}.sides`,
      message: `Sides must be an integer between ${APP_LIMITS.minSidesPerDie} and ${APP_LIMITS.maxSidesPerDie}.`,
    })
  }

  addNonEmptyStringIssue(
    issues,
    value.diceColor,
    `${path}.diceColor`,
    'Dice color is required.',
  )
  addNonEmptyStringIssue(
    issues,
    value.pipColor,
    `${path}.pipColor`,
    'Pip color is required.',
  )

  if (typeof value.modifier !== 'number' || !Number.isFinite(value.modifier)) {
    issues.push({
      path: `${path}.modifier`,
      message: 'Modifier must be a finite number.',
    })
  } else if (value.modifier !== 0) {
    issues.push({
      path: `${path}.modifier`,
      message: 'Modifier must remain 0 in Version 1 data.',
    })
  }

  return createValidationResult(issues)
}

export function validateDiceCombo(
  value: unknown,
  parentSetIds: ReadonlySet<string>,
  path = 'combo',
): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([
      { path, message: 'Combo must be an object.' },
    ])
  }

  addNonEmptyStringIssue(issues, value.id, `${path}.id`, 'Combo ID is required.')
  addNonEmptyStringIssue(
    issues,
    value.name,
    `${path}.name`,
    'Combo name is required.',
  )
  addNonEmptyStringIssue(
    issues,
    value.color,
    `${path}.color`,
    'Combo color is required.',
  )

  if (!Array.isArray(value.setIds)) {
    issues.push({
      path: `${path}.setIds`,
      message: 'Combo set IDs must be an array.',
    })
    return createValidationResult(issues)
  }

  if (value.setIds.length === 0) {
    issues.push({
      path: `${path}.setIds`,
      message: 'Combo must reference at least one set.',
    })
  }

  if (value.setIds.length > APP_LIMITS.maxSetsPerCombo) {
    issues.push({
      path: `${path}.setIds`,
      message: `Combo cannot contain more than ${APP_LIMITS.maxSetsPerCombo} sets.`,
    })
  }

  const seenSetIds = new Set<string>()
  value.setIds.forEach((setId, index) => {
    const setPath = `${path}.setIds[${index}]`
    if (typeof setId !== 'string' || setId.trim() === '') {
      issues.push({ path: setPath, message: 'Combo set ID is required.' })
      return
    }

    if (seenSetIds.has(setId)) {
      issues.push({
        path: setPath,
        message: 'Combo cannot reference the same set more than once.',
      })
    }
    seenSetIds.add(setId)

    if (!parentSetIds.has(setId)) {
      issues.push({
        path: setPath,
        message: 'Combo references a missing set.',
      })
    }
  })

  return createValidationResult(issues)
}

export function validateDiceGroup(
  value: unknown,
  path = 'group',
): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([
      { path, message: 'Group must be an object.' },
    ])
  }

  addNonEmptyStringIssue(
    issues,
    value.id,
    `${path}.id`,
    'Group ID is required.',
  )
  addNonEmptyStringIssue(
    issues,
    value.name,
    `${path}.name`,
    'Group name is required.',
  )

  if (!isOneOf(value.source, VALID_GROUP_SOURCES)) {
    issues.push({
      path: `${path}.source`,
      message: 'Group source is not supported.',
    })
  }

  if (!isOneOf(value.lockedDiceCounting, VALID_LOCKED_DICE_COUNTING)) {
    issues.push({
      path: `${path}.lockedDiceCounting`,
      message: 'Locked dice counting value is not supported.',
    })
  }

  addIsoTimestampIssue(issues, value.createdAt, `${path}.createdAt`)
  addIsoTimestampIssue(issues, value.updatedAt, `${path}.updatedAt`)

  if (!Array.isArray(value.sets)) {
    issues.push({ path: `${path}.sets`, message: 'Group sets must be an array.' })
  } else {
    validateSets(value.sets, `${path}.sets`, issues)
  }

  const setIds = Array.isArray(value.sets)
    ? new Set(
        value.sets
          .filter(isRecord)
          .map((set) => set.id)
          .filter((id): id is string => typeof id === 'string'),
      )
    : new Set<string>()

  if (!Array.isArray(value.combos)) {
    issues.push({
      path: `${path}.combos`,
      message: 'Group combos must be an array.',
    })
  } else {
    validateCombos(value.combos, setIds, `${path}.combos`, issues)
  }

  return createValidationResult(issues)
}

export function validateStoredUserGroupsData(
  value: unknown,
  path = 'storedUserGroups',
): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([
      { path, message: 'Stored user groups data must be an object.' },
    ])
  }

  if (value.schemaVersion !== DATA_SCHEMA_VERSION) {
    issues.push({
      path: `${path}.schemaVersion`,
      message: 'Stored data schema version is not supported.',
    })
  }

  if (!Array.isArray(value.groups)) {
    issues.push({
      path: `${path}.groups`,
      message: 'Stored groups must be an array.',
    })
    return createValidationResult(issues)
  }

  if (value.groups.length > APP_LIMITS.maxUserGroups) {
    issues.push({
      path: `${path}.groups`,
      message: `Cannot store more than ${APP_LIMITS.maxUserGroups} user groups.`,
    })
  }

  const groupIds = new Set<string>()
  value.groups.forEach((group, index) => {
    const groupPath = `${path}.groups[${index}]`

    if (isRecord(group)) {
      if (!isOneOf(group.source, EDITABLE_GROUP_SOURCES)) {
        issues.push({
          path: `${groupPath}.source`,
          message: 'Persisted user groups cannot use quick-start source.',
        })
      }

      if (typeof group.id === 'string') {
        if (groupIds.has(group.id)) {
          issues.push({
            path: `${groupPath}.id`,
            message: 'Group ID must be unique.',
          })
        }
        groupIds.add(group.id)
      }
    }

    issues.push(...validateDiceGroup(group, groupPath).issues)
  })

  return createValidationResult(issues)
}

export function createStoredUserGroupsData(
  groups: DiceGroup[],
): StoredUserGroupsData {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    groups,
  }
}

function validateSets(
  sets: unknown[],
  path: string,
  issues: ValidationIssue[],
): void {
  if (sets.length === 0) {
    issues.push({
      path,
      message: 'A saved group must contain at least one set.',
    })
  }

  if (sets.length > APP_LIMITS.maxSetsPerGroup) {
    issues.push({
      path,
      message: `Group cannot contain more than ${APP_LIMITS.maxSetsPerGroup} sets.`,
    })
  }

  const setIds = new Set<string>()
  sets.forEach((set, index) => {
    const setPath = `${path}[${index}]`
    if (isRecord(set) && typeof set.id === 'string') {
      if (setIds.has(set.id)) {
        issues.push({ path: `${setPath}.id`, message: 'Set ID must be unique.' })
      }
      setIds.add(set.id)
    }
    issues.push(...validateDiceSet(set, setPath).issues)
  })
}

function validateCombos(
  combos: unknown[],
  setIds: ReadonlySet<string>,
  path: string,
  issues: ValidationIssue[],
): void {
  if (combos.length > APP_LIMITS.maxCombosPerGroup) {
    issues.push({
      path,
      message: `Group cannot contain more than ${APP_LIMITS.maxCombosPerGroup} combos.`,
    })
  }

  const comboIds = new Set<string>()
  const comboAssignments = new Map<string, string>()

  combos.forEach((combo, index) => {
    const comboPath = `${path}[${index}]`

    if (isRecord(combo)) {
      if (typeof combo.id === 'string') {
        if (comboIds.has(combo.id)) {
          issues.push({
            path: `${comboPath}.id`,
            message: 'Combo ID must be unique.',
          })
        }
        comboIds.add(combo.id)
      }

      if (Array.isArray(combo.setIds) && typeof combo.id === 'string') {
        const comboId = combo.id
        combo.setIds.forEach((setId, setIndex) => {
          if (typeof setId !== 'string') {
            return
          }

          const assignedComboId = comboAssignments.get(setId)
          if (assignedComboId !== undefined && assignedComboId !== comboId) {
            issues.push({
              path: `${comboPath}.setIds[${setIndex}]`,
              message: 'A set can belong to only one combo.',
            })
          }
          comboAssignments.set(setId, comboId)
        })
      }
    }

    issues.push(...validateDiceCombo(combo, setIds, comboPath).issues)
  })
}

function addNonEmptyStringIssue(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
  message: string,
): void {
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push({ path, message })
  }
}

function addIsoTimestampIssue(
  issues: ValidationIssue[],
  value: unknown,
  path: string,
): void {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    issues.push({ path, message: 'Timestamp must be a valid ISO string.' })
  }
}

function isIntegerInRange(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOneOf<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): value is T {
  return typeof value === 'string' && allowedValues.includes(value as T)
}
