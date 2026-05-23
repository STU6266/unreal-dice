import { copy } from '../../content/en'
import { UnsavedChangesDialog } from '../groups/UnsavedChangesDialog'

interface StudioDeleteTemplateDialogProps {
  templateName: string
  onCancel: () => void
  onConfirm: () => void
}

export function StudioDeleteTemplateDialog({
  templateName,
  onCancel,
  onConfirm,
}: StudioDeleteTemplateDialogProps) {
  return (
    <UnsavedChangesDialog
      title={copy.studio.deleteDialog.title}
      message={copy.studio.deleteDialog.message(templateName)}
      confirmLabel={copy.studio.actions.delete}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
