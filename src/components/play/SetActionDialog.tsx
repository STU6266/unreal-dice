import { copy } from '../../content/en'
import type { DiceSet } from '../../domain/types/dice'

interface SetActionDialogProps {
  set: DiceSet
  source: 'quick-start' | 'saved'
  setModifierActive: boolean
  onHistory: () => void
  onToggleModifier: () => void
  onModifierSetup: () => void
  onCopyToEdit: () => void
  onClose: () => void
}

export function SetActionDialog({
  set,
  source,
  setModifierActive,
  onHistory,
  onToggleModifier,
  onModifierSetup,
  onCopyToEdit,
  onClose,
}: SetActionDialogProps) {
  const canToggleSetModifier = set.modifier.enabled && set.modifier.application === 'set-total'

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-action-title"
      >
        <h2 id="set-action-title">{set.name}</h2>
        <div className="set-action-list">
          <button className="button-link" type="button" onClick={onHistory}>
            {copy.play.history.title(set.name)}
          </button>
          {canToggleSetModifier ? (
            <button className="button-link" type="button" onClick={onToggleModifier}>
              {setModifierActive
                ? copy.play.actions.turnModifierOff
                : copy.play.actions.turnModifierOn}
            </button>
          ) : null}
          {source === 'saved' ? (
            <button className="button-link" type="button" onClick={onModifierSetup}>
              {copy.play.actions.modifierSetup}
            </button>
          ) : (
            <button className="button-link" type="button" onClick={onCopyToEdit}>
              {copy.play.actions.copyToEdit}
            </button>
          )}
          <button className="button-link" type="button" onClick={onClose}>
            {copy.play.actions.close}
          </button>
        </div>
      </section>
    </div>
  )
}
