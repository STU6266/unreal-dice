import { APP_LIMITS } from '../constants/limits'
import type { DiceCombo, DiceSet, LockedDiceCounting } from '../types/dice'
import type { DiceGroup, GroupSource } from '../types/groups'
import { normalizeDiceSet, validateDiceGroup } from '../validation/validators'

export interface SetSlotDraft {
  id: string
  set: DiceSet | null
}

export interface GroupDraft {
  id: string | null
  name: string
  source: GroupSource
  lockedDiceCounting: LockedDiceCounting
  slots: SetSlotDraft[]
  combos: DiceCombo[]
  createdAt: string | null
}

export type SaveDraftResult =
  | {
      ok: true
      group: DiceGroup
      ignoredEmptySlots: number
      requiresEmptySlotConfirmation: boolean
    }
  | { ok: false; message: string }

interface SaveDraftOptions {
  existingGroup?: DiceGroup
  now?: () => string
  idFactory?: () => string
}

export function createNewGroupDraft(
  slotCount = 1,
  idFactory: () => string = createRandomId,
): GroupDraft {
  return {
    id: null,
    name: '',
    source: 'user',
    lockedDiceCounting: 'exclude',
    slots: createEmptySlots(slotCount, idFactory),
    combos: [],
    createdAt: null,
  }
}

export function createGroupDraftFromGroup(
  group: DiceGroup,
  idFactory: () => string = createRandomId,
): GroupDraft {
  return {
    id: group.id,
    name: group.name,
    source: group.source,
    lockedDiceCounting: group.lockedDiceCounting,
    slots: group.sets.map((set) => ({ id: idFactory(), set: normalizeDiceSet(set) })),
    combos: group.combos.map((combo) => ({
      ...combo,
      setIds: [...combo.setIds],
    })),
    createdAt: group.createdAt,
  }
}

export function createEmptySlots(
  count: number,
  idFactory: () => string = createRandomId,
): SetSlotDraft[] {
  const safeCount = Math.min(Math.max(1, count), APP_LIMITS.maxSetsPerGroup)

  return Array.from({ length: safeCount }, () => ({
    id: idFactory(),
    set: null,
  }))
}

export function addEmptySlot(
  slots: readonly SetSlotDraft[],
  idFactory: () => string = createRandomId,
): SetSlotDraft[] {
  if (slots.length >= APP_LIMITS.maxSetsPerGroup) {
    return [...slots]
  }

  return [...slots, { id: idFactory(), set: null }]
}

export function resizeSlots(
  slots: readonly SetSlotDraft[],
  nextCount: number,
  idFactory: () => string = createRandomId,
): SetSlotDraft[] {
  const safeCount = Math.min(Math.max(1, nextCount), APP_LIMITS.maxSetsPerGroup)

  if (safeCount <= slots.length) {
    return slots.slice(0, safeCount)
  }

  return [...slots, ...createEmptySlots(safeCount - slots.length, idFactory)]
}

export function wouldDiscardConfiguredSets(
  slots: readonly SetSlotDraft[],
  nextCount: number,
): boolean {
  return slots.slice(nextCount).some((slot) => slot.set !== null)
}

export function prepareGroupDraftForSaving(
  draft: GroupDraft,
  options: SaveDraftOptions = {},
): SaveDraftResult {
  const name = draft.name.trim()

  if (name === '') {
    return { ok: false, message: 'Group name is required.' }
  }

  const configuredSets = draft.slots
    .map((slot) => slot.set)
    .filter((set): set is DiceSet => set !== null)

  if (configuredSets.length === 0) {
    return { ok: false, message: 'Configure at least one valid set before saving.' }
  }

  if (configuredSets.length > APP_LIMITS.maxSetsPerGroup) {
    return {
      ok: false,
      message: `A group cannot contain more than ${APP_LIMITS.maxSetsPerGroup} sets.`,
    }
  }

  const timestamp = options.now?.() ?? new Date().toISOString()
  const existingGroup = options.existingGroup
  const group: DiceGroup = {
    id: existingGroup?.id ?? draft.id ?? options.idFactory?.() ?? createRandomId(),
    name,
    source: existingGroup?.source ?? draft.source,
    lockedDiceCounting: draft.lockedDiceCounting,
    sets: configuredSets
      .map(normalizeDiceSet)
      .filter((set): set is DiceSet => set !== null),
    combos: draft.combos.map((combo) => ({
      ...combo,
      setIds: [...combo.setIds],
    })),
    createdAt: existingGroup?.createdAt ?? draft.createdAt ?? timestamp,
    updatedAt: timestamp,
  }

  const validation = validateDiceGroup(group)

  if (!validation.isValid) {
    return {
      ok: false,
      message: validation.issues.map((issue) => issue.message).join(' '),
    }
  }

  const ignoredEmptySlots = draft.slots.length - configuredSets.length

  return {
    ok: true,
    group,
    ignoredEmptySlots,
    requiresEmptySlotConfirmation: ignoredEmptySlots > 0,
  }
}

export function areGroupDraftsEqual(left: GroupDraft, right: GroupDraft): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
