import type { DiceCombo, DiceSet, LockedDiceCounting } from './dice'

export type GroupSource = 'user' | 'quick-start' | 'quick-start-copy' | 'imported'

export interface DiceGroup {
  id: string
  name: string
  source: GroupSource
  lockedDiceCounting: LockedDiceCounting
  sets: DiceSet[]
  combos: DiceCombo[]
  createdAt: string
  updatedAt: string
}
