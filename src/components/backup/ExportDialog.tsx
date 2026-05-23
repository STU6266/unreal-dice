import { copy } from '../../content/en'

interface ExportDialogProps {
  groupName?: string
  groupCount: number
  onCancel: () => void
  onConfirm: () => void
}

export function ExportDialog({
  groupName,
  groupCount,
  onCancel,
  onConfirm,
}: ExportDialogProps) {
  const isSingleGroup = groupName !== undefined

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
      >
        <h2 id="export-dialog-title">
          {isSingleGroup
            ? copy.backup.exportDialog.titleSingle
            : copy.backup.exportDialog.titleAll}
        </h2>
        <p>
          {isSingleGroup
            ? copy.backup.exportDialog.messageSingle(groupName)
            : copy.backup.exportDialog.messageAll(groupCount)}
        </p>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.backup.exportDialog.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={onConfirm}
          >
            {copy.backup.exportDialog.confirm}
          </button>
        </div>
      </section>
    </div>
  )
}
