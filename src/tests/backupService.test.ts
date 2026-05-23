import { describe, expect, it } from 'vitest'
import { BACKUP_VERSION } from '../domain/constants/backup'
import { validateBackup, parseBackupJson } from '../domain/validation/backupValidators'
import {
  createBackup,
  createBackupFilename,
} from '../services/backupService'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

describe('backupService', () => {
  it('creating a single-group backup produces the expected versioned structure', () => {
    const group = createTestGroup({ name: 'Risk Test' })
    const backup = createBackup([group], 'single-group', () => '2026-05-23T10:00:00.000Z')

    expect(backup).toEqual({
      app: 'unrealDice',
      backupVersion: BACKUP_VERSION,
      exportedAt: '2026-05-23T10:00:00.000Z',
      exportType: 'single-group',
      groups: [group],
    })
  })

  it('creating an all-groups backup includes only supplied saved groups', () => {
    const groups = [
      createTestGroup({ id: 'group-1' }),
      createTestGroup({ id: 'group-2', name: 'Second Group' }),
    ]
    const backup = createBackup(groups, 'all-groups')

    expect(backup.exportType).toBe('all-groups')
    expect(backup.groups).toHaveLength(2)
  })

  it('generated filename is safe and predictable', () => {
    expect(createBackupFilename('Risk Test! / Copy')).toBe(
      'unrealdice-risk-test-copy.json',
    )
  })

  it('exporting does not mutate original groups', () => {
    const group = createTestGroup({
      sets: [createTestSet({ id: 'set-1', name: 'Attack' })],
    })
    const backup = createBackup([group], 'single-group')

    backup.groups[0]?.sets.splice(0, 1)

    expect(group.sets).toHaveLength(1)
  })

  it('a valid backup passes validation', () => {
    const backup = createBackup([createTestGroup()], 'single-group')

    expect(validateBackup(backup).isValid).toBe(true)
  })

  it('invalid JSON is rejected safely', () => {
    expect(parseBackupJson('{broken').isValid).toBe(false)
  })

  it('incorrect app identifier is rejected', () => {
    const backup = { ...createBackup([createTestGroup()], 'single-group'), app: 'other' }

    expect(validateBackup(backup).isValid).toBe(false)
  })

  it('unsupported backup version is rejected', () => {
    const backup = {
      ...createBackup([createTestGroup()], 'single-group'),
      backupVersion: 999,
    }

    expect(validateBackup(backup).isValid).toBe(false)
  })

  it('a backup containing a quick-start source group is rejected', () => {
    const backup = createBackup(
      [createTestGroup({ source: 'quick-start' })],
      'single-group',
    )

    expect(validateBackup(backup).isValid).toBe(false)
  })

  it('a backup with invalid combo references is rejected', () => {
    const backup = createBackup(
      [
        createTestGroup({
          sets: [createTestSet({ id: 'set-1' })],
          combos: [createTestCombo({ setIds: ['missing-set'] })],
        }),
      ],
      'single-group',
    )

    expect(validateBackup(backup).isValid).toBe(false)
  })
})
