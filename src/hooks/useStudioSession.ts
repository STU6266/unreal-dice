import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import {
  getStudioSession,
  isStudioConfigured,
  signInToStudio,
  signOutOfStudio,
} from '../services/studioAuthService'

export interface StudioSessionState {
  isConfigured: boolean
  isLoading: boolean
  session: Session | null
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useStudioSession(): StudioSessionState {
  const isConfigured = isStudioConfigured()
  const [isLoading, setIsLoading] = useState(isConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const result = await getStudioSession()
    if (result.ok) {
      setSession(result.session)
      setError(null)
    } else {
      setError(result.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      return
    }

    queueMicrotask(() => void refresh())
  }, [isConfigured, refresh])

  async function signIn(email: string, password: string): Promise<void> {
    setError(null)
    const result = await signInToStudio(email, password)
    if (result.ok) {
      setSession(result.session)
      return
    }

    setError(result.message)
  }

  async function signOut(): Promise<void> {
    await signOutOfStudio()
    setSession(null)
  }

  return { isConfigured, isLoading, session, error, signIn, signOut }
}
