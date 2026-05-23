import type { LockedDiceCounting } from './dice'

export interface IndividualDieResult {
  value: number
  locked: boolean
}

export interface SetHistoryEntry {
  id: string
  setId: string
  setName: string
  diceCount: number
  sides: number
  diceResults: IndividualDieResult[]
  modifier: number
  lockedDiceCounting: LockedDiceCounting
  total: number
  rolledAt: string
}
