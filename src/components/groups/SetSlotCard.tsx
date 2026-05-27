import { copy } from '../../content/en'
import type { SetSlotDraft } from '../../domain/utils/groupDraftFactory'

interface SetSlotCardProps {
  slot: SetSlotDraft
  position: number
  combo?: {
    name: string
    color: string
  }
  onConfigure: () => void
  onRemove: () => void
}

export function SetSlotCard({
  slot,
  position,
  combo,
  onConfigure,
  onRemove,
}: SetSlotCardProps) {
  const set = slot.set
  const title = set?.name || `Set ${position}`
  const formula = set ? getSetFormula(set.diceCount, set.sides, set.symbolDice.length) : copy.groupEditor.setSlot.empty
  const modifierSummary =
    set?.modifier.enabled === true
      ? set.modifier.application === 'each-die'
        ? copy.groupEditor.setDialog.modifierSummary.eachDie(
            copy.groupEditor.setDialog.operators[set.modifier.operator],
            set.modifier.value,
          )
        : copy.groupEditor.setDialog.modifierSummary.setTotal(
            copy.groupEditor.setDialog.operators[set.modifier.operator],
            set.modifier.value,
          )
      : null

  return (
    <article
      className={`set-slot-card${set ? '' : ' set-slot-card--empty'}${combo ? ' set-slot-card--combo' : ''}`}
      style={combo ? { borderColor: combo.color } : undefined}
    >
      <div
        className="set-slot-card__die"
        aria-label={copy.groupEditor.setSlot.preview}
        style={
          set
            ? {
                backgroundColor: set.diceColor,
                color: set.pipColor,
                borderColor: set.pipColor,
              }
            : undefined
        }
      >
        {set ? formula : position}
      </div>
      <div className="set-slot-card__body">
        <h2>{title}</h2>
        <p>{modifierSummary ? `${formula} · ${modifierSummary}` : formula}</p>
        {combo ? (
          <p className="set-slot-card__combo-label">
            {copy.groupEditor.setSlot.comboLabel(combo.name)}
          </p>
        ) : null}
      </div>
      <div className="set-slot-card__actions">
        <button className="button-link" type="button" onClick={onConfigure}>
          {set ? copy.groupEditor.setSlot.edit : copy.groupEditor.setSlot.configure}
        </button>
        <button
          className="button-link button-link--danger"
          type="button"
          onClick={onRemove}
        >
          {copy.groupEditor.setSlot.remove}
        </button>
      </div>
    </article>
  )
}

function getSetFormula(diceCount: number, sides: number, symbolDiceCount: number): string {
  const numericPart = diceCount > 0 ? `${diceCount}d${sides}` : ''
  const symbolPart = symbolDiceCount > 0 ? `${symbolDiceCount} symbol` : ''
  return [numericPart, symbolPart].filter(Boolean).join(' + ')
}
