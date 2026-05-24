import { DEFAULT_SET_COLORS } from '../constants/colors'
import type { DiceModifier, DiceSet } from '../types/dice'
import { copyModifier, createDisabledModifier, normalizeDiceModifier } from './modifierUtils'

export interface SetInput {
  id?: string
  name: string
  diceCount: number
  sides: number
  diceColor: string
  pipColor: string
  modifier: DiceModifier
}

export function createEmptySetInput(): SetInput {
  return {
    name: '',
    diceCount: 1,
    sides: 6,
    diceColor: DEFAULT_SET_COLORS.diceColor,
    pipColor: DEFAULT_SET_COLORS.pipColor,
    modifier: createDisabledModifier(),
  }
}

export function createSetFromInput(
  input: SetInput,
  slotPosition: number,
  idFactory: () => string = createRandomId,
): DiceSet {
  return {
    id: input.id ?? idFactory(),
    name: input.name.trim() || `Set ${slotPosition}`,
    diceCount: input.diceCount,
    sides: input.sides,
    diceColor: input.diceColor,
    pipColor: input.pipColor,
    modifier: copyModifier(input.modifier),
  }
}

export function createSetInputFromSet(set: DiceSet): SetInput {
  return {
    id: set.id,
    name: set.name,
    diceCount: set.diceCount,
    sides: set.sides,
    diceColor: set.diceColor,
    pipColor: set.pipColor,
    modifier: normalizeDiceModifier(set.modifier),
  }
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
