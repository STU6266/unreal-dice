import { describe, expect, it } from 'vitest'
import { APP_LIMITS } from '../domain/constants/limits'
import { QUICK_START_TEMPLATES } from '../domain/data/quickStartTemplates'
import {
  addQuickStartTemplateCopy,
  createEditableGroupFromQuickStartTemplate,
} from '../domain/utils/groupFactory'
import { createGroups, createTestGroup } from './testFixtures'

const yahtzeeTemplate = QUICK_START_TEMPLATES.find(
  (template) => template.name === 'Yahtzee',
)

if (yahtzeeTemplate === undefined) {
  throw new Error('Yahtzee template must exist for group factory tests.')
}

function createIdFactory(): () => string {
  let index = 0
  return () => {
    index += 1
    return `new-id-${index}`
  }
}

describe('groupFactory', () => {
  it('copying Yahtzee creates Yahtzee Copy', () => {
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      [],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(copiedGroup.name).toBe('Yahtzee Copy')
  })

  it('copying Yahtzee again creates Yahtzee Copy 2', () => {
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      ['Yahtzee Copy'],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(copiedGroup.name).toBe('Yahtzee Copy 2')
  })

  it('copied group uses quick-start-copy source', () => {
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      [],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(copiedGroup.source).toBe('quick-start-copy')
  })

  it('copied group receives new group and set IDs', () => {
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      [],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(copiedGroup.id).not.toBe(yahtzeeTemplate.id)
    expect(copiedGroup.sets[0]?.id).not.toBe(yahtzeeTemplate.sets[0]?.id)
    expect(copiedGroup.id).toBe('new-id-2')
    expect(copiedGroup.sets[0]?.id).toBe('new-id-1')
  })

  it('copied group preserves the template locked-dice counting rule', () => {
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      [],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(copiedGroup.lockedDiceCounting).toBe(
      yahtzeeTemplate.lockedDiceCounting,
    )
  })

  it('copied group does not mutate the original Quick Start template', () => {
    const originalSetName = yahtzeeTemplate.sets[0]?.name
    const copiedGroup = createEditableGroupFromQuickStartTemplate(
      yahtzeeTemplate,
      [],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    if (copiedGroup.sets[0] !== undefined) {
      copiedGroup.sets[0].name = 'Changed Later'
    }

    expect(yahtzeeTemplate.sets[0]?.name).toBe(originalSetName)
  })

  it('adding a copied group at the maximum user group limit is rejected', () => {
    const existingGroups = createGroups(APP_LIMITS.maxUserGroups)
    const result = addQuickStartTemplateCopy(yahtzeeTemplate, existingGroups, {
      idFactory: createIdFactory(),
      now: () => '2026-05-23T00:00:00.000Z',
    })

    expect(result).toEqual({ ok: false, reason: 'max-groups-reached' })
  })

  it('adding a copied group returns the updated group list when under the limit', () => {
    const result = addQuickStartTemplateCopy(
      yahtzeeTemplate,
      [createTestGroup({ name: 'Existing Group' })],
      {
        idFactory: createIdFactory(),
        now: () => '2026-05-23T00:00:00.000Z',
      },
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.groups).toHaveLength(2)
      expect(result.group.name).toBe('Yahtzee Copy')
    }
  })
})
