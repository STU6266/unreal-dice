import { useRegisterSW } from 'virtual:pwa-register/react'
import { copy } from '../../content/en'

export function UpdatePrompt() {
  // I avoid automatically forcing updates during active gameplay because a
  // sudden reload could interrupt a current round.
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  })

  if (!needRefresh) {
    return null
  }

  return (
    <div className="update-prompt" role="status">
      <span>{copy.install.update.message}</span>
      <button
        className="button-link button-link--primary"
        type="button"
        onClick={() => updateServiceWorker(true)}
      >
        {copy.install.update.action}
      </button>
    </div>
  )
}
