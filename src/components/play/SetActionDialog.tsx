import { copy } from '../../content/en'

interface SetActionDialogProps {
  setName: string
  source: 'quick-start' | 'saved'
  onHistory: () => void
  onSetSetup: () => void
  onCopyToEdit: () => void
  onClose: () => void
}

export function SetActionDialog({
  setName,
  source,
  onHistory,
  onSetSetup,
  onCopyToEdit,
  onClose,
}: SetActionDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-action-title"
      >
        <h2 id="set-action-title">{copy.play.setAction.title(setName)}</h2>
        <div className="set-action-list">
          <button className="button-link" type="button" onClick={onHistory}>
            {copy.play.actions.history}
          </button>
          {source === 'saved' ? (
            <button className="button-link" type="button" onClick={onSetSetup}>
              {copy.play.actions.setSetup}
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
