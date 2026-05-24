import { APP_LIMITS } from '../constants/limits'
import type { DiceCombo, DiceSet } from '../types/dice'
import type { DiceGroup } from '../types/groups'
import { copyModifier, normalizeDiceModifier } from './modifierUtils'

export type ImportedGroupsResult =
  | { ok: true; groups: DiceGroup[] }
  | { ok: false; reason: 'max-groups-reached' }

export function createImportedGroups(
  exportedGroups: readonly DiceGroup[],
  existingGroups: readonly DiceGroup[],
  idFactory: () => string = createRandomId,
  now: () => string = () => new Date().toISOString(),
): ImportedGroupsResult {
  if (existingGroups.length + exportedGroups.length > APP_LIMITS.maxUserGroups) {
    return { ok: false, reason: 'max-groups-reached' }
  }

  const usedNames = new Set(existingGroups.map((group) => group.name.toLowerCase()))
  const timestamp = now()

  const importedGroups = exportedGroups.map((group) => {
    const name = createUniqueImportedName(group.name, usedNames)
    usedNames.add(name.toLowerCase())
    return createImportedGroup(group, name, timestamp, idFactory)
  })

  return { ok: true, groups: importedGroups }
}

export function createUniqueImportedName(
  exportedName: string,
  existingNames: ReadonlySet<string>,
): string {
  const trimmedName = exportedName.trim() || 'Group'
  const baseSourceName = trimmedName.replace(/\s+Imported(?:\s+\d+)?$/i, '')
  const baseName = `${baseSourceName} Imported`

  if (!existingNames.has(baseName.toLowerCase())) {
    return baseName
  }

  let copyNumber = 2
  while (existingNames.has(`${baseName} ${copyNumber}`.toLowerCase())) {
    copyNumber += 1
  }

  return `${baseName} ${copyNumber}`
}

function createImportedGroup(
  group: DiceGroup,
  name: string,
  timestamp: string,
  idFactory: () => string,
): DiceGroup {
  const setIdMap = new Map<string, string>()
  const sets = group.sets.map((set) => {
    const copiedSet = createImportedSet(set, idFactory())
    setIdMap.set(set.id, copiedSet.id)
    return copiedSet
  })

  return {
    id: idFactory(),
    name,
    source: 'imported',
    lockedDiceCounting: group.lockedDiceCounting,
    sets,
    combos: group.combos.map((combo) =>
      createImportedCombo(combo, idFactory(), setIdMap),
    ),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

// I assign new IDs during import because a backup may be restored on the same
// device where the original group still exists, and duplicate IDs would make
// later edits or deletions unsafe.
function createImportedSet(set: DiceSet, id: string): DiceSet {
  return {
    id,
    name: set.name,
    diceCount: set.diceCount,
    sides: set.sides,
    diceColor: set.diceColor,
    pipColor: set.pipColor,
    modifier: copyModifier(normalizeDiceModifier(set.modifier)),
  }
}

function createImportedCombo(
  combo: DiceCombo,
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
