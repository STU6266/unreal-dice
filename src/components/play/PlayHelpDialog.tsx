import { copy } from '../../content/en'

interface PlayHelpDialogProps {
  onClose: () => void
}

export function PlayHelpDialog({ onClose }: PlayHelpDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog play-help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-help-title"
      >
        <h2 id="play-help-title">{copy.play.help.title}</h2>
        <ul className="help-list">
          {copy.play.help.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onClose}>
            {copy.play.actions.close}
          </button>
        </div>
      </section>
    </div>
  )
}
