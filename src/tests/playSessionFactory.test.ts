import { describe, expect, it } from 'vitest'
import { createPlaySession } from '../domain/utils/playSessionFactory'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

describe('playSessionFactory', () => {
  it('initial session contains all group sets with null totals and empty unrolled results', () => {
    const group = createTestGroup({
      sets: [
        createTestSet({ id: 'set-1' }),
        createTestSet({ id: 'set-2' }),
      ],
    })

    const session = createPlaySession(group)

    expect(session.setStates['set-1']).toMatchObject({
      total: null,
      diceResults: [],
      isExpanded: false,
    })
    expect(session.setStates['set-2']).toMatchObject({
      total: null,
      diceResults: [],
      isExpanded: false,
    })
  })

  it('locks and expanded states exist only in play-session data, not in saved DiceGroup data', () => {
    const group = createTestGroup({
      sets: [createTestSet({ id: 'set-1' })],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-1'] })],
    })
    const session = createPlaySession(group)

    session.setStates['set-1'] = {
      setId: 'set-1',
      isExpanded: true,
      total: 4,
      diceResults: [{ value: 4, locked: true }],
    }

    expect(group.sets[0]).not.toHaveProperty('diceResults')
    expect(group.sets[0]).not.toHaveProperty('isExpanded')
  })
})
