import type { DiceModifier, LockedDiceCounting } from './dice'

export type IndividualDieMode = 'normal' | 'modifier-active' | 'locked'

export interface IndividualDieResult {
  value: number
  mode: IndividualDieMode
}

export interface SetHistoryEntry {
  id: string
  setId: string
  setName: string
  diceCount: number
  sides: number
  diceResults: IndividualDieResult[]
  modifier: DiceModifier
  setModifierActive: boolean
  lockedDiceCounting: LockedDiceCounting
  total: number
  rolledAt: string
}
