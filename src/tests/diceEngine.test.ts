import { describe, expect, it } from 'vitest'
import {
  calculateModifiedSetTotal,
  calculateSetTotal,
  rollAllSets,
  rollComboSets,
  rollDie,
  rollSet,
} from '../domain/utils/diceEngine'
import type { SetPlayState } from '../domain/types/session'
import { createPlaySession } from '../domain/utils/playSessionFactory'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

const eachDieMultiplyModifier = {
  enabled: true,
  operator: 'multiply',
  value: 2,
  application: 'each-die',
} as const

const setTotalDivideModifier = {
  enabled: true,
  operator: 'divide',
  value: 2,
  application: 'set-total',
} as const

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

    expect(state.diceResults.every((die) => die.mode === 'normal')).toBe(true)
  })

  it('initial each-die modifier roll keeps every die modifier-active', () => {
    const state = rollSet(
      createTestSet({ diceCount: 2, modifier: eachDieMultiplyModifier }),
      undefined,
      'include',
      createRandomSequence([0, 0.5]),
    )

    expect(state.diceResults.map((die) => die.mode)).toEqual([
      'modifier-active',
      'modifier-active',
    ])
    expect(state.total).toBe(10)
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
          { value: 2, mode: 'normal' },
          { value: 3, mode: 'normal' },
        ],
        4,
        'include',
      ),
    ).toBe(9)
  })

  it('a locked die retains its value during reroll', () => {
    const previousState: SetPlayState = {
      setId: 'set-1',
      isExpanded: false,
      total: 4,
      setModifierActive: false,
      diceResults: [
        { value: 4, mode: 'locked' },
        { value: 2, mode: 'normal' },
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

  it('a die locked before the first roll stays unrolled', () => {
    const previousState: SetPlayState = {
      setId: 'set-1',
      isExpanded: true,
      total: null,
      setModifierActive: false,
      diceResults: [
        { value: 0, mode: 'locked' },
        { value: 0, mode: 'normal' },
      ],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 2, sides: 6 }),
      previousState,
      'include',
      () => 0.5,
    )

    expect(nextState.diceResults[0]).toEqual({ value: 0, mode: 'locked' })
    expect(nextState.diceResults[1]?.value).toBe(4)
    expect(nextState.total).toBe(4)
  })

  it('an unlocked die is rerolled', () => {
    const previousState: SetPlayState = {
      setId: 'set-1',
      isExpanded: false,
      total: 4,
      setModifierActive: false,
      diceResults: [{ value: 4, mode: 'normal' }],
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
          { value: 5, mode: 'locked' },
          { value: 1, mode: 'normal' },
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
          { value: 5, mode: 'locked' },
          { value: 1, mode: 'normal' },
        ],
        0,
        'exclude',
      ),
    ).toBe(1)
  })

  it('rerolling an all-locked set in include mode retains the total', () => {
    const previousState: SetPlayState = {
      setId: 'set-1',
      isExpanded: false,
      total: 7,
      setModifierActive: false,
      diceResults: [
        { value: 3, mode: 'locked' },
        { value: 4, mode: 'locked' },
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

  it('rerolling an all-locked set in exclude mode returns zero without a modifier', () => {
    const previousState: SetPlayState = {
      setId: 'set-1',
      isExpanded: false,
      total: 7,
      setModifierActive: false,
      diceResults: [
        { value: 3, mode: 'locked' },
        { value: 4, mode: 'locked' },
      ],
    }
    const nextState = rollSet(
      createTestSet({ id: 'set-1', diceCount: 2 }),
      previousState,
      'exclude',
      () => 0,
    )

    expect(nextState.total).toBe(0)
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

  it('each-die multiply applies only to modifier-active dice', () => {
    const total = calculateModifiedSetTotal(
      [
        { value: 2, mode: 'modifier-active' },
        { value: 5, mode: 'normal' },
        { value: 4, mode: 'modifier-active' },
        { value: 1, mode: 'locked' },
        { value: 6, mode: 'normal' },
      ],
      createTestSet({ diceCount: 5, modifier: eachDieMultiplyModifier }),
      'exclude',
      false,
    )

    expect(total).toBe(23)
  })

  it('each-die divide rounds each modified die upward before summing', () => {
    const total = calculateModifiedSetTotal(
      [
        { value: 5, mode: 'modifier-active' },
        { value: 3, mode: 'modifier-active' },
        { value: 4, mode: 'normal' },
      ],
      createTestSet({
        diceCount: 3,
        modifier: { ...eachDieMultiplyModifier, operator: 'divide', value: 2 },
      }),
      'include',
      false,
    )

    expect(total).toBe(9)
  })

  it('set-total divide applies once after locked dice counting', () => {
    const total = calculateModifiedSetTotal(
      [
        { value: 5, mode: 'normal' },
        { value: 3, mode: 'locked' },
        { value: 4, mode: 'normal' },
      ],
      createTestSet({ diceCount: 3, modifier: setTotalDivideModifier }),
      'exclude',
      true,
    )

    expect(total).toBe(5)
  })

  it('disabled set-total session modifier returns the base total', () => {
    const total = calculateModifiedSetTotal(
      [
        { value: 5, mode: 'normal' },
        { value: 3, mode: 'normal' },
        { value: 4, mode: 'normal' },
      ],
      createTestSet({ diceCount: 3, modifier: setTotalDivideModifier }),
      'include',
      false,
    )

    expect(total).toBe(12)
  })

  it('rolls symbol dice and returns no total for pure non-countable symbols', () => {
    const state = rollSet(
      createTestSet({
        diceCount: 0,
        symbolDice: [
          {
            id: 'symbol-1',
            faces: [
              { type: 'letter', value: 'A' },
              { type: 'letter', value: 'K' },
            ],
          },
        ],
      }),
      undefined,
      'include',
      () => 0,
    )

    expect(state.diceResults[0]?.symbolFace).toEqual({ type: 'letter', value: 'A' })
    expect(state.total).toBeNull()
  })

  it('locked symbol dice retain their rolled face', () => {
    const state = rollSet(
      createTestSet({
        diceCount: 0,
        symbolDice: [
          {
            id: 'symbol-1',
            faces: [
              { type: 'letter', value: 'A' },
              { type: 'letter', value: 'K' },
            ],
          },
        ],
      }),
      {
        setId: 'set-1',
        isExpanded: true,
        total: null,
        setModifierActive: false,
        diceResults: [
          {
            value: 0,
            mode: 'locked',
            resultType: 'symbol',
            symbolDieId: 'symbol-1',
            symbolFace: { type: 'letter', value: 'K' },
          },
        ],
      },
      'include',
      () => 0,
    )

    expect(state.diceResults[0]?.symbolFace).toEqual({ type: 'letter', value: 'K' })
  })

  it('mixed set total includes numeric dice and countable number faces', () => {
    const state = rollSet(
      createTestSet({
        diceCount: 2,
        sides: 6,
        symbolDice: [
          {
            id: 'symbol-1',
            faces: [
              { type: 'number', value: 5, countsTowardTotal: true },
              { type: 'letter', value: 'A' },
            ],
          },
        ],
      }),
      undefined,
      'include',
      createRandomSequence([0, 0.5, 0]),
    )

    expect(state.total).toBe(10)
  })

  it('non-countable number and color faces do not contribute to totals', () => {
    const state = rollSet(
      createTestSet({
        diceCount: 0,
        symbolDice: [
          {
            id: 'symbol-1',
            faces: [
              { type: 'number', value: 100, countsTowardTotal: false },
              { type: 'color', value: '#dc2626', label: 'Red' },
            ],
          },
        ],
      }),
      undefined,
      'include',
      () => 0,
    )

    expect(state.total).toBeNull()
  })

  it('each-die modifier applies to countable symbol number faces', () => {
    const total = calculateModifiedSetTotal(
      [
        {
          value: 5,
          mode: 'modifier-active',
          resultType: 'symbol',
          symbolFace: { type: 'number', value: 5, countsTowardTotal: true },
        },
        {
          value: 0,
          mode: 'modifier-active',
          resultType: 'symbol',
          symbolFace: { type: 'letter', value: 'A' },
        },
      ],
      createTestSet({ diceCount: 0, modifier: eachDieMultiplyModifier }),
      'include',
      false,
    )

    expect(total).toBe(10)
  })

  it('set-total modifier does not create a total for non-countable symbol results', () => {
    const total = calculateModifiedSetTotal(
      [
        {
          value: 0,
          mode: 'normal',
          resultType: 'symbol',
          symbolFace: { type: 'letter', value: 'A' },
        },
      ],
      createTestSet({ diceCount: 0, modifier: setTotalDivideModifier }),
      'include',
      true,
    )

    expect(total).toBeNull()
  })

  it('Roll All ignores symbol-only non-countable sets in the combined total while rolling them', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({ id: 'set-1', diceCount: 1 }),
        createTestSet({
          id: 'set-2',
          diceCount: 0,
          symbolDice: [
            {
              id: 'symbol-1',
              faces: [
                { type: 'letter', value: 'A' },
                { type: 'letter', value: 'K' },
              ],
            },
          ],
        }),
      ],
    })

    const session = rollAllSets(group, createPlaySession(group), () => 0)

    expect(session.lastRollAllTotal).toBe(1)
    expect(session.setStates['set-2']?.diceResults).toHaveLength(1)
  })

  it('combo with only non-countable symbol results keeps a neutral total', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({
          id: 'set-1',
          diceCount: 0,
          symbolDice: [
            {
              id: 'symbol-1',
              faces: [
                { type: 'letter', value: 'A' },
                { type: 'letter', value: 'K' },
              ],
            },
          ],
        }),
      ],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-1'] })],
    })

    const session = rollComboSets(group, createPlaySession(group), 'combo-1', () => 0)

    expect(session.comboTotals['combo-1']).toBeNull()
  })
})
