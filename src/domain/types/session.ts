import type { IndividualDieResult } from './history'

export interface SetPlayState {
  setId: string
  isExpanded: boolean
  diceResults: IndividualDieResult[]
  total: number | null
}

// I keep temporary roll results and locked dice outside saved groups so play sessions cannot accidentally rewrite setup data.
export interface GroupPlaySession {
  groupId: string
  setStates: Record<string, SetPlayState>
  lastRollAllTotal: number | null
  comboTotals: Record<string, number | null>
}
