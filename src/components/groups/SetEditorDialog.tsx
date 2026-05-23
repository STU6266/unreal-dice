import { useState } from 'react'
import { copy } from '../../content/en'
import { APP_LIMITS } from '../../domain/constants/limits'
import type { DiceSet } from '../../domain/types/dice'
import {
  createEmptySetInput,
  createSetFromInput,
  createSetInputFromSet,
  type SetInput,
} from '../../domain/utils/setFactory'

interface SetEditorDialogProps {
  set: DiceSet | null
  slotPosition: number
  onCancel: () => void
  onSave: (set: DiceSet) => void
}

interface SetEditorErrors {
  diceCount?: string
  sides?: string
  diceColor?: string
  pipColor?: string
}

export function SetEditorDialog({
  set,
  slotPosition,
  onCancel,
  onSave,
}: SetEditorDialogProps) {
  const [input, setInput] = useState<SetInput>(() =>
    set ? createSetInputFromSet(set) : createEmptySetInput(),
  )
  const [errors, setErrors] = useState<SetEditorErrors>({})

  function updateInput<Key extends keyof SetInput>(
    key: Key,
    value: SetInput[Key],
  ): void {
    setInput((current) => ({ ...current, [key]: value }))
  }

  function saveSet(): void {
    const nextErrors = validateInput(input)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSave(createSetFromInput(input, slotPosition))
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-editor-title"
      >
        <h2 id="set-editor-title">
          {set ? copy.groupEditor.setDialog.titleEdit : copy.groupEditor.setDialog.titleNew}
        </h2>

        <div className="form-grid">
          <label className="field">
            <span>{copy.groupEditor.setDialog.fields.name}</span>
            <input
              type="text"
              value={input.name}
              aria-describedby="set-name-hint"
              onChange={(event) => updateInput('name', event.target.value)}
            />
            <small id="set-name-hint">
              {copy.groupEditor.setDialog.optionalNameHint}
            </small>
          </label>

          <label className="field">
            <span>{copy.groupEditor.setDialog.fields.diceCount}</span>
            <input
              type="number"
              min={1}
              max={APP_LIMITS.maxDicePerSet}
              value={input.diceCount}
              aria-describedby={errors.diceCount ? 'dice-count-error' : undefined}
              onChange={(event) =>
                updateInput('diceCount', Number(event.target.value))
              }
            />
            {errors.diceCount ? (
              <small className="field-error" id="dice-count-error">
                {errors.diceCount}
              </small>
            ) : null}
          </label>

          <label className="field">
            <span>{copy.groupEditor.setDialog.fields.sides}</span>
            <input
              type="number"
              min={APP_LIMITS.minSidesPerDie}
              max={APP_LIMITS.maxSidesPerDie}
              value={input.sides}
              aria-describedby={errors.sides ? 'sides-error' : undefined}
              onChange={(event) => updateInput('sides', Number(event.target.value))}
            />
            {errors.sides ? (
              <small className="field-error" id="sides-error">
                {errors.sides}
              </small>
            ) : null}
          </label>

          <label className="field field--color">
            <span>{copy.groupEditor.setDialog.fields.diceColor}</span>
            <input
              type="color"
              value={input.diceColor}
              aria-describedby={errors.diceColor ? 'dice-color-error' : undefined}
              onChange={(event) => updateInput('diceColor', event.target.value)}
            />
            {errors.diceColor ? (
              <small className="field-error" id="dice-color-error">
                {errors.diceColor}
              </small>
            ) : null}
          </label>

          <label className="field field--color">
            <span>{copy.groupEditor.setDialog.fields.pipColor}</span>
            <input
              type="color"
              value={input.pipColor}
              aria-describedby={errors.pipColor ? 'pip-color-error' : undefined}
              onChange={(event) => updateInput('pipColor', event.target.value)}
            />
            {errors.pipColor ? (
              <small className="field-error" id="pip-color-error">
                {errors.pipColor}
              </small>
            ) : null}
          </label>
        </div>

        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.groupEditor.setDialog.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={saveSet}
          >
            {copy.groupEditor.setDialog.save}
          </button>
        </div>
      </section>
    </div>
  )
}

function validateInput(input: SetInput): SetEditorErrors {
  const errors: SetEditorErrors = {}

  if (
    !Number.isInteger(input.diceCount) ||
    input.diceCount < 1 ||
    input.diceCount > APP_LIMITS.maxDicePerSet
  ) {
    errors.diceCount = copy.groupEditor.setDialog.errors.diceCount(
      APP_LIMITS.maxDicePerSet,
    )
  }

  if (
    !Number.isInteger(input.sides) ||
    input.sides < APP_LIMITS.minSidesPerDie ||
    input.sides > APP_LIMITS.maxSidesPerDie
  ) {
    errors.sides = copy.groupEditor.setDialog.errors.sides(
      APP_LIMITS.minSidesPerDie,
      APP_LIMITS.maxSidesPerDie,
    )
  }

  if (input.diceColor.trim() === '') {
    errors.diceColor = copy.groupEditor.setDialog.errors.diceColor
  }

  if (input.pipColor.trim() === '') {
    errors.pipColor = copy.groupEditor.setDialog.errors.pipColor
  }

  return errors
}
