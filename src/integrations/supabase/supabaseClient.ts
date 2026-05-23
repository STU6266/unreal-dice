import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfigState {
  isConfigured: boolean
  client: SupabaseClient | null
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabasePublishableKey = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

// I use only the browser-safe Supabase client key here because authorization
// is enforced by database RLS policies, not by exposing admin credentials in the app.
export const supabaseConfig: SupabaseConfigState =
  supabaseUrl && supabasePublishableKey
    ? {
        isConfigured: true,
        client: createClient(supabaseUrl, supabasePublishableKey),
      }
    : {
        isConfigured: false,
        client: null,
      }
