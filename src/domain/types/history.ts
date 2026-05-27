import type { DiceModifier, LockedDiceCounting, SymbolDieDefinition, SymbolDieFace } from './dice'

export type IndividualDieMode = 'normal' | 'modifier-active' | 'locked'

export interface IndividualDieResult {
  value: number
  mode: IndividualDieMode
  resultType?: 'numeric' | 'symbol'
  symbolDieId?: string
  symbolFace?: SymbolDieFace
}

export interface SetHistoryEntry {
  id: string
  setId: string
  setName: string
  diceCount: number
  sides: number
  symbolDice?: SymbolDieDefinition[]
  diceResults: IndividualDieResult[]
  modifier: DiceModifier
  setModifierActive: boolean
  lockedDiceCounting: LockedDiceCounting
  total: number | null
  rolledAt: string
}
