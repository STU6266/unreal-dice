import { COMBO_COLOR_PALETTE } from '../constants/colors'
import { APP_LIMITS } from '../constants/limits'
import type { DiceCombo, DiceSet } from '../types/dice'

export interface ComboInput {
  id?: string
  name: string
  color: string
  setIds: string[]
}

export type ComboValidationResult =
  | { ok: true; combo: DiceCombo }
  | { ok: false; message: string }

export function createComboInput(
  existingCombos: readonly DiceCombo[],
): ComboInput {
  return {
    name: createDefaultComboName(existingCombos.map((combo) => combo.name)),
    color: getDefaultComboColor(existingCombos.length),
    setIds: [],
  }
}

export function createComboInputFromCombo(combo: DiceCombo): ComboInput {
  return {
    id: combo.id,
    name: combo.name,
    color: combo.color,
    setIds: [...combo.setIds],
  }
}

export function createDefaultComboName(existingNames: readonly string[]): string {
  const normalizedNames = new Set(
    existingNames.map((name) => name.trim().toLowerCase()),
  )

  for (let index = 0; index < 26; index += 1) {
    const name = `Combo ${String.fromCharCode(65 + index)}`
    if (!normalizedNames.has(name.toLowerCase())) {
      return name
    }
  }

  let number = 27
  while (normalizedNames.has(`Combo ${number}`.toLowerCase())) {
    number += 1
  }

  return `Combo ${number}`
}

export function getDefaultComboColor(comboIndex: number): string {
  return COMBO_COLOR_PALETTE[comboIndex % COMBO_COLOR_PALETTE.length]
}

export function createComboFromInput(
  input: ComboInput,
  configuredSets: readonly DiceSet[],
  existingCombos: readonly DiceCombo[],
  idFactory: () => string = createRandomId,
): ComboValidationResult {
  const name = input.name.trim()

  if (name === '') {
    return { ok: false, message: 'Combo name is required.' }
  }

  if (
    existingCombos.some(
      (combo) =>
        combo.id !== input.id && combo.name.trim().toLowerCase() === name.toLowerCase(),
    )
  ) {
    return { ok: false, message: 'Combo name must be unique inside this group.' }
  }

  if (input.color.trim() === '') {
    return { ok: false, message: 'Combo color is required.' }
  }

  if (input.setIds.length === 0) {
    return { ok: false, message: 'Select at least one set for this combo.' }
  }

  if (input.setIds.length > APP_LIMITS.maxSetsPerCombo) {
    return {
      ok: false,
      message: `A combo cannot contain more than ${APP_LIMITS.maxSetsPerCombo} sets.`,
    }
  }

  const availableSetIds = new Set(configuredSets.map((set) => set.id))
  const uniqueSetIds = new Set(input.setIds)

  if (uniqueSetIds.size !== input.setIds.length) {
    return { ok: false, message: 'A combo cannot include the same set twice.' }
  }

  if (input.setIds.some((setId) => !availableSetIds.has(setId))) {
    return { ok: false, message: 'Combo selection includes a missing set.' }
  }

  const isNewCombo = input.id === undefined
  if (isNewCombo && existingCombos.length >= APP_LIMITS.maxCombosPerGroup) {
    return {
      ok: false,
      message: `A group cannot contain more than ${APP_LIMITS.maxCombosPerGroup} combos.`,
    }
  }

  return {
    ok: true,
    combo: {
      id: input.id ?? idFactory(),
      name,
      color: input.color,
      setIds: input.setIds,
    },
  }
}

export function upsertCombo(
  combos: readonly DiceCombo[],
  combo: DiceCombo,
): DiceCombo[] {
  const existingIndex = combos.findIndex((item) => item.id === combo.id)

  if (existingIndex === -1) {
    return [...combos, combo]
  }

  return combos.map((item) => (item.id === combo.id ? combo : item))
}

export function deleteCombo(
  combos: readonly DiceCombo[],
  comboId: string,
): DiceCombo[] {
  return combos.filter((combo) => combo.id !== comboId)
}

export function removeSetFromCombos(
  combos: readonly DiceCombo[],
  setId: string,
): DiceCombo[] {
  return combos.map((combo) => ({
    ...combo,
    setIds: combo.setIds.filter((currentSetId) => currentSetId !== setId),
  }))
}

export function moveSetToCombo(
  combos: readonly DiceCombo[],
  setId: string,
  targetComboId: string | undefined,
): DiceCombo[] {
  return combos.map((combo) => {
    if (combo.id === targetComboId) {
      return combo
    }

    return {
      ...combo,
      setIds: combo.setIds.filter((currentSetId) => currentSetId !== setId),
    }
  })
}

export function findComboForSet(
  combos: readonly DiceCombo[],
  setId: string,
  excludedComboId?: string,
): DiceCombo | undefined {
  return combos.find(
    (combo) => combo.id !== excludedComboId && combo.setIds.includes(setId),
  )
}

export function hasDuplicateComboAssignments(
  combos: readonly DiceCombo[],
): boolean {
  const assignedSetIds = new Set<string>()

  return combos.some((combo) =>
    combo.setIds.some((setId) => {
      if (assignedSetIds.has(setId)) {
        return true
      }

      assignedSetIds.add(setId)
      return false
    }),
  )
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`
}
