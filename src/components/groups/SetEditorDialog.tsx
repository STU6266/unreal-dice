import { useState } from 'react'
import { copy } from '../../content/en'
import { APP_LIMITS } from '../../domain/constants/limits'
import type { DiceSet } from '../../domain/types/dice'
import { hasReadableColorContrast } from '../../domain/utils/colorContrast'
import {
  createEmptySetInput,
  createSetFromInput,
  createSetInputFromSet,
  type SetInput,
} from '../../domain/utils/setFactory'
import { SymbolDiceSetupDialog } from './SymbolDiceSetupDialog'

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
  modifierValue?: string
  symbolDice?: string
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
  const [isSymbolSetupOpen, setIsSymbolSetupOpen] = useState(false)
  const hasLowContrast = !hasReadableColorContrast(input.pipColor, input.diceColor)

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
              min={0}
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

          <div className="field">
            <span>{copy.groupEditor.setDialog.fields.symbolDice}</span>
            <button className="button-link" type="button" onClick={() => setIsSymbolSetupOpen(true)}>
              {copy.groupEditor.setDialog.fields.configureSymbolDice}
            </button>
            <small>{copy.groupEditor.setDialog.symbolDiceSummary(input.symbolDice.length)}</small>
            {errors.symbolDice ? (
              <small className="field-error">{errors.symbolDice}</small>
            ) : null}
          </div>

          <div className="field field--color">
            <span id="dice-color-label">{copy.groupEditor.setDialog.fields.diceColor}</span>
            <input
              type="color"
              value={input.diceColor}
              aria-labelledby="dice-color-label"
              aria-describedby={errors.diceColor ? 'dice-color-error' : undefined}
              onChange={(event) => updateInput('diceColor', event.target.value)}
            />
            {errors.diceColor ? (
              <small className="field-error" id="dice-color-error">
                {errors.diceColor}
              </small>
            ) : null}
          </div>

          <div className="field field--color">
            <span id="pip-color-label">{copy.groupEditor.setDialog.fields.pipColor}</span>
            <input
              type="color"
              value={input.pipColor}
              aria-labelledby="pip-color-label"
              aria-describedby={errors.pipColor ? 'pip-color-error' : undefined}
              onChange={(event) => updateInput('pipColor', event.target.value)}
            />
            {errors.pipColor ? (
              <small className="field-error" id="pip-color-error">
                {errors.pipColor}
              </small>
            ) : null}
          </div>

          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={input.modifier.enabled}
              onChange={(event) =>
                updateInput('modifier', {
                  ...input.modifier,
                  enabled: event.target.checked,
                })
              }
            />
            <span>{copy.groupEditor.setDialog.fields.enableModifier}</span>
          </label>

          {input.modifier.enabled ? (
            <>
              <label className="field">
                <span>{copy.groupEditor.setDialog.fields.modifierOperator}</span>
                <select
                  value={input.modifier.operator}
                  onChange={(event) =>
                    updateInput('modifier', {
                      ...input.modifier,
                      operator: event.target.value as typeof input.modifier.operator,
                    })
                  }
                >
                  <option value="add">{copy.groupEditor.setDialog.operators.add}</option>
                  <option value="subtract">{copy.groupEditor.setDialog.operators.subtract}</option>
                  <option value="multiply">{copy.groupEditor.setDialog.operators.multiply}</option>
                  <option value="divide">{copy.groupEditor.setDialog.operators.divide}</option>
                </select>
              </label>

              <label className="field">
                <span>{copy.groupEditor.setDialog.fields.modifierValue}</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={input.modifier.value}
                  aria-describedby={errors.modifierValue ? 'modifier-value-error' : 'modifier-help'}
                  onChange={(event) =>
                    updateInput('modifier', {
                      ...input.modifier,
                      value: Number(event.target.value),
                    })
                  }
                />
                {errors.modifierValue ? (
                  <small className="field-error" id="modifier-value-error">
                    {errors.modifierValue}
                  </small>
                ) : null}
              </label>

              <label className="field">
                <span>{copy.groupEditor.setDialog.fields.modifierApplication}</span>
                <select
                  value={input.modifier.application}
                  onChange={(event) =>
                    updateInput('modifier', {
                      ...input.modifier,
                      application: event.target.value as typeof input.modifier.application,
                    })
                  }
                >
                  <option value="each-die">{copy.groupEditor.setDialog.fields.eachDie}</option>
                  <option value="set-total">{copy.groupEditor.setDialog.fields.setTotal}</option>
                </select>
                <small id="modifier-help">{copy.groupEditor.setDialog.modifierHelp}</small>
              </label>
            </>
          ) : null}
        </div>

        {hasLowContrast ? (
          <div className="status-message status-message--warning" role="status">
            {copy.groupEditor.setDialog.contrastWarning}
          </div>
        ) : null}

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

        {isSymbolSetupOpen ? (
          <SymbolDiceSetupDialog
            numericDiceCount={input.diceCount}
            symbolDice={input.symbolDice}
            onCancel={() => setIsSymbolSetupOpen(false)}
            onSave={(symbolDice) => {
              updateInput('symbolDice', symbolDice)
              setIsSymbolSetupOpen(false)
            }}
          />
        ) : null}
      </section>
    </div>
  )
}

function validateInput(input: SetInput): SetEditorErrors {
  const errors: SetEditorErrors = {}

  if (
    !Number.isInteger(input.diceCount) ||
    input.diceCount < 0 ||
    input.diceCount > APP_LIMITS.maxDicePerSet
  ) {
    errors.diceCount = copy.groupEditor.setDialog.errors.diceCount(
      APP_LIMITS.maxDicePerSet,
    )
  }

  if (input.diceCount > 0 && (
    !Number.isInteger(input.sides) ||
    input.sides < APP_LIMITS.minSidesPerDie ||
    input.sides > APP_LIMITS.maxSidesPerDie
  )) {
    errors.sides = copy.groupEditor.setDialog.errors.sides(
      APP_LIMITS.minSidesPerDie,
      APP_LIMITS.maxSidesPerDie,
    )
  }

  if (input.diceCount + input.symbolDice.length < 1) {
    errors.diceCount = copy.groupEditor.setDialog.errors.totalDice
  }

  if (input.diceCount + input.symbolDice.length > APP_LIMITS.maxDicePerSet) {
    errors.symbolDice = copy.groupEditor.setDialog.errors.totalDiceMax(APP_LIMITS.maxDicePerSet)
  }

  if (input.symbolDice.some((die) => die.faces.length < 2)) {
    errors.symbolDice = copy.groupEditor.setDialog.errors.symbolDice
  }

  if (input.diceColor.trim() === '') {
    errors.diceColor = copy.groupEditor.setDialog.errors.diceColor
  }

  if (input.pipColor.trim() === '') {
    errors.pipColor = copy.groupEditor.setDialog.errors.pipColor
  }

  if (
    input.modifier.enabled &&
    (!Number.isInteger(input.modifier.value) ||
      input.modifier.value < 1 ||
      input.modifier.value > 100)
  ) {
    errors.modifierValue = copy.groupEditor.setDialog.errors.modifierValue
  }

  return errors
}
