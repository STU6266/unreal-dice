import { useState } from 'react'
import { copy } from '../../content/en'
import { APP_LIMITS } from '../../domain/constants/limits'
import type { SymbolDieDefinition } from '../../domain/types/dice'
import { createEmptySymbolDie, copySymbolDice } from '../../domain/utils/symbolDiceUtils'
import { SymbolFaceView } from '../play/SymbolFaceView'
import { SymbolFaceEditorDialog } from './SymbolFaceEditorDialog'

interface SymbolDiceSetupDialogProps {
  numericDiceCount: number
  symbolDice: SymbolDieDefinition[]
  onCancel: () => void
  onSave: (symbolDice: SymbolDieDefinition[]) => void
}

export function SymbolDiceSetupDialog({
  numericDiceCount,
  symbolDice,
  onCancel,
  onSave,
}: SymbolDiceSetupDialogProps) {
  const [draftDice, setDraftDice] = useState(() => copySymbolDice(symbolDice))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const maxSymbolDice = Math.max(0, APP_LIMITS.maxDicePerSet - numericDiceCount)
  const hasInvalidDie = draftDice.some((die) => die.faces.length < 2)

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="symbol-dice-title"
      >
        <h2 id="symbol-dice-title">{copy.groupEditor.symbolDice.title}</h2>
        <p>{copy.groupEditor.symbolDice.description}</p>

        <div className="symbol-dice-list">
          {draftDice.map((die, index) => (
            <article className="symbol-die-card" key={die.id}>
              <div>
                <h3>{copy.groupEditor.symbolDice.dieTitle(index + 1)}</h3>
                <p>{copy.groupEditor.symbolDice.faceCount(die.faces.length)}</p>
              </div>
              <div className="symbol-face-samples">
                {die.faces.slice(0, 6).map((face, faceIndex) => (
                  <span className="history-die" key={`${faceIndex}-${face.type}`}>
                    <SymbolFaceView face={face} />
                  </span>
                ))}
              </div>
              <div className="confirm-dialog__actions">
                <button className="button-link" type="button" onClick={() => setEditingIndex(index)}>
                  {copy.groupEditor.symbolDice.editFaces}
                </button>
                <button className="button-link button-link--danger" type="button" onClick={() => removeDie(index)}>
                  {copy.groupEditor.symbolDice.remove}
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          className="button-link"
          type="button"
          disabled={draftDice.length >= maxSymbolDice}
          onClick={() => setDraftDice((current) => [...current, createEmptySymbolDie()])}
        >
          {copy.groupEditor.symbolDice.addDie}
        </button>

        {hasInvalidDie ? (
          <div className="status-message status-message--warning" role="status">
            {copy.groupEditor.symbolDice.invalid}
          </div>
        ) : null}

        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.groupEditor.setDialog.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            disabled={hasInvalidDie}
            onClick={() => onSave(draftDice)}
          >
            {copy.groupEditor.symbolDice.save}
          </button>
        </div>
      </section>

      {editingIndex !== null && draftDice[editingIndex] !== undefined ? (
        <SymbolFaceEditorDialog
          faces={draftDice[editingIndex].faces}
          onCancel={() => setEditingIndex(null)}
          onSave={(faces) => {
            setDraftDice((current) =>
              current.map((die, index) =>
                index === editingIndex ? { ...die, faces } : die,
              ),
            )
            setEditingIndex(null)
          }}
        />
      ) : null}
    </div>
  )

  function removeDie(indexToRemove: number): void {
    setDraftDice((current) => current.filter((_, index) => index !== indexToRemove))
  }
}
