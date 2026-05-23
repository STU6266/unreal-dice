import { copy } from '../../content/en'

interface UnsavedChangesDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export function UnsavedChangesDialog({
  title,
  message,
  confirmLabel = copy.groupEditor.confirmations.confirm,
  onCancel,
  onConfirm,
}: UnsavedChangesDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-confirmation-title"
      >
        <h2 id="editor-confirmation-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.groupEditor.confirmations.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
