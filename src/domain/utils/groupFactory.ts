import { APP_LIMITS } from '../constants/limits'
import type { QuickStartTemplate } from '../data/quickStartTemplates'
import type { DiceCombo, DiceSet } from '../types/dice'
import type { DiceGroup } from '../types/groups'
import { copyModifier, normalizeDiceModifier } from './modifierUtils'
import { copySymbolDice } from './symbolDiceUtils'
import { createUniqueCopyName } from './uniqueNames'

export type AddQuickStartCopyResult =
  | { ok: true; group: DiceGroup; groups: DiceGroup[] }
  | { ok: false; reason: 'max-groups-reached' }

interface CopyTemplateOptions {
  idFactory?: () => string
  now?: () => string
}

export function addQuickStartTemplateCopy(
  template: QuickStartTemplate,
  existingGroups: readonly DiceGroup[],
  options: CopyTemplateOptions = {},
): AddQuickStartCopyResult {
  if (existingGroups.length >= APP_LIMITS.maxUserGroups) {
    return { ok: false, reason: 'max-groups-reached' }
  }

  const copiedGroup = createEditableGroupFromQuickStartTemplate(
    template,
    existingGroups.map((group) => group.name),
    options,
  )

  return {
    ok: true,
    group: copiedGroup,
    groups: [...existingGroups, copiedGroup],
  }
}

export function createEditableGroupFromQuickStartTemplate(
  template: QuickStartTemplate,
  existingGroupNames: readonly string[],
  options: CopyTemplateOptions = {},
): DiceGroup {
  const createId = options.idFactory ?? createRandomId
  const timestamp = options.now?.() ?? new Date().toISOString()
  const setIdMap = new Map<string, string>()

  const sets = template.sets.map((set) => {
    const copiedSet = copySet(set, createId())
    setIdMap.set(set.id, copiedSet.id)
    return copiedSet
  })

  return {
    id: createId(),
    name: createUniqueCopyName(template.name, existingGroupNames),
    source: 'quick-start-copy',
    lockedDiceCounting: template.lockedDiceCounting,
    sets,
    combos: template.combos.map((combo) => copyCombo(combo, createId(), setIdMap)),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function copySet(set: Readonly<DiceSet>, id: string): DiceSet {
  return {
    id,
    name: set.name,
    diceCount: set.diceCount,
    sides: set.sides,
    diceColor: set.diceColor,
    pipColor: set.pipColor,
    modifier: copyModifier(normalizeDiceModifier(set.modifier)),
    symbolDice: copySymbolDice(set.symbolDice),
  }
}

function copyCombo(
  combo: Readonly<DiceCombo>,
  id: string,
  setIdMap: ReadonlyMap<string, string>,
): DiceCombo {
  return {
    id,
    name: combo.name,
    color: combo.color,
    setIds: combo.setIds.map((setId) => setIdMap.get(setId) ?? setId),
  }
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
