import { describe, expect, it } from 'vitest'
import { COMBO_COLOR_PALETTE } from '../domain/constants/colors'
import { APP_LIMITS } from '../domain/constants/limits'
import {
  createComboFromInput,
  createComboInput,
  deleteCombo,
  hasDuplicateComboAssignments,
  moveSetToCombo,
} from '../domain/utils/comboFactory'
import { createTestCombo, createTestSet } from './testFixtures'

function createIdFactory(): () => string {
  let index = 0
  return () => {
    index += 1
    return `combo-id-${index}`
  }
}

describe('comboFactory', () => {
  it('first combo gets default name Combo A', () => {
    expect(createComboInput([]).name).toBe('Combo A')
  })

  it('second combo gets default name Combo B', () => {
    expect(createComboInput([createTestCombo({ name: 'Combo A' })]).name).toBe(
      'Combo B',
    )
  })

  it('generated combo receives a default palette color', () => {
    expect(createComboInput([]).color).toBe(COMBO_COLOR_PALETTE[0])
  })

  it('a new combo receives a unique ID', () => {
    const result = createComboFromInput(
      { name: 'Combo A', color: '#7dd3fc', setIds: ['set-1'] },
      [createTestSet({ id: 'set-1' })],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.combo.id).toBe('combo-id-1')
    }
  })

  it('editing a combo preserves its ID', () => {
    const result = createComboFromInput(
      { id: 'existing-combo', name: 'Combo A', color: '#7dd3fc', setIds: ['set-1'] },
      [createTestSet({ id: 'set-1' })],
      [createTestCombo({ id: 'existing-combo' })],
      createIdFactory(),
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.combo.id).toBe('existing-combo')
    }
  })

  it('a set cannot remain assigned to two combos', () => {
    expect(
      hasDuplicateComboAssignments([
        createTestCombo({ id: 'combo-a', setIds: ['set-1'] }),
        createTestCombo({ id: 'combo-b', setIds: ['set-1'] }),
      ]),
    ).toBe(true)
  })

  it('moving a set from one combo to another removes it from the old combo', () => {
    const combos = moveSetToCombo(
      [
        createTestCombo({ id: 'combo-a', setIds: ['set-1'] }),
        createTestCombo({ id: 'combo-b', setIds: [] }),
      ],
      'set-1',
      'combo-b',
    )

    expect(combos[0]?.setIds).toEqual([])
    expect(combos[1]?.setIds).toEqual([])
  })

  it('deleting a combo does not delete its sets', () => {
    const set = createTestSet({ id: 'set-1' })
    const combos = deleteCombo([createTestCombo({ setIds: ['set-1'] })], 'combo-1')

    expect(combos).toEqual([])
    expect(set.id).toBe('set-1')
  })

  it('an empty combo is invalid for final group saving', () => {
    const result = createComboFromInput(
      { name: 'Combo A', color: '#7dd3fc', setIds: [] },
      [createTestSet({ id: 'set-1' })],
      [],
      createIdFactory(),
    )

    expect(result.ok).toBe(false)
  })

  it('a group cannot exceed the combo limit', () => {
    const existingCombos = Array.from({ length: APP_LIMITS.maxCombosPerGroup }, (_, index) =>
      createTestCombo({ id: `combo-${index}`, name: `Combo ${index}` }),
    )
    const result = createComboFromInput(
      { name: 'Extra Combo', color: '#7dd3fc', setIds: ['set-1'] },
      [createTestSet({ id: 'set-1' })],
      existingCombos,
      createIdFactory(),
    )

    expect(result.ok).toBe(false)
  })
})
