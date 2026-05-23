import { useState } from 'react'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { copy } from '../../content/en'
import { APP_LIMITS } from '../../domain/constants/limits'
import type { DiceCombo, DiceSet } from '../../domain/types/dice'
import {
  createComboFromInput,
  createComboInput,
  createComboInputFromCombo,
  findComboForSet,
  hasDuplicateComboAssignments,
  moveSetToCombo,
  upsertCombo,
  type ComboInput,
} from '../../domain/utils/comboFactory'

interface ComboEditorDialogProps {
  combo: DiceCombo | null
  combos: readonly DiceCombo[]
  sets: readonly DiceSet[]
  onCancel: () => void
  onSave: (combo: DiceCombo, updatedCombos: DiceCombo[]) => void
}

interface ComboEditorErrors {
  name?: string
  color?: string
  sets?: string
}

interface PendingMove {
  setId: string
  setName: string
  fromCombo: DiceCombo
}

export function ComboEditorDialog({
  combo,
  combos,
  sets,
  onCancel,
  onSave,
}: ComboEditorDialogProps) {
  const [input, setInput] = useState<ComboInput>(() =>
    combo ? createComboInputFromCombo(combo) : createComboInput(combos),
  )
  const [errors, setErrors] = useState<ComboEditorErrors>({})
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)

  function toggleSet(set: DiceSet): void {
    if (input.setIds.includes(set.id)) {
      setInput((current) => ({
        ...current,
        setIds: current.setIds.filter((setId) => setId !== set.id),
      }))
      return
    }

    const existingCombo = findComboForSet(combos, set.id, input.id)
    if (existingCombo !== undefined) {
      setPendingMove({ setId: set.id, setName: set.name, fromCombo: existingCombo })
      return
    }

    setInput((current) => ({ ...current, setIds: [...current.setIds, set.id] }))
  }

  function confirmMove(): void {
    if (pendingMove === null) {
      return
    }

    setInput((current) => ({
      ...current,
      setIds: [...current.setIds, pendingMove.setId],
    }))
    setPendingMove(null)
  }

  function saveCombo(): void {
    const nextErrors = validateInput(input, combo, combos)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const result = createComboFromInput(input, sets, combos)
    if (!result.ok) {
      setErrors({ sets: result.message })
      return
    }

    const combosAfterMoves = input.setIds.reduce(
      (currentCombos, setId) => moveSetToCombo(currentCombos, setId, result.combo.id),
      combos,
    )
    const updatedCombos = upsertCombo(combosAfterMoves, result.combo)

    if (hasDuplicateComboAssignments(updatedCombos)) {
      setErrors({ sets: copy.groupEditor.comboDialog.errors.duplicateAssignment })
      return
    }

    onSave(result.combo, updatedCombos)
  }

  const targetComboName = input.name.trim() || copy.groupEditor.comboDialog.titleNew

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="combo-editor-title"
      >
        <h2 id="combo-editor-title">
          {combo ? copy.groupEditor.comboDialog.titleEdit : copy.groupEditor.comboDialog.titleNew}
        </h2>

        <div className="form-grid">
          <label className="field">
            <span>{copy.groupEditor.comboDialog.fields.name}</span>
            <input
              type="text"
              value={input.name}
              aria-describedby={errors.name ? 'combo-name-error' : undefined}
              onChange={(event) =>
                setInput((current) => ({ ...current, name: event.target.value }))
              }
            />
            {errors.name ? (
              <small className="field-error" id="combo-name-error">
                {errors.name}
              </small>
            ) : null}
          </label>

          <label className="field field--color">
            <span>{copy.groupEditor.comboDialog.fields.color}</span>
            <input
              type="color"
              value={input.color}
              aria-describedby={errors.color ? 'combo-color-error' : undefined}
              onChange={(event) =>
                setInput((current) => ({ ...current, color: event.target.value }))
              }
            />
            {errors.color ? (
              <small className="field-error" id="combo-color-error">
                {errors.color}
              </small>
            ) : null}
          </label>
        </div>

        <fieldset className="combo-set-picker">
          <legend>{copy.groupEditor.comboDialog.fields.sets}</legend>
          {sets.map((set) => {
            const selected = input.setIds.includes(set.id)
            return (
              <button
                key={set.id}
                className={`combo-set-option${selected ? ' combo-set-option--selected' : ''}`}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleSet(set)}
              >
                <span>{set.name}</span>
                <strong>
                  {set.diceCount}d{set.sides}
                </strong>
                <em>
                  {selected
                    ? copy.groupEditor.comboDialog.selected
                    : copy.groupEditor.comboDialog.notSelected}
                </em>
              </button>
            )
          })}
        </fieldset>
        {errors.sets ? <p className="field-error">{errors.sets}</p> : null}

        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.groupEditor.comboDialog.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={saveCombo}
          >
            {copy.groupEditor.comboDialog.confirm}
          </button>
        </div>

        {pendingMove ? (
          <UnsavedChangesDialog
            title={copy.groupEditor.comboDialog.moveTitle}
            message={copy.groupEditor.comboDialog.moveMessage(
              pendingMove.setName,
              pendingMove.fromCombo.name,
              targetComboName,
            )}
            confirmLabel={copy.groupEditor.comboDialog.moveSet}
            onCancel={() => setPendingMove(null)}
            onConfirm={confirmMove}
          />
        ) : null}
      </section>
    </div>
  )
}

function validateInput(
  input: ComboInput,
  combo: DiceCombo | null,
  combos: readonly DiceCombo[],
): ComboEditorErrors {
  const errors: ComboEditorErrors = {}

  if (input.name.trim() === '') {
    errors.name = copy.groupEditor.comboDialog.errors.name
  } else if (
    combos.some(
      (item) =>
        item.id !== input.id &&
        item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
    )
  ) {
    errors.name = copy.groupEditor.comboDialog.errors.duplicateName
  }

  if (input.color.trim() === '') {
    errors.color = copy.groupEditor.comboDialog.errors.color
  }

  if (input.setIds.length === 0) {
    errors.sets = copy.groupEditor.comboDialog.errors.sets
  } else if (input.setIds.length > APP_LIMITS.maxSetsPerCombo) {
    errors.sets = copy.groupEditor.comboDialog.errors.maxSets(
      APP_LIMITS.maxSetsPerCombo,
    )
  }

  if (combo === null && combos.length >= APP_LIMITS.maxCombosPerGroup) {
    errors.sets = copy.groupEditor.comboDialog.errors.maxCombos(
      APP_LIMITS.maxCombosPerGroup,
    )
  }

  return errors
}
