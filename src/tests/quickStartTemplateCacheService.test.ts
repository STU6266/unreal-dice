import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../domain/constants/storage'
import { QUICK_START_TEMPLATES } from '../domain/data/quickStartTemplates'
import {
  loadCachedQuickStartTemplates,
  saveCachedQuickStartTemplates,
} from '../services/quickStartTemplateCacheService'
import { loadQuickStartTemplates } from '../services/quickStartTemplateService'

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

describe('quick start template cache', () => {
  it('stores and loads valid cached remote templates', () => {
    const storage = createStorage()
    saveCachedQuickStartTemplates([QUICK_START_TEMPLATES[0]], storage)

    const cached = loadCachedQuickStartTemplates(storage)

    expect(cached).toHaveLength(1)
    expect(cached[0].name).toBe('Standard Dice')
  })

  it('returns an empty cache for invalid stored JSON', () => {
    const storage = createStorage()
    storage.setItem(STORAGE_KEYS.quickStartTemplateCache, '{not-json')

    expect(loadCachedQuickStartTemplates(storage)).toEqual([])
  })

  it('does not cache invalid templates', () => {
    const storage = createStorage()
    saveCachedQuickStartTemplates(
      [{ ...QUICK_START_TEMPLATES[0], sets: [] }],
      storage,
    )

    expect(loadCachedQuickStartTemplates(storage)).toEqual([])
  })

  it('falls back to built-in templates when Supabase is not configured', async () => {
    const result = await loadQuickStartTemplates()

    expect(result.source).toBe('built-in')
    expect(result.templates.length).toBeGreaterThan(0)
  })
})
