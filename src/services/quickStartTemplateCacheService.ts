import { STORAGE_KEYS } from '../domain/constants/storage'
import type { QuickStartTemplate } from '../domain/data/quickStartTemplates'
import { isValidQuickStartTemplate } from '../domain/validation/remoteTemplateValidators'
import type { UserGroupsStorage } from './storageService'

interface CachedQuickStartTemplates {
  cachedAt: string
  templates: QuickStartTemplate[]
}

export function loadCachedQuickStartTemplates(
  storage: UserGroupsStorage = window.localStorage,
): QuickStartTemplate[] {
  const rawValue = storage.getItem(STORAGE_KEYS.quickStartTemplateCache)
  if (rawValue === null) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!isCachedTemplates(parsedValue)) {
      return []
    }

    return parsedValue.templates.filter(isValidQuickStartTemplate)
  } catch {
    return []
  }
}

export function saveCachedQuickStartTemplates(
  templates: readonly QuickStartTemplate[],
  storage: UserGroupsStorage = window.localStorage,
): void {
  const validTemplates = templates.filter(isValidQuickStartTemplate)
  if (validTemplates.length === 0) {
    return
  }

  storage.setItem(
    STORAGE_KEYS.quickStartTemplateCache,
    JSON.stringify({
      cachedAt: new Date().toISOString(),
      templates: validTemplates,
    } satisfies CachedQuickStartTemplates),
  )
}

function isCachedTemplates(value: unknown): value is CachedQuickStartTemplates {
  return (
    typeof value === 'object' &&
    value !== null &&
    'templates' in value &&
    Array.isArray(value.templates)
  )
}
