import { APP_LIMITS } from '../constants/limits'
import { DATA_SCHEMA_VERSION } from '../constants/storage'
import type { DiceCombo, DiceModifier, DiceSet, LockedDiceCounting, SymbolDieDefinition } from '../types/dice'
import type { DiceGroup, GroupSource } from '../types/groups'
import type { StoredUserGroupsData } from '../types/storage'
import { normalizeDiceModifier, isValidDiceModifier } from '../utils/modifierUtils'
import { MAX_SYMBOL_FACES_PER_DIE, normalizeSymbolDice } from '../utils/symbolDiceUtils'
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

  const symbolDiceCount = Array.isArray(value.symbolDice) ? value.symbolDice.length : 0
  const numericDiceCount = typeof value.diceCount === 'number' ? value.diceCount : NaN

  if (!isIntegerInRange(value.diceCount, 0, APP_LIMITS.maxDicePerSet)) {
    issues.push({
      path: `${path}.diceCount`,
      message: `Numeric dice count must be an integer between 0 and ${APP_LIMITS.maxDicePerSet}.`,
    })
  }

  if (numericDiceCount > 0 && !isIntegerInRange(value.sides, APP_LIMITS.minSidesPerDie, APP_LIMITS.maxSidesPerDie)) {
    issues.push({
      path: `${path}.sides`,
      message: `Sides must be an integer between ${APP_LIMITS.minSidesPerDie} and ${APP_LIMITS.maxSidesPerDie}.`,
    })
  }

  if (
    Number.isInteger(numericDiceCount) &&
    symbolDiceCount + numericDiceCount < 1
  ) {
    issues.push({ path, message: 'A set must contain at least one die.' })
  }

  if (
    Number.isInteger(numericDiceCount) &&
    symbolDiceCount + numericDiceCount > APP_LIMITS.maxDicePerSet
  ) {
    issues.push({
      path,
      message: `A set cannot contain more than ${APP_LIMITS.maxDicePerSet} total dice.`,
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

  if (
    value.modifier !== undefined &&
    typeof value.modifier !== 'number' &&
    !isValidDiceModifier(value.modifier)
  ) {
    issues.push(...validateDiceModifier(value.modifier, `${path}.modifier`).issues)
  }

  if (value.symbolDice !== undefined) {
    issues.push(...validateSymbolDice(value.symbolDice, `${path}.symbolDice`).issues)
  }

  return createValidationResult(issues)
}

export function validateSymbolDice(value: unknown, path = 'symbolDice'): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!Array.isArray(value)) {
    return createValidationResult([{ path, message: 'Symbol dice must be an array.' }])
  }

  value.forEach((die, index) => {
    const diePath = `${path}[${index}]`
    if (!isRecord(die)) {
      issues.push({ path: diePath, message: 'Symbol die must be an object.' })
      return
    }

    addNonEmptyStringIssue(issues, die.id, `${diePath}.id`, 'Symbol die ID is required.')

    if (!Array.isArray(die.faces)) {
      issues.push({ path: `${diePath}.faces`, message: 'Symbol die faces must be an array.' })
      return
    }

    if (die.faces.length < 2 || die.faces.length > MAX_SYMBOL_FACES_PER_DIE) {
      issues.push({
        path: `${diePath}.faces`,
        message: `Symbol dice need 2 to ${MAX_SYMBOL_FACES_PER_DIE} faces.`,
      })
    }

    die.faces.forEach((face, faceIndex) => {
      issues.push(...validateSymbolFace(face, `${diePath}.faces[${faceIndex}]`).issues)
    })
  })

  return createValidationResult(issues)
}

function validateSymbolFace(value: unknown, path: string): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([{ path, message: 'Symbol face must be an object.' }])
  }

  if (value.type === 'icon') {
    addNonEmptyStringIssue(issues, value.symbol, `${path}.symbol`, 'Icon symbol is required.')
    addNonEmptyStringIssue(issues, value.label, `${path}.label`, 'Icon label is required.')
  } else if (value.type === 'letter') {
    if (typeof value.value !== 'string' || !/^[A-ZÄÖÜß]$/.test(value.value)) {
      issues.push({ path: `${path}.value`, message: 'Letter face must be one supported letter.' })
    }
  } else if (value.type === 'number') {
    if (!isIntegerInRange(value.value, 0, 100)) {
      issues.push({ path: `${path}.value`, message: 'Number face must be 0 to 100.' })
    }
    if (typeof value.countsTowardTotal !== 'boolean') {
      issues.push({ path: `${path}.countsTowardTotal`, message: 'Number face count flag is required.' })
    }
  } else if (value.type === 'color') {
    addNonEmptyStringIssue(issues, value.value, `${path}.value`, 'Color value is required.')
    addNonEmptyStringIssue(issues, value.label, `${path}.label`, 'Color label is required.')
  } else {
    issues.push({ path: `${path}.type`, message: 'Symbol face type is not supported.' })
  }

  return createValidationResult(issues)
}

export function validateDiceModifier(
  value: unknown,
  path = 'modifier',
): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([{ path, message: 'Modifier must be an object.' }])
  }

  if (typeof value.enabled !== 'boolean') {
    issues.push({ path: `${path}.enabled`, message: 'Modifier enabled flag is required.' })
  }

  if (!isOneOf(value.operator, ['add', 'subtract', 'multiply', 'divide'] as const)) {
    issues.push({ path: `${path}.operator`, message: 'Modifier operator is not supported.' })
  }

  if (!isIntegerInRange(value.value, 1, 100)) {
    issues.push({ path: `${path}.value`, message: 'Modifier value must be an integer from 1 to 100.' })
  }

  if (!isOneOf(value.application, ['each-die', 'set-total'] as const)) {
    issues.push({
      path: `${path}.application`,
      message: 'Modifier application is not supported.',
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
    groups: groups
      .map(normalizeDiceGroup)
      .filter((group): group is DiceGroup => group !== null),
  }
}

export function normalizeDiceSet(value: DiceSet): DiceSet
export function normalizeDiceSet(value: unknown): DiceSet | null
export function normalizeDiceSet(value: unknown): DiceSet | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: typeof value.id === 'string' ? value.id : '',
    name: typeof value.name === 'string' ? value.name : '',
    diceCount: typeof value.diceCount === 'number' ? value.diceCount : 1,
    sides: typeof value.sides === 'number' ? value.sides : APP_LIMITS.minSidesPerDie,
    diceColor: typeof value.diceColor === 'string' ? value.diceColor : '',
    pipColor: typeof value.pipColor === 'string' ? value.pipColor : '',
    modifier: normalizeDiceModifier(value.modifier) as DiceModifier,
    symbolDice: normalizeSymbolDice(value.symbolDice) as SymbolDieDefinition[],
  }
}

export function normalizeDiceGroup(value: DiceGroup): DiceGroup
export function normalizeDiceGroup(value: unknown): DiceGroup | null
export function normalizeDiceGroup(value: unknown): DiceGroup | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: typeof value.id === 'string' ? value.id : '',
    name: typeof value.name === 'string' ? value.name : '',
    source: isOneOf(value.source, VALID_GROUP_SOURCES) ? value.source : 'user',
    lockedDiceCounting: isOneOf(value.lockedDiceCounting, VALID_LOCKED_DICE_COUNTING)
      ? value.lockedDiceCounting
      : 'exclude',
    sets: Array.isArray(value.sets)
      ? value.sets
          .map(normalizeDiceSet)
          .filter((set): set is DiceSet => set !== null)
      : [],
    combos: Array.isArray(value.combos)
      ? value.combos
          .filter(isRecord)
          .map((combo): DiceCombo => ({
            id: typeof combo.id === 'string' ? combo.id : '',
            name: typeof combo.name === 'string' ? combo.name : '',
            color: typeof combo.color === 'string' ? combo.color : '',
            setIds: Array.isArray(combo.setIds)
              ? combo.setIds.filter((setId): setId is string => typeof setId === 'string')
              : [],
          }))
      : [],
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
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
