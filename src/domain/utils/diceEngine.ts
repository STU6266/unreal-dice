import type { DiceSet, LockedDiceCounting, SymbolDieDefinition } from '../types/dice'
import type { DiceGroup } from '../types/groups'
import type { IndividualDieMode, IndividualDieResult } from '../types/history'
import type { GroupPlaySession, SetPlayState } from '../types/session'
import {
  applyModifier,
  isLockedDie,
  isModifierActiveDie,
  normalizeDieMode,
} from './modifierUtils'
import { getSymbolFaceContribution } from './symbolDiceUtils'

export type RandomNumberGenerator = () => number

export function rollDie(
  sides: number,
  random: RandomNumberGenerator = Math.random,
): number {
  return Math.floor(random() * sides) + 1
}

export function calculateSetTotal(
  diceResults: readonly (IndividualDieResult | { value: number; locked: boolean })[],
  modifier: number,
  lockedDiceCounting: LockedDiceCounting,
): number {
  const diceTotal = diceResults.reduce((total, die) => {
    if (isLockedDie(die) && lockedDiceCounting === 'exclude') {
      return total
    }

    return total + die.value
  }, 0)

  return diceTotal + modifier
}

export function calculateModifiedSetTotal(
  diceResults: readonly IndividualDieResult[],
  set: DiceSet,
  lockedDiceCounting: LockedDiceCounting,
  setModifierActive: boolean,
): number | null {
  let hasCountableResult = false
  let hasVisibleCountableResult = false
  const baseTotal = diceResults.reduce((total, die) => {
    const contribution = getDieContribution(die)
    if (contribution !== null) {
      hasVisibleCountableResult = true
    }

    if (isLockedDie(die) && lockedDiceCounting === 'exclude') {
      return total
    }

    if (contribution === null) {
      return total
    }

    hasCountableResult = true

    if (
      set.modifier.enabled &&
      set.modifier.application === 'each-die' &&
      isModifierActiveDie(die)
    ) {
      return total + applyModifier(contribution, set.modifier)
    }

    return total + contribution
  }, 0)

  if (!hasCountableResult && !hasVisibleCountableResult) {
    return null
  }

  if (
    set.modifier.enabled &&
    set.modifier.application === 'set-total' &&
    setModifierActive
  ) {
    return applyModifier(baseTotal, set.modifier)
  }

  return baseTotal
}

export function rollSet(
  set: DiceSet,
  previousState: SetPlayState | undefined,
  lockedDiceCounting: LockedDiceCounting,
  random: RandomNumberGenerator = Math.random,
): SetPlayState {
  const previousResults = previousState?.diceResults ?? []
  const totalDiceCount = set.diceCount + set.symbolDice.length
  const setModifierActive =
    set.modifier.enabled && set.modifier.application === 'set-total'
      ? (previousState?.setModifierActive ?? true)
      : false
  const numericResults: IndividualDieResult[] = Array.from({ length: set.diceCount }, (_, index) => {
    const previousDie = previousResults[index]
    const previousMode = normalizeDieMode(previousDie)
    const shouldStartModifierActive =
      set.modifier.enabled &&
      set.modifier.application === 'each-die' &&
      previousDie === undefined

    if (previousMode === 'locked') {
      return { value: previousDie?.value ?? 0, mode: 'locked' }
    }

    return {
      value: rollDie(set.sides, random),
      resultType: 'numeric',
      mode:
        set.modifier.enabled && set.modifier.application === 'each-die'
          ? previousMode === 'normal' && !shouldStartModifierActive
            ? 'normal'
            : 'modifier-active'
          : 'normal',
    }
  })
  const symbolResults: IndividualDieResult[] = set.symbolDice.map((symbolDie, symbolIndex) => {
    const resultIndex = set.diceCount + symbolIndex
    const previousDie = previousResults[resultIndex]
    const previousMode = normalizeDieMode(previousDie)
    const shouldStartModifierActive =
      set.modifier.enabled &&
      set.modifier.application === 'each-die' &&
      previousDie === undefined

    if (previousMode === 'locked' && previousDie !== undefined) {
      return { ...previousDie, mode: 'locked' }
    }

    const nextMode: IndividualDieMode = set.modifier.enabled && set.modifier.application === 'each-die'
      ? previousMode === 'normal' && !shouldStartModifierActive
        ? 'normal'
        : 'modifier-active'
      : 'normal'

    return rollSymbolDie(symbolDie, random, nextMode)
  })
  const diceResults = [...numericResults, ...symbolResults].slice(0, totalDiceCount)
  const total = calculateModifiedSetTotal(
    diceResults,
    set,
    lockedDiceCounting,
    setModifierActive,
  )

  return {
    setId: set.id,
    isExpanded: previousState?.isExpanded ?? false,
    diceResults,
    setModifierActive,
    total,
  }
}

export function rollAllSets(
  group: Pick<DiceGroup, 'sets' | 'lockedDiceCounting'>,
  session: GroupPlaySession,
  random: RandomNumberGenerator = Math.random,
): GroupPlaySession {
  let combinedTotal = 0
  let hasAnyTotal = false
  const setStates = { ...session.setStates }

  group.sets.forEach((set) => {
    const nextState = rollSet(
      set,
      setStates[set.id],
      group.lockedDiceCounting,
      random,
    )
    setStates[set.id] = nextState
    if (nextState.total !== null) {
      combinedTotal += nextState.total
      hasAnyTotal = true
    }
  })

  return {
    ...session,
    setStates,
    lastRollAllTotal: hasAnyTotal ? combinedTotal : null,
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
  let hasAnyTotal = false
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
    if (nextState.total !== null) {
      comboTotal += nextState.total
      hasAnyTotal = true
    }
  })

  return {
    ...session,
    setStates,
    comboTotals: {
      ...session.comboTotals,
      [comboId]: hasAnyTotal ? comboTotal : null,
    },
  }
}

export function getDieContribution(die: IndividualDieResult): number | null {
  if (die.resultType === 'symbol') {
    return getSymbolFaceContribution(die.symbolFace)
  }

  return die.value
}

function rollSymbolDie(
  symbolDie: SymbolDieDefinition,
  random: RandomNumberGenerator,
  mode: IndividualDieResult['mode'],
): IndividualDieResult {
  const faceIndex = Math.floor(random() * symbolDie.faces.length)
  const face = symbolDie.faces[Math.min(faceIndex, symbolDie.faces.length - 1)]
  const contribution = getSymbolFaceContribution(face)

  return {
    value: contribution ?? 0,
    mode,
    resultType: 'symbol',
    symbolDieId: symbolDie.id,
    symbolFace: face === undefined ? undefined : { ...face },
  }
}
