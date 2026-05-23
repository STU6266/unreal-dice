import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RandomHistoryDialog } from '../components/random/RandomHistoryDialog'
import { ResultToken } from '../components/random/ResultToken'
import { copy } from '../content/en'
import type { CoinFlipResult } from '../domain/types/random'
import {
  createCoinFlipHistoryEntry,
  createCoinFlipResult,
} from '../domain/utils/randomResultFactory'
import {
  addCoinFlipHistoryEntry,
  clearCoinFlipHistory,
  loadCoinFlipHistory,
} from '../services/randomHistoryService'

const RESULT_MOTION_MS = 420

export function CoinFlipScreen() {
  const [result, setResult] = useState<CoinFlipResult | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState(() => loadCoinFlipHistory())
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  function flipCoin(): void {
    if (isAnimating) {
      return
    }

    setIsAnimating(true)
    const nextResult = createCoinFlipResult()
    window.setTimeout(() => {
      setResult(nextResult)
      setHistory(addCoinFlipHistoryEntry(createCoinFlipHistoryEntry(nextResult)))
      setIsAnimating(false)
    }, RESULT_MOTION_MS)
  }

  function clearHistory(): void {
    clearCoinFlipHistory()
    setHistory([])
  }

  return (
    <section className="random-mode-screen" aria-labelledby="coin-flip-title">
      <div className="screen-heading">
        <h1 id="coin-flip-title">{copy.random.coin.title}</h1>
        <p>{copy.random.coin.instruction}</p>
      </div>

      <ResultToken
        label={copy.random.coin.tokenLabel}
        result={result}
        isAnimating={isAnimating}
        onPress={flipCoin}
        onHistory={() => setIsHistoryOpen(true)}
      />

      <div className="random-mode-actions">
        <button className="button-link" type="button" onClick={() => setIsHistoryOpen(true)}>
          {copy.random.coin.historyAction}
        </button>
        <Link className="button-link" to="/random">
          {copy.random.coin.back}
        </Link>
      </div>

      {isHistoryOpen ? (
        <RandomHistoryDialog
          mode="coin"
          entries={history}
          onClear={clearHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </section>
  )
}
