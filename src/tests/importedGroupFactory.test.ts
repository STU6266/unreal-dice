import { describe, expect, it } from 'vitest'
import { APP_LIMITS } from '../domain/constants/limits'
import { createImportedGroups } from '../domain/utils/importedGroupFactory'
import { createGroups, createTestCombo, createTestGroup, createTestSet } from './testFixtures'

function createIdFactory(): () => string {
  let index = 0
  return () => {
    index += 1
    return `new-id-${index}`
  }
}

describe('importedGroupFactory', () => {
  it('imported group receives source imported', () => {
    const result = createImportedGroups(
      [createTestGroup({ name: 'Risk Test' })],
      [],
      createIdFactory(),
      () => '2026-05-23T10:00:00.000Z',
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.source).toBe('imported')
    }
  })

  it('imported group receives a new group ID', () => {
    const result = createImportedGroups(
      [createTestGroup({ id: 'old-group' })],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.id).not.toBe('old-group')
    }
  })

  it('imported sets receive new IDs', () => {
    const result = createImportedGroups(
      [createTestGroup({ sets: [createTestSet({ id: 'old-set' })] })],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.sets[0]?.id).not.toBe('old-set')
    }
  })

  it('imported combos receive new IDs', () => {
    const result = createImportedGroups(
      [
        createTestGroup({
          sets: [createTestSet({ id: 'old-set' })],
          combos: [createTestCombo({ id: 'old-combo', setIds: ['old-set'] })],
        }),
      ],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.combos[0]?.id).not.toBe('old-combo')
    }
  })

  it('combo set IDs are correctly remapped to new set IDs', () => {
    const result = createImportedGroups(
      [
        createTestGroup({
          sets: [createTestSet({ id: 'old-set' })],
          combos: [createTestCombo({ setIds: ['old-set'] })],
        }),
      ],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.combos[0]?.setIds).toEqual([
        result.groups[0]?.sets[0]?.id,
      ])
    }
  })

  it('locked dice counting and colors are preserved', () => {
    const result = createImportedGroups(
      [
        createTestGroup({
          lockedDiceCounting: 'include',
          sets: [
            createTestSet({
              diceColor: '#123456',
              pipColor: '#abcdef',
            }),
          ],
        }),
      ],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.lockedDiceCounting).toBe('include')
      expect(result.groups[0]?.sets[0]?.diceColor).toBe('#123456')
      expect(result.groups[0]?.sets[0]?.pipColor).toBe('#abcdef')
    }
  })

  it('imported naming creates Risk Test Imported', () => {
    const result = createImportedGroups(
      [createTestGroup({ name: 'Risk Test' })],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.name).toBe('Risk Test Imported')
    }
  })

  it('naming collision creates Risk Test Imported 2', () => {
    const result = createImportedGroups(
      [createTestGroup({ name: 'Risk Test' })],
      [createTestGroup({ name: 'Risk Test Imported' })],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups[0]?.name).toBe('Risk Test Imported 2')
    }
  })

  it('importing groups that would exceed the maximum saved group count is rejected without a partial result', () => {
    const result = createImportedGroups(
      [createTestGroup({ id: 'import-1' }), createTestGroup({ id: 'import-2' })],
      createGroups(APP_LIMITS.maxUserGroups - 1),
      createIdFactory(),
    )

    expect(result).toEqual({ ok: false, reason: 'max-groups-reached' })
  })
})
