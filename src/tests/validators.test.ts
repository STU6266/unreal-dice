import { describe, expect, it } from 'vitest'
import { APP_LIMITS } from '../domain/constants/limits'
import { DATA_SCHEMA_VERSION } from '../domain/constants/storage'
import {
  normalizeDiceSet,
  validateDiceModifier,
  validateDiceGroup,
  validateDiceSet,
  validateStoredUserGroupsData,
} from '../domain/validation/validators'
import { createGroups, createTestCombo, createTestGroup, createTestSet } from './testFixtures'

describe('validators', () => {
  it('allows a valid user group', () => {
    const result = validateDiceGroup(createTestGroup())

    expect(result.isValid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('rejects a set with fewer than 2 sides', () => {
    const result = validateDiceSet(createTestSet({ sides: 1 }))

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'set.sides' }),
      ]),
    )
  })

  it('rejects a set with more than 30 dice', () => {
    const result = validateDiceSet(createTestSet({ diceCount: 31 }))

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'set.diceCount' }),
      ]),
    )
  })

  it('accepts valid modifier configurations', () => {
    const result = validateDiceModifier({
      enabled: true,
      operator: 'divide',
      value: 2,
      application: 'each-die',
    })

    expect(result.isValid).toBe(true)
  })

  it('rejects invalid modifier values and operators', () => {
    expect(
      validateDiceModifier({
        enabled: true,
        operator: 'add',
        value: 0,
        application: 'set-total',
      }).isValid,
    ).toBe(false)
    expect(
      validateDiceModifier({
        enabled: true,
        operator: 'power',
        value: 2,
        application: 'set-total',
      }).isValid,
    ).toBe(false)
  })

  it('normalizes old sets without modifier data to a disabled modifier', () => {
    const set = normalizeDiceSet({
      id: 'old-set',
      name: 'Old Set',
      diceCount: 1,
      sides: 6,
      diceColor: '#ffffff',
      pipColor: '#000000',
    })

    expect(set?.modifier.enabled).toBe(false)
  })

  it('rejects a group with duplicate set IDs', () => {
    const result = validateDiceGroup(
      createTestGroup({
        sets: [
          createTestSet({ id: 'duplicate-set' }),
          createTestSet({ id: 'duplicate-set' }),
        ],
      }),
    )

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Set ID must be unique.' }),
      ]),
    )
  })

  it('rejects a combo referencing a missing set', () => {
    const result = validateDiceGroup(
      createTestGroup({
        combos: [createTestCombo({ setIds: ['missing-set'] })],
      }),
    )

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Combo references a missing set.' }),
      ]),
    )
  })

  it('rejects a set assigned to two combos', () => {
    const result = validateDiceGroup(
      createTestGroup({
        combos: [
          createTestCombo({ id: 'combo-1', setIds: ['set-1'] }),
          createTestCombo({ id: 'combo-2', setIds: ['set-1'] }),
        ],
      }),
    )

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'A set can belong to only one combo.',
        }),
      ]),
    )
  })

  it('rejects a persisted collection containing a quick-start group', () => {
    const result = validateStoredUserGroupsData({
      schemaVersion: DATA_SCHEMA_VERSION,
      groups: [createTestGroup({ source: 'quick-start' })],
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Persisted user groups cannot use quick-start source.',
        }),
      ]),
    )
  })

  it('rejects a persisted collection exceeding the maximum user group count', () => {
    const result = validateStoredUserGroupsData({
      schemaVersion: DATA_SCHEMA_VERSION,
      groups: createGroups(APP_LIMITS.maxUserGroups + 1),
    })

    expect(result.isValid).toBe(false)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: `Cannot store more than ${APP_LIMITS.maxUserGroups} user groups.`,
        }),
      ]),
    )
  })
})
