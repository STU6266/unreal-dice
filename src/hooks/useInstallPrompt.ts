import { useEffect, useState } from 'react'
import { isStandaloneDisplay } from '../utils/pwaDisplay'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => getIsStandalone())

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event): void {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled(): void {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall(): Promise<void> {
    if (installPrompt === null) {
      return
    }

    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return {
    canPromptInstall: installPrompt !== null && !isInstalled,
    isInstalled,
    promptInstall,
  }
}

function getIsStandalone(): boolean {
  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone
  return isStandaloneDisplay(
    window.matchMedia('(display-mode: standalone)').matches,
    navigatorWithStandalone.standalone,
  )
}
