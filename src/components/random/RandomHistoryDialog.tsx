import { useState } from 'react'
import { copy } from '../../content/en'
import type {
  CoinFlipHistoryEntry,
  RandomNumberHistoryEntry,
} from '../../domain/types/random'

interface RandomHistoryDialogProps {
  mode: 'coin' | 'number'
  entries: readonly (CoinFlipHistoryEntry | RandomNumberHistoryEntry)[]
  onClear: () => void
  onClose: () => void
}

export function RandomHistoryDialog({
  mode,
  entries,
  onClear,
  onClose,
}: RandomHistoryDialogProps) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const historyCopy = mode === 'coin' ? copy.random.coin.history : copy.random.number.history

  function confirmClear(): void {
    onClear()
    setIsConfirmingClear(false)
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog random-history-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="random-history-title"
      >
        <h2 id="random-history-title">{historyCopy.title}</h2>

        {entries.length === 0 ? (
          <p className="random-history-empty">{copy.random.history.empty}</p>
        ) : (
          <ol className="random-history-list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.result}</strong>
                {'max' in entry ? (
                  <span>
                    {copy.random.number.history.range(entry.min, entry.max)}
                  </span>
                ) : null}
                <time dateTime={entry.createdAt}>
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        )}

        {isConfirmingClear ? (
          <div className="inline-confirmation" role="alert">
            <p>{historyCopy.clearMessage}</p>
            <div className="confirm-dialog__actions">
              <button
                className="button-link"
                type="button"
                onClick={() => setIsConfirmingClear(false)}
              >
                {copy.random.history.cancel}
              </button>
              <button
                className="button-link button-link--danger"
                type="button"
                onClick={confirmClear}
              >
                {copy.random.history.clear}
              </button>
            </div>
          </div>
        ) : (
          <div className="confirm-dialog__actions">
            <button
              className="button-link button-link--danger"
              type="button"
              onClick={() => setIsConfirmingClear(true)}
            >
              {copy.random.history.clearHistory}
            </button>
            <button className="button-link" type="button" onClick={onClose}>
              {copy.random.history.close}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
