import { BACKUP_APP_ID, BACKUP_VERSION } from '../domain/constants/backup'
import type { BackupExportType, UnrealDiceBackup } from '../domain/types/backup'
import type { DiceGroup } from '../domain/types/groups'
import { normalizeDiceGroup } from '../domain/validation/validators'

export function createBackup(
  groups: readonly DiceGroup[],
  exportType: BackupExportType,
  now: () => string = () => new Date().toISOString(),
): UnrealDiceBackup {
  return {
    app: BACKUP_APP_ID,
    backupVersion: BACKUP_VERSION,
    exportedAt: now(),
    exportType,
    groups: groups.map((group) => normalizeDiceGroup(group)),
  }
}

export function createBackupJson(backup: UnrealDiceBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`
}

export function createBackupFilename(groupName: string): string {
  const safeName = groupName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `unrealdice-${safeName || 'group'}.json`
}

export function downloadBackup(backup: UnrealDiceBackup, filename: string): void {
  const blob = new Blob([createBackupJson(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
