import { copy } from '../../content/en'

interface ImportConfirmDialogProps {
  groupCount: number
  onCancel: () => void
  onConfirm: () => void
}

export function ImportConfirmDialog({
  groupCount,
  onCancel,
  onConfirm,
}: ImportConfirmDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
      >
        <h2 id="import-dialog-title">{copy.backup.importConfirm.title}</h2>
        <p>{copy.backup.importConfirm.message(groupCount)}</p>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.backup.importConfirm.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={onConfirm}
          >
            {copy.backup.importConfirm.confirm}
          </button>
        </div>
      </section>
    </div>
  )
}
