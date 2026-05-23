import { Link } from 'react-router-dom'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { copy } from '../content/en'

export function InstallAppScreen() {
  const { canPromptInstall, isInstalled, promptInstall } = useInstallPrompt()

  return (
    <section className="list-screen install-screen" aria-labelledby="install-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.install.eyebrow}</p>
        <h1 id="install-title">{copy.install.title}</h1>
        <p>{copy.install.description}</p>
      </div>

      <div className="install-status-panel">
        {isInstalled ? (
          <p>{copy.install.status.installed}</p>
        ) : canPromptInstall ? (
          <>
            <p>{copy.install.status.promptAvailable}</p>
            <button
              className="button-link button-link--primary"
              type="button"
              onClick={() => void promptInstall()}
            >
              {copy.install.actions.install}
            </button>
          </>
        ) : (
          <p>{copy.install.status.manual}</p>
        )}
      </div>

      <div className="install-instructions">
        {copy.install.instructions.map((section) => (
          <section key={section.title} className="install-instruction-card">
            <h2>{section.title}</h2>
            <ol>
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="backup-warning">{copy.install.offlineWarning}</div>

      <Link className="text-link" to="/">
        {copy.install.actions.backHome}
      </Link>
    </section>
  )
}
