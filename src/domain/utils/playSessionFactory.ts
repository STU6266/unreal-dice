import type { DiceGroup } from '../types/groups'
import type { GroupPlaySession, SetPlayState } from '../types/session'

export function createPlaySession(
  group: Pick<DiceGroup, 'id' | 'sets' | 'combos'>,
): GroupPlaySession {
  const setStates: Record<string, SetPlayState> = {}
  const comboTotals: Record<string, number | null> = {}

  group.sets.forEach((set) => {
    setStates[set.id] = {
      setId: set.id,
      isExpanded: false,
      diceResults: [],
      setModifierActive: set.modifier.enabled && set.modifier.application === 'set-total',
      total: null,
    }
  })

  group.combos.forEach((combo) => {
    comboTotals[combo.id] = null
  })

  return {
    groupId: group.id,
    setStates,
    lastRollAllTotal: null,
    comboTotals,
  }
}
