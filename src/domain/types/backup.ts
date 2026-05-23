import type { DiceGroup } from './groups'

export type BackupExportType = 'single-group' | 'all-groups'

export interface UnrealDiceBackup {
  app: 'unrealDice'
  backupVersion: number
  exportedAt: string
  exportType: BackupExportType
  groups: DiceGroup[]
}
