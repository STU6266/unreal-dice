import { supabaseConfig } from '../integrations/supabase/supabaseClient'
import { QUICK_START_TEMPLATES, type QuickStartTemplate } from '../domain/data/quickStartTemplates'
import type { RemoteQuickStartTemplateRow } from '../domain/types/remoteTemplates'
import { mapRemoteRowToQuickStartTemplate } from '../domain/utils/remoteTemplateMapper'
import {
  loadCachedQuickStartTemplates,
  saveCachedQuickStartTemplates,
} from './quickStartTemplateCacheService'

export interface QuickStartTemplateLoadResult {
  templates: QuickStartTemplate[]
  source: 'remote' | 'cache' | 'built-in'
  message?: string
}

// I keep built-in templates as a final fallback so Quick Start remains usable
// offline or when the remote content service is temporarily unavailable.
export async function loadQuickStartTemplates(): Promise<QuickStartTemplateLoadResult> {
  if (!supabaseConfig.isConfigured || supabaseConfig.client === null) {
    return { templates: [...QUICK_START_TEMPLATES], source: 'built-in' }
  }

  try {
    const { data, error } = await supabaseConfig.client
      .from('quick_start_templates')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error !== null) {
      return loadFallbackTemplates(error.message)
    }

    const templates = mapPublishedRemoteTemplates(data ?? [])
    if (templates.length === 0) {
      return loadFallbackTemplates('No valid published remote templates were available.')
    }

    saveCachedQuickStartTemplates(templates)
    return { templates, source: 'remote' }
  } catch (error) {
    return loadFallbackTemplates(error instanceof Error ? error.message : undefined)
  }
}

export async function findQuickStartTemplate(
  templateId: string | undefined,
): Promise<QuickStartTemplate | undefined> {
  if (templateId === undefined) {
    return undefined
  }

  const loaded = await loadQuickStartTemplates()
  return loaded.templates.find((template) => template.id === templateId)
}

function loadFallbackTemplates(message?: string): QuickStartTemplateLoadResult {
  const cachedTemplates = loadCachedQuickStartTemplates()
  if (cachedTemplates.length > 0) {
    return { templates: cachedTemplates, source: 'cache', message }
  }

  return { templates: [...QUICK_START_TEMPLATES], source: 'built-in', message }
}

export function mapPublishedRemoteTemplates(
  rows: readonly RemoteQuickStartTemplateRow[],
): QuickStartTemplate[] {
  return rows
    .filter((row) => row.is_published)
    .map(mapRemoteRowToQuickStartTemplate)
    .filter((template): template is QuickStartTemplate => template !== null)
}
