export type LockedDiceCounting = 'exclude' | 'include'

export interface DiceSet {
  id: string
  name: string
  diceCount: number
  sides: number
  diceColor: string
  pipColor: string
  modifier: number
}

export interface DiceCombo {
  id: string
  name: string
  color: string
  setIds: string[]
}
