export type CoinFlipResult = 'Heads' | 'Tails'

export interface CoinFlipHistoryEntry {
  id: string
  result: CoinFlipResult
  createdAt: string
}

export interface RandomNumberHistoryEntry {
  id: string
  result: number
  min: 1
  max: number
  createdAt: string
}
