import { describe, expect, it } from 'vitest'
import { APP_LIMITS } from '../domain/constants/limits'
import { DEFAULT_SET_COLORS } from '../domain/constants/colors'
import {
  createEmptySlots,
  createGroupDraftFromGroup,
  createNewGroupDraft,
  prepareGroupDraftForSaving,
} from '../domain/utils/groupDraftFactory'
import { createEmptySetInput, createSetFromInput } from '../domain/utils/setFactory'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

function createIdFactory(): () => string {
  let index = 0
  return () => {
    index += 1
    return `id-${index}`
  }
}

describe('group draft factories', () => {
  it('creating a new group draft uses default locked dice counting exclude', () => {
    const draft = createNewGroupDraft(1, createIdFactory())

    expect(draft.lockedDiceCounting).toBe('exclude')
  })

  it('a new set uses default white dice color and black pip color', () => {
    const setInput = createEmptySetInput()

    expect(setInput.diceColor).toBe(DEFAULT_SET_COLORS.diceColor)
    expect(setInput.pipColor).toBe(DEFAULT_SET_COLORS.pipColor)
  })

  it('a nameless set receives a stable default name when prepared for saving', () => {
    const set = createSetFromInput(createEmptySetInput(), 2, createIdFactory())

    expect(set.name).toBe('Set 2')
  })

  it('saving preparation removes empty slots but preserves configured valid sets', () => {
    const draft = createNewGroupDraft(2, createIdFactory())
    draft.name = 'Table Night'
    draft.slots[0] = {
      ...draft.slots[0],
      set: createTestSet({ id: 'set-1', name: 'Attack' }),
    }

    const result = prepareGroupDraftForSaving(draft, {
      idFactory: createIdFactory(),
      now: () => '2026-05-23T10:00:00.000Z',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.group.sets).toHaveLength(1)
      expect(result.group.sets[0]?.name).toBe('Attack')
      expect(result.ignoredEmptySlots).toBe(1)
    }
  })

  it('editing preparation preserves existing group ID and createdAt', () => {
    const existingGroup = createTestGroup({
      id: 'saved-group',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    const draft = createGroupDraftFromGroup(existingGroup, createIdFactory())
    draft.name = 'Edited Group'

    const result = prepareGroupDraftForSaving(draft, {
      existingGroup,
      now: () => '2026-05-23T10:00:00.000Z',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.group.id).toBe('saved-group')
      expect(result.group.createdAt).toBe('2026-01-01T00:00:00.000Z')
    }
  })

  it('edited save data updates updatedAt', () => {
    const existingGroup = createTestGroup({
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const draft = createGroupDraftFromGroup(existingGroup, createIdFactory())

    const result = prepareGroupDraftForSaving(draft, {
      existingGroup,
      now: () => '2026-05-23T10:00:00.000Z',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.group.updatedAt).toBe('2026-05-23T10:00:00.000Z')
    }
  })

  it('an empty combo is invalid for final group saving', () => {
    const draft = createNewGroupDraft(1, createIdFactory())
    draft.name = 'Combo Group'
    draft.slots[0] = {
      ...draft.slots[0],
      set: createTestSet({ id: 'set-1' }),
    }
    draft.combos = [createTestCombo({ id: 'combo-1', setIds: [] })]

    const result = prepareGroupDraftForSaving(draft, {
      idFactory: createIdFactory(),
      now: () => '2026-05-23T10:00:00.000Z',
    })

    expect(result.ok).toBe(false)
  })

  it('no generated group can exceed configured set limits through utility functions', () => {
    const slots = createEmptySlots(APP_LIMITS.maxSetsPerGroup + 20, createIdFactory())

    expect(slots).toHaveLength(APP_LIMITS.maxSetsPerGroup)
  })
})
