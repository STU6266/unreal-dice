import type { Session } from '@supabase/supabase-js'
import { supabaseConfig } from '../integrations/supabase/supabaseClient'

export type StudioAuthResult =
  | { ok: true; session: Session | null }
  | { ok: false; message: string }

export function isStudioConfigured(): boolean {
  return supabaseConfig.isConfigured && supabaseConfig.client !== null
}

export async function getStudioSession(): Promise<StudioAuthResult> {
  if (!isStudioConfigured() || supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client.auth.getSession()
  if (error !== null) {
    return { ok: false, message: error.message }
  }

  return { ok: true, session: data.session }
}

export async function signInToStudio(
  email: string,
  password: string,
): Promise<StudioAuthResult> {
  if (!isStudioConfigured() || supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client.auth.signInWithPassword({
    email,
    password,
  })

  if (error !== null) {
    return { ok: false, message: 'Sign in failed. Check the admin credentials.' }
  }

  return { ok: true, session: data.session }
}

export async function signOutOfStudio(): Promise<void> {
  if (supabaseConfig.client !== null) {
    await supabaseConfig.client.auth.signOut()
  }
}
