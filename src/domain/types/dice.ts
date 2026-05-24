export type LockedDiceCounting = 'exclude' | 'include'
export type ModifierOperator = 'add' | 'subtract' | 'multiply' | 'divide'
export type ModifierApplication = 'each-die' | 'set-total'

export interface DiceModifier {
  enabled: boolean
  operator: ModifierOperator
  value: number
  application: ModifierApplication
}

export interface DiceSet {
  id: string
  name: string
  diceCount: number
  sides: number
  diceColor: string
  pipColor: string
  modifier: DiceModifier
}

export interface DiceCombo {
  id: string
  name: string
  color: string
  setIds: string[]
}
