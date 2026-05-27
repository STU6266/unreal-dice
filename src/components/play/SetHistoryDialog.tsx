import { useState } from 'react'
import { copy } from '../../content/en'
import type { SetHistoryEntry } from '../../domain/types/history'
import { SymbolFaceView } from './SymbolFaceView'

interface SetHistoryDialogProps {
  setName: string
  entries: readonly SetHistoryEntry[]
  onClear: () => void
  onClose: () => void
}

export function SetHistoryDialog({
  setName,
  entries,
  onClear,
  onClose,
}: SetHistoryDialogProps) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)

  function confirmClear(): void {
    onClear()
    setIsConfirmingClear(false)
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog set-history-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-history-title"
      >
        <h2 id="set-history-title">{copy.play.history.title(setName)}</h2>

        {entries.length === 0 ? (
          <p className="random-history-empty">{copy.play.history.empty}</p>
        ) : (
          <ol className="set-history-list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>
                    {entry.total === null
                      ? copy.play.history.noTotal
                      : copy.play.history.total(entry.total)}
                  </strong>
                  <span>
                    {entry.lockedDiceCounting === 'include'
                      ? copy.play.history.included
                      : copy.play.history.excluded}
                  </span>
                  <time dateTime={entry.rolledAt}>
                    {new Date(entry.rolledAt).toLocaleTimeString()}
                  </time>
                </div>
                <div className="history-dice-row">
                  {entry.diceResults.map((die, index) => (
                    <span key={index} className="history-die">
                      {die.symbolFace !== undefined ? (
                        <SymbolFaceView face={die.symbolFace} />
                      ) : die.value === 0 ? '—' : die.value}
                      {die.mode === 'locked' ? <em>X</em> : null}
                      {die.mode === 'modifier-active' ? (
                        <em>
                          {copy.groupEditor.setDialog.operators[entry.modifier.operator]}
                          {entry.modifier.value}
                        </em>
                      ) : null}
                    </span>
                  ))}
                </div>
                {entry.modifier.enabled && entry.modifier.application === 'set-total' ? (
                  <span>
                    {entry.setModifierActive
                      ? copy.groupEditor.setDialog.modifierSummary.setTotal(
                          copy.groupEditor.setDialog.operators[entry.modifier.operator],
                          entry.modifier.value,
                        )
                      : copy.play.history.modifierOff}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        )}

        {isConfirmingClear ? (
          <div className="inline-confirmation" role="alert">
            <p>{copy.play.history.clearMessage(setName)}</p>
            <div className="confirm-dialog__actions">
              <button
                className="button-link"
                type="button"
                onClick={() => setIsConfirmingClear(false)}
              >
                {copy.play.actions.cancel}
              </button>
              <button
                className="button-link button-link--danger"
                type="button"
                onClick={confirmClear}
              >
                {copy.play.actions.clear}
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
              {copy.play.actions.clearHistory}
            </button>
            <button className="button-link" type="button" onClick={onClose}>
              {copy.play.actions.close}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
