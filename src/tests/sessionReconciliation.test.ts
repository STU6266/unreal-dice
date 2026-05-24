import { describe, expect, it } from 'vitest'
import type { GroupPlaySession } from '../domain/types/session'
import { reconcilePlaySession } from '../domain/utils/sessionReconciliation'
import { createTestCombo, createTestGroup, createTestSet } from './testFixtures'

function createSession(): GroupPlaySession {
  return {
    groupId: 'group-1',
    lastRollAllTotal: 12,
    comboTotals: { 'combo-1': 8 },
    setStates: {
      'set-1': {
        setId: 'set-1',
        isExpanded: true,
        setModifierActive: false,
        total: 7,
        diceResults: [
          { value: 3, mode: 'locked' },
          { value: 4, mode: 'normal' },
        ],
      },
    },
  }
}

describe('sessionReconciliation', () => {
  it('unchanged set preserves current results and locks', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', diceCount: 2, sides: 6 })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', diceCount: 2, sides: 6 })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-1']?.diceResults[0]?.mode).toBe('locked')
    expect(session.setStates['set-1']?.total).toBe(7)
  })

  it('color/name-only set changes preserve current results and locks', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', name: 'Old', diceCount: 2, sides: 6 })],
    })
    const nextGroup = createTestGroup({
      sets: [
        createTestSet({
          id: 'set-1',
          name: 'New',
          diceCount: 2,
          sides: 6,
          diceColor: '#123456',
        }),
      ],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-1']?.diceResults).toHaveLength(2)
    expect(session.setStates['set-1']?.diceResults[0]?.mode).toBe('locked')
  })

  it('changed diceCount resets that set session', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', diceCount: 2 })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', diceCount: 3 })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-1']?.diceResults).toEqual([])
    expect(session.setStates['set-1']?.total).toBeNull()
  })

  it('changed sides resets that set session', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', sides: 6 })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1', sides: 8 })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-1']?.diceResults).toEqual([])
  })

  it('newly added set starts unrolled', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1' })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1' }), createTestSet({ id: 'set-2' })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-2']?.total).toBeNull()
  })

  it('deleted set is removed from the reconciled session', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1' })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-2' })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.setStates['set-1']).toBeUndefined()
  })

  it('Roll All total and combo totals reset after setup edit', () => {
    const previousGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1' })],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-1'] })],
    })
    const nextGroup = createTestGroup({
      sets: [createTestSet({ id: 'set-1' })],
      combos: [createTestCombo({ id: 'combo-1', setIds: ['set-1'] })],
    })

    const session = reconcilePlaySession(createSession(), previousGroup, nextGroup)

    expect(session.lastRollAllTotal).toBeNull()
    expect(session.comboTotals['combo-1']).toBeNull()
  })

  it('cancelling setup can restore the unchanged prior temporary session state', () => {
    const session = createSession()

    expect(session.setStates['set-1']?.total).toBe(7)
    expect(session.lastRollAllTotal).toBe(12)
  })
})
