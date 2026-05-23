import { describe, expect, it } from 'vitest'
import {
  calculateSetTotal,
  rollAllSets,
  rollComboSets,
  rollDie,
  rollSet,
} from '../domain/utils/diceEngine'
import { createPlaySession } from '../domain/utils/playSessionFactory'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

function createRandomSequence(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index] ?? values.at(-1) ?? 0
    index += 1
    return value
  }
}

describe('diceEngine', () => {
  it('rolling a die always returns a value in the inclusive valid range', () => {
    expect(rollDie(6, () => 0)).toBe(1)
    expect(rollDie(6, () => 0.999)).toBe(6)
  })

  it('initial set roll creates the correct number of die results', () => {
    const state = rollSet(createTestSet({ diceCount: 3 }), undefined, 'include')

    expect(state.diceResults).toHaveLength(3)
  })

  it('initial dice are unlocked', () => {
    const state = rollSet(createTestSet({ diceCount: 2 }), undefined, 'include')

    expect(state.diceResults.every((die) => !die.locked)).toBe(true)
  })

  it('total is correct for an unlocked set', () => {
    const state = rollSet(
      createTestSet({ diceCount: 2, sides: 6 }),
      undefined,
      'include',
      createRandomSequence([0, 0.5]),
    )

    expect(state.total).toBe(5)
  })

  it('modifier is included in total calculation even though UI currently hides it', () => {
    expect(
      calculateSetTotal(
        [
          { value: 2, locked: false },
          { value: 3, locked: false },
        ],
        4,
        'include',
      ),
    ).toBe(9)
  })

  it('a locked die retains its value during reroll', () => {
    const previousState = {
      setId: 'set-1',
      isExpanded: false,
      total: 4,
      diceResults: [
        { value: 4, locked: true },
        { value: 2, locked: false },
      ],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 2, sides: 6 }),
      previousState,
      'include',
      () => 0,
    )

    expect(nextState.diceResults[0]?.value).toBe(4)
  })

  it('an unlocked die is rerolled', () => {
    const previousState = {
      setId: 'set-1',
      isExpanded: false,
      total: 4,
      diceResults: [{ value: 4, locked: false }],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 1, sides: 6 }),
      previousState,
      'include',
      () => 0,
    )

    expect(nextState.diceResults[0]?.value).toBe(1)
  })

  it('include counts locked dice in total', () => {
    expect(
      calculateSetTotal(
        [
          { value: 5, locked: true },
          { value: 1, locked: false },
        ],
        0,
        'include',
      ),
    ).toBe(6)
  })

  it('exclude removes locked dice values from total', () => {
    expect(
      calculateSetTotal(
        [
          { value: 5, locked: true },
          { value: 1, locked: false },
        ],
        0,
        'exclude',
      ),
    ).toBe(1)
  })

  it('rerolling an all-locked set in include mode retains the total', () => {
    const previousState = {
      setId: 'set-1',
      isExpanded: false,
      total: 7,
      diceResults: [
        { value: 3, locked: true },
        { value: 4, locked: true },
      ],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 2 }),
      previousState,
      'include',
      () => 0,
    )

    expect(nextState.total).toBe(7)
  })

  it('rerolling an all-locked set in exclude mode returns modifier-only total', () => {
    const previousState = {
      setId: 'set-1',
      isExpanded: false,
      total: 7,
      diceResults: [
        { value: 3, locked: true },
        { value: 4, locked: true },
      ],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 2, modifier: 2 }),
      previousState,
      'exclude',
      () => 0,
    )

    expect(nextState.total).toBe(2)
  })

  it('Roll All combined total equals the sum of newly rolled set totals', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({ id: 'set-1', diceCount: 1 }),
        createTestSet({ id: 'set-2', diceCount: 1 }),
      ],
    })

    const session = rollAllSets(group, createPlaySession(group), createRandomSequence([0, 0.5]))

    expect(session.lastRollAllTotal).toBe(5)
  })

  it('Combo roll total equals the sum of only its referenced set totals', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({ id: 'set-1', diceCount: 1 }),
        createTestSet({ id: 'set-2', diceCount: 1 }),
      ],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-2'] })],
    })

    const session = rollComboSets(group, createPlaySession(group), 'combo-1', () => 0.5)

    expect(session.comboTotals['combo-1']).toBe(4)
  })

  it('Combo roll does not alter unrelated set states', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({ id: 'set-1', diceCount: 1 }),
        createTestSet({ id: 'set-2', diceCount: 1 }),
      ],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-2'] })],
    })

    const session = rollComboSets(group, createPlaySession(group), 'combo-1', () => 0)

    expect(session.setStates['set-1']?.total).toBeNull()
    expect(session.setStates['set-2']?.total).toBe(1)
  })
})
