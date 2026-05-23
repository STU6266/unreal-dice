import { supabaseConfig } from '../integrations/supabase/supabaseClient'
import type {
  RemoteQuickStartTemplatePayload,
  RemoteQuickStartTemplateRow,
} from '../domain/types/remoteTemplates'

export interface StudioServiceResult<T> {
  ok: boolean
  data?: T
  message?: string
}

export async function listStudioTemplates(): Promise<
  StudioServiceResult<RemoteQuickStartTemplateRow[]>
> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client
    .from('quick_start_templates')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data: data ?? [] }
}

export async function getStudioTemplate(
  templateId: string,
): Promise<StudioServiceResult<RemoteQuickStartTemplateRow>> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client
    .from('quick_start_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data }
}

export async function createStudioTemplate(
  payload: RemoteQuickStartTemplatePayload,
): Promise<StudioServiceResult<RemoteQuickStartTemplateRow>> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client
    .from('quick_start_templates')
    .insert(payload)
    .select('*')
    .single()

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data }
}

export async function updateStudioTemplate(
  templateId: string,
  payload: RemoteQuickStartTemplatePayload,
): Promise<StudioServiceResult<RemoteQuickStartTemplateRow>> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client
    .from('quick_start_templates')
    .update(payload)
    .eq('id', templateId)
    .select('*')
    .single()

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data }
}

export async function setStudioTemplatePublished(
  templateId: string,
  isPublished: boolean,
): Promise<StudioServiceResult<RemoteQuickStartTemplateRow>> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { data, error } = await supabaseConfig.client
    .from('quick_start_templates')
    .update({ is_published: isPublished })
    .eq('id', templateId)
    .select('*')
    .single()

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data }
}

export async function deleteStudioTemplate(
  templateId: string,
): Promise<StudioServiceResult<null>> {
  if (supabaseConfig.client === null) {
    return { ok: false, message: 'Supabase is not configured for the studio.' }
  }

  const { error } = await supabaseConfig.client
    .from('quick_start_templates')
    .delete()
    .eq('id', templateId)

  if (error !== null) {
    return { ok: false, message: createStudioErrorMessage(error.message) }
  }

  return { ok: true, data: null }
}

export function createStudioErrorMessage(message: string): string {
  if (/permission|policy|row-level|rls|not authorized|jwt/i.test(message)) {
    return 'Access denied. The signed-in user is not authorized by Supabase RLS.'
  }

  if (/duplicate|unique/i.test(message)) {
    return 'A template with this key already exists.'
  }

  return message || 'The studio request failed.'
}
