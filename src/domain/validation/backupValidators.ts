import { APP_LIMITS } from '../constants/limits'
import { BACKUP_APP_ID, BACKUP_VERSION } from '../constants/backup'
import type { UnrealDiceBackup } from '../types/backup'
import { validateDiceGroup } from './validators'
import {
  createValidationResult,
  type ValidationIssue,
  type ValidationResult,
} from './validationTypes'

const VALID_EXPORT_TYPES = ['single-group', 'all-groups'] as const

export function parseBackupJson(rawValue: string): ValidationResult & {
  backup?: UnrealDiceBackup
} {
  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    const validation = validateBackup(parsedValue)

    if (!validation.isValid || !isBackup(parsedValue)) {
      return validation
    }

    return { ...validation, backup: parsedValue }
  } catch {
    return createValidationResult([
      { path: 'backup', message: 'File must contain valid JSON.' },
    ])
  }
}

export function validateBackup(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = []

  if (!isRecord(value)) {
    return createValidationResult([
      { path: 'backup', message: 'Backup must be an object.' },
    ])
  }

  if (value.app !== BACKUP_APP_ID) {
    issues.push({
      path: 'backup.app',
      message: 'This is not an unrealDice backup file.',
    })
  }

  if (value.backupVersion !== BACKUP_VERSION) {
    issues.push({
      path: 'backup.backupVersion',
      message: 'Backup version is not supported.',
    })
  }

  if (typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) {
    issues.push({
      path: 'backup.exportedAt',
      message: 'Backup export timestamp is invalid.',
    })
  }

  if (
    typeof value.exportType !== 'string' ||
    !VALID_EXPORT_TYPES.includes(value.exportType as (typeof VALID_EXPORT_TYPES)[number])
  ) {
    issues.push({
      path: 'backup.exportType',
      message: 'Backup export type is not supported.',
    })
  }

  if (!Array.isArray(value.groups)) {
    issues.push({
      path: 'backup.groups',
      message: 'Backup groups must be an array.',
    })
    return createValidationResult(issues)
  }

  if (value.groups.length === 0) {
    issues.push({
      path: 'backup.groups',
      message: 'Backup must contain at least one group.',
    })
  }

  if (value.groups.length > APP_LIMITS.maxUserGroups) {
    issues.push({
      path: 'backup.groups',
      message: `Backup cannot contain more than ${APP_LIMITS.maxUserGroups} groups.`,
    })
  }

  value.groups.forEach((group, index) => {
    const groupPath = `backup.groups[${index}]`

    if (isRecord(group) && group.source === 'quick-start') {
      issues.push({
        path: `${groupPath}.source`,
        message: 'Built-in Quick Start templates cannot be imported.',
      })
    }

    issues.push(...validateDiceGroup(group, groupPath).issues)
  })

  return createValidationResult(issues)
}

function isBackup(value: unknown): value is UnrealDiceBackup {
  return (
    isRecord(value) &&
    value.app === BACKUP_APP_ID &&
    value.backupVersion === BACKUP_VERSION &&
    typeof value.exportedAt === 'string' &&
    typeof value.exportType === 'string' &&
    Array.isArray(value.groups)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
