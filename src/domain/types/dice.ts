export type LockedDiceCounting = 'exclude' | 'include'
export type ModifierOperator = 'add' | 'subtract' | 'multiply' | 'divide'
export type ModifierApplication = 'each-die' | 'set-total'

export interface DiceModifier {
  enabled: boolean
  operator: ModifierOperator
  value: number
  application: ModifierApplication
}

export type SymbolFaceType = 'icon' | 'letter' | 'number' | 'color'

export interface IconSymbolFace {
  type: 'icon'
  id?: string
  symbol: string
  label: string
  category?: string
  subgroup?: string
}

export interface LetterSymbolFace {
  type: 'letter'
  value: string
}

export interface NumberSymbolFace {
  type: 'number'
  value: number
  countsTowardTotal: boolean
}

export interface ColorSymbolFace {
  type: 'color'
  value: string
  label: string
}

export type SymbolDieFace =
  | IconSymbolFace
  | LetterSymbolFace
  | NumberSymbolFace
  | ColorSymbolFace

export interface SymbolDieDefinition {
  id: string
  faces: SymbolDieFace[]
}

export interface DiceSet {
  id: string
  name: string
  diceCount: number
  sides: number
  diceColor: string
  pipColor: string
  modifier: DiceModifier
  symbolDice: SymbolDieDefinition[]
}

export interface DiceCombo {
  id: string
  name: string
  color: string
  setIds: string[]
}
