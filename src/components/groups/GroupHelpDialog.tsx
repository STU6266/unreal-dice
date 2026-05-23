import { copy } from '../../content/en'

interface GroupHelpDialogProps {
  onClose: () => void
}

export function GroupHelpDialog({ onClose }: GroupHelpDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-help-title"
      >
        <h2 id="group-help-title">{copy.groupEditor.help.title}</h2>
        <ul className="help-list">
          {copy.groupEditor.help.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onClose}>
            {copy.groupEditor.help.close}
          </button>
        </div>
      </section>
    </div>
  )
}
