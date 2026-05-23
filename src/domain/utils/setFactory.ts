import { DEFAULT_SET_COLORS } from '../constants/colors'
import type { DiceSet } from '../types/dice'

export interface SetInput {
  id?: string
  name: string
  diceCount: number
  sides: number
  diceColor: string
  pipColor: string
}

export function createEmptySetInput(): SetInput {
  return {
    name: '',
    diceCount: 1,
    sides: 6,
    diceColor: DEFAULT_SET_COLORS.diceColor,
    pipColor: DEFAULT_SET_COLORS.pipColor,
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
    modifier: 0,
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
  }
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
