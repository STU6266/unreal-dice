import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { RandomHistoryDialog } from '../components/random/RandomHistoryDialog'
import { ResultToken } from '../components/random/ResultToken'
import { copy } from '../content/en'
import {
  createRandomNumberHistoryEntry,
  createRandomNumberResult,
  isValidRandomMax,
} from '../domain/utils/randomResultFactory'
import {
  addRandomNumberHistoryEntry,
  clearRandomNumberHistory,
  loadRandomNumberHistory,
} from '../services/randomHistoryService'

const RESULT_MOTION_MS = 420

export function RandomNumberScreen() {
  const [searchParams] = useSearchParams()
  const max = Number(searchParams.get('max'))
  const [result, setResult] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [history, setHistory] = useState(() => loadRandomNumberHistory())
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  if (!isValidRandomMax(max)) {
    return <Navigate to="/random" replace />
  }

  function generateNumber(): void {
    if (isAnimating) {
      return
    }

    setIsAnimating(true)
    const nextResult = createRandomNumberResult(max)
    window.setTimeout(() => {
      setResult(nextResult)
      setHistory(
        addRandomNumberHistoryEntry(
          createRandomNumberHistoryEntry(nextResult, max),
        ),
      )
      setIsAnimating(false)
    }, RESULT_MOTION_MS)
  }

  function clearHistory(): void {
    clearRandomNumberHistory()
    setHistory([])
  }

  return (
    <section className="random-mode-screen" aria-labelledby="random-number-title">
      <div className="screen-heading">
        <h1 id="random-number-title">{copy.random.number.title(max)}</h1>
        <p>{copy.random.number.instruction}</p>
      </div>

      <ResultToken
        label={copy.random.number.tokenLabel(max)}
        result={result === null ? null : String(result)}
        isAnimating={isAnimating}
        onPress={generateNumber}
        onHistory={() => setIsHistoryOpen(true)}
      />

      <div className="random-mode-actions">
        <button className="button-link" type="button" onClick={() => setIsHistoryOpen(true)}>
          {copy.random.number.historyAction}
        </button>
        <Link className="button-link" to="/random">
          {copy.random.number.back}
        </Link>
      </div>

      {isHistoryOpen ? (
        <RandomHistoryDialog
          mode="number"
          entries={history}
          onClear={clearHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </section>
  )
}
