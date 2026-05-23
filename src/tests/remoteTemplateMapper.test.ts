import { describe, expect, it } from 'vitest'
import type { RemoteQuickStartTemplateRow, StudioTemplateDraft } from '../domain/types/remoteTemplates'
import {
  createNewStudioTemplateDraft,
  createTemplateKeyFromName,
  mapRemoteRowToQuickStartTemplate,
  prepareStudioTemplatePayload,
} from '../domain/utils/remoteTemplateMapper'
import { mapPublishedRemoteTemplates } from '../services/quickStartTemplateService'

const validRow: RemoteQuickStartTemplateRow = {
  id: 'remote-id',
  name: 'Risk Test',
  template_key: 'risk-test',
  locked_dice_counting: 'exclude',
  sets: [
    {
      id: 'attack',
      name: 'Attack',
      diceCount: 3,
      sides: 6,
      diceColor: '#ffffff',
      pipColor: '#000000',
      modifier: 0,
    },
  ],
  combos: [],
  is_published: true,
  sort_order: 2,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('remote template mapping', () => {
  it('maps a valid remote row to a Quick Start group', () => {
    const template = mapRemoteRowToQuickStartTemplate(validRow)

    expect(template?.id).toBe('quick-start-risk-test')
    expect(template?.source).toBe('quick-start')
    expect(template?.sets[0].name).toBe('Attack')
  })

  it('rejects an invalid set in a remote row', () => {
    const template = mapRemoteRowToQuickStartTemplate({
      ...validRow,
      sets: [{ ...(validRow.sets as typeof validRow.sets & Record<string, unknown>[])[0], sides: 1 }],
    })

    expect(template).toBeNull()
  })

  it('rejects invalid combo references', () => {
    const template = mapRemoteRowToQuickStartTemplate({
      ...validRow,
      combos: [{ id: 'combo-a', name: 'Combo A', color: '#ffffff', setIds: ['missing'] }],
    })

    expect(template).toBeNull()
  })

  it('excludes unpublished templates from public mapping', () => {
    const templates = mapPublishedRemoteTemplates([
      { ...validRow, template_key: 'published', is_published: true },
      { ...validRow, template_key: 'draft', is_published: false },
    ])

    expect(templates.map((template) => template.id)).toEqual(['quick-start-published'])
  })

  it('preserves remote template order supplied by the query', () => {
    const templates = mapPublishedRemoteTemplates([
      { ...validRow, name: 'Second', template_key: 'second', sort_order: 20 },
      { ...validRow, name: 'First', template_key: 'first', sort_order: 10 },
    ])

    expect(templates.map((template) => template.name)).toEqual(['Second', 'First'])
  })
})

describe('studio template preparation', () => {
  it('creates a new studio template with safe defaults', () => {
    const draft = createNewStudioTemplateDraft()

    expect(draft.lockedDiceCounting).toBe('exclude')
    expect(draft.isPublished).toBe(false)
    expect(draft.sets).toEqual([])
  })

  it('generates a predictable safe template key', () => {
    expect(createTemplateKeyFromName("Liar's Dice Deluxe!")).toBe('liars-dice-deluxe')
  })

  it('validates combo membership before creating a remote save payload', () => {
    const draft: StudioTemplateDraft = {
      ...createNewStudioTemplateDraft(),
      name: 'Bad Combo',
      templateKey: 'bad-combo',
      sets: [
        {
          id: 'set-a',
          name: 'Set A',
          diceCount: 1,
          sides: 6,
          diceColor: '#ffffff',
          pipColor: '#000000',
          modifier: 0,
        },
      ],
      combos: [
        { id: 'combo-a', name: 'Combo A', color: '#ffffff', setIds: ['set-a'] },
        { id: 'combo-b', name: 'Combo B', color: '#000000', setIds: ['set-a'] },
      ],
    }

    expect(prepareStudioTemplatePayload(draft).ok).toBe(false)
  })
})
