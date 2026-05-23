import type { DiceSet, LockedDiceCounting } from '../types/dice'
import type { DiceGroup } from '../types/groups'
import type { IndividualDieResult } from '../types/history'
import type { GroupPlaySession, SetPlayState } from '../types/session'

export type RandomNumberGenerator = () => number

export function rollDie(
  sides: number,
  random: RandomNumberGenerator = Math.random,
): number {
  return Math.floor(random() * sides) + 1
}

export function calculateSetTotal(
  diceResults: readonly IndividualDieResult[],
  modifier: number,
  lockedDiceCounting: LockedDiceCounting,
): number {
  const diceTotal = diceResults.reduce((total, die) => {
    if (die.locked && lockedDiceCounting === 'exclude') {
      return total
    }

    return total + die.value
  }, 0)

  return diceTotal + modifier
}

export function rollSet(
  set: DiceSet,
  previousState: SetPlayState | undefined,
  lockedDiceCounting: LockedDiceCounting,
  random: RandomNumberGenerator = Math.random,
): SetPlayState {
  const previousResults = previousState?.diceResults ?? []
  const diceResults = Array.from({ length: set.diceCount }, (_, index) => {
    const previousDie = previousResults[index]

    if (previousDie?.locked) {
      return previousDie
    }

    return {
      value: rollDie(set.sides, random),
      locked: false,
    }
  })
  const total = calculateSetTotal(
    diceResults,
    set.modifier,
    lockedDiceCounting,
  )

  return {
    setId: set.id,
    isExpanded: previousState?.isExpanded ?? false,
    diceResults,
    total,
  }
}

export function rollAllSets(
  group: Pick<DiceGroup, 'sets' | 'lockedDiceCounting'>,
  session: GroupPlaySession,
  random: RandomNumberGenerator = Math.random,
): GroupPlaySession {
  let combinedTotal = 0
  const setStates = { ...session.setStates }

  group.sets.forEach((set) => {
    const nextState = rollSet(
      set,
      setStates[set.id],
      group.lockedDiceCounting,
      random,
    )
    setStates[set.id] = nextState
    combinedTotal += nextState.total ?? 0
  })

  return {
    ...session,
    setStates,
    lastRollAllTotal: combinedTotal,
  }
}

export function rollComboSets(
  group: Pick<DiceGroup, 'sets' | 'combos' | 'lockedDiceCounting'>,
  session: GroupPlaySession,
  comboId: string,
  random: RandomNumberGenerator = Math.random,
): GroupPlaySession {
  const combo = group.combos.find((item) => item.id === comboId)
  if (combo === undefined || combo.setIds.length === 0) {
    return session
  }

  let comboTotal = 0
  const setStates = { ...session.setStates }

  combo.setIds.forEach((setId) => {
    const set = group.sets.find((item) => item.id === setId)
    if (set === undefined) {
      return
    }

    const nextState = rollSet(
      set,
      setStates[set.id],
      group.lockedDiceCounting,
      random,
    )
    setStates[set.id] = nextState
    comboTotal += nextState.total ?? 0
  })

  return {
    ...session,
    setStates,
    comboTotals: {
      ...session.comboTotals,
      [comboId]: comboTotal,
    },
  }
}
