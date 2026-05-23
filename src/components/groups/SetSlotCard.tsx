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
  const formula = set ? `${set.diceCount}d${set.sides}` : copy.groupEditor.setSlot.empty

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
        <p>{formula}</p>
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
