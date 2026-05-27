import type { DiceGroup } from '../types/groups'
import type { GroupPlaySession, SetPlayState } from '../types/session'
import { createPlaySession } from './playSessionFactory'

export function reconcilePlaySession(
  previousSession: GroupPlaySession,
  previousGroup: DiceGroup,
  nextGroup: DiceGroup,
): GroupPlaySession {
  const freshSession = createPlaySession(nextGroup)
  const setStates: Record<string, SetPlayState> = {}

  nextGroup.sets.forEach((nextSet) => {
    const previousSet = previousGroup.sets.find((set) => set.id === nextSet.id)
    const previousState = previousSession.setStates[nextSet.id]

    if (
      previousSet !== undefined &&
      previousState !== undefined &&
      previousSet.diceCount === nextSet.diceCount &&
      previousSet.sides === nextSet.sides &&
      JSON.stringify(previousSet.modifier) === JSON.stringify(nextSet.modifier) &&
      JSON.stringify(previousSet.symbolDice) === JSON.stringify(nextSet.symbolDice)
    ) {
      setStates[nextSet.id] = {
        ...previousState,
        diceResults: previousState.diceResults.map((die) => ({ ...die })),
      }
      return
    }

    setStates[nextSet.id] = freshSession.setStates[nextSet.id]
  })

  return {
    groupId: nextGroup.id,
    setStates,
    lastRollAllTotal: null,
    comboTotals: freshSession.comboTotals,
  }
}
