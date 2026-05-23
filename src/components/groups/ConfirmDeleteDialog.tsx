import { copy } from '../../content/en'

interface ConfirmDeleteDialogProps {
  groupName: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteDialog({
  groupName,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <h2 id="delete-dialog-title">{copy.myGroups.deleteDialog.title}</h2>
        <p>{copy.myGroups.deleteDialog.message(groupName)}</p>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.myGroups.deleteDialog.cancel}
          </button>
          <button
            className="button-link button-link--danger"
            type="button"
            onClick={onConfirm}
          >
            {copy.myGroups.deleteDialog.confirm}
          </button>
        </div>
      </section>
    </div>
  )
}
