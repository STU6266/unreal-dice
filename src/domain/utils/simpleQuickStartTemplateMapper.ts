import { COMBO_COLOR_PALETTE, DEFAULT_SET_COLORS } from '../constants/colors'
import { APP_LIMITS } from '../constants/limits'
import type { QuickStartTemplate } from '../data/quickStartTemplates'
import type {
  DiceCombo,
  DiceModifier,
  DiceSet,
  LockedDiceCounting,
  ModifierApplication,
  ModifierOperator,
  SymbolDieDefinition,
} from '../types/dice'
import { createDisabledModifier, isValidDiceModifier } from './modifierUtils'
import { normalizeSymbolDice } from './symbolDiceUtils'

export interface SimpleQuickStartTemplate {
  name: string
  lockedDiceCounting?: LockedDiceCounting
  sortOrder?: number
  sets: SimpleQuickStartSet[]
  combos?: SimpleQuickStartCombo[]
}

export interface SimpleQuickStartSet {
  name: string
  dice: number
  sides: number
  diceColor?: string
  pipColor?: string
  modifier?: SimpleModifierConfig
  symbolDice?: SimpleSymbolDieConfig[]
}

export interface SimpleSymbolDieConfig {
  faces: SymbolDieDefinition['faces']
}

export interface SimpleQuickStartCombo {
  name: string
  sets: string[]
  color?: string
}

export interface SimpleModifierConfig {
  enabled: true
  operator: ModifierOperator
  value: number
  application: ModifierApplication
}

interface MapSimpleTemplatesOptions {
  reservedTemplateIds?: ReadonlySet<string>
}

const TEMPLATE_TIMESTAMP = '2026-01-01T00:00:00.000Z'

export function mapSimpleQuickStartTemplates(
  templates: readonly SimpleQuickStartTemplate[],
  options: MapSimpleTemplatesOptions = {},
): QuickStartTemplate[] {
  const reservedTemplateIds = options.reservedTemplateIds ?? new Set<string>()
  const usedTemplateIds = new Set(reservedTemplateIds)

  return [...templates]
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((template) => mapSimpleQuickStartTemplate(template, usedTemplateIds))
    .filter((template): template is QuickStartTemplate => template !== null)
}

export function mapSimpleQuickStartTemplate(
  template: SimpleQuickStartTemplate,
  usedTemplateIds = new Set<string>(),
): QuickStartTemplate | null {
  const templateId = `quick-start-${createSlug(template.name)}`
  if (!isValidTemplateShell(template) || templateId === 'quick-start-') {
    warnInvalidTemplate(template.name, 'Template name and sets are required.')
    return null
  }

  if (usedTemplateIds.has(templateId)) {
    warnInvalidTemplate(template.name, `Template ID "${templateId}" is already used.`)
    return null
  }

  const setNameCounts = new Map<string, number>()
  template.sets.forEach((set) => {
    setNameCounts.set(set.name, (setNameCounts.get(set.name) ?? 0) + 1)
  })
  if ([...setNameCounts.values()].some((count) => count > 1)) {
    warnInvalidTemplate(template.name, 'Set names must be unique inside a template.')
    return null
  }

  const sets = template.sets.map((set) => mapSimpleSet(templateId, set))
  if (sets.some((set) => set === null)) {
    warnInvalidTemplate(template.name, 'One or more sets are invalid.')
    return null
  }

  const mappedSets = sets.filter((set): set is DiceSet => set !== null)
  const combos = mapSimpleCombos(template, mappedSets)
  if (combos === null) {
    return null
  }

  usedTemplateIds.add(templateId)
  return {
    id: templateId,
    name: template.name.trim(),
    source: 'quick-start',
    lockedDiceCounting: template.lockedDiceCounting ?? 'exclude',
    sets: mappedSets,
    combos,
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  }
}

function mapSimpleSet(templateId: string, set: SimpleQuickStartSet): DiceSet | null {
  if (
    typeof set.name !== 'string' ||
    set.name.trim() === '' ||
    !Number.isInteger(set.dice) ||
    set.dice < 0 ||
    set.dice > APP_LIMITS.maxDicePerSet ||
    (set.dice > 0 &&
      (!Number.isInteger(set.sides) ||
        set.sides < APP_LIMITS.minSidesPerDie ||
        set.sides > APP_LIMITS.maxSidesPerDie))
  ) {
    return null
  }

  const symbolDice = normalizeSimpleSymbolDice(`${templateId}-${createSlug(set.name)}`, set.symbolDice)
  if (symbolDice === null || set.dice + symbolDice.length < 1 || set.dice + symbolDice.length > APP_LIMITS.maxDicePerSet) {
    return null
  }

  const modifier = mapSimpleModifier(set.modifier)
  if (modifier === null) {
    return null
  }

  return {
    id: `${templateId}-${createSlug(set.name)}`,
    name: set.name.trim(),
    diceCount: set.dice,
    sides: set.sides,
    diceColor: set.diceColor ?? DEFAULT_SET_COLORS.diceColor,
    pipColor: set.pipColor ?? DEFAULT_SET_COLORS.pipColor,
    modifier,
    symbolDice,
  }
}

function normalizeSimpleSymbolDice(
  setId: string,
  symbolDice: readonly SimpleSymbolDieConfig[] | undefined,
): SymbolDieDefinition[] | null {
  if (symbolDice === undefined) {
    return []
  }

  const normalized = normalizeSymbolDice(
    symbolDice.map((die, index) => ({
      id: `${setId}-symbol-${index + 1}`,
      faces: die.faces,
    })),
  )

  return normalized.length === symbolDice.length &&
    normalized.every((die) => die.faces.length >= 2 && die.faces.length <= 30)
    ? normalized
    : null
}

function mapSimpleModifier(modifier: SimpleModifierConfig | undefined): DiceModifier | null {
  if (modifier === undefined) {
    return createDisabledModifier()
  }

  return isValidDiceModifier(modifier) ? { ...modifier } : null
}

function mapSimpleCombos(
  template: SimpleQuickStartTemplate,
  mappedSets: readonly DiceSet[],
): DiceCombo[] | null {
  const combos = template.combos ?? []
  if (combos.length > APP_LIMITS.maxCombosPerGroup) {
    warnInvalidTemplate(template.name, 'Too many combos.')
    return null
  }

  const setIdsByName = new Map(mappedSets.map((set) => [set.name, set.id]))
  const assignedSetIds = new Set<string>()
  const comboIds = new Set<string>()
  const mappedCombos: DiceCombo[] = []

  for (const [index, combo] of combos.entries()) {
    if (
      typeof combo.name !== 'string' ||
      combo.name.trim() === '' ||
      !Array.isArray(combo.sets) ||
      combo.sets.length === 0 ||
      combo.sets.length > APP_LIMITS.maxSetsPerCombo
    ) {
      warnInvalidTemplate(template.name, `Combo "${combo.name}" is invalid.`)
      return null
    }

    const comboId = `combo-${createSlug(combo.name)}`
    if (comboIds.has(comboId)) {
      warnInvalidTemplate(template.name, `Combo ID "${comboId}" is duplicated.`)
      return null
    }
    comboIds.add(comboId)

    const setIds: string[] = []
    for (const setName of combo.sets) {
      const setId = setIdsByName.get(setName)
      if (setId === undefined) {
        warnInvalidTemplate(template.name, `Combo "${combo.name}" references "${setName}".`)
        return null
      }

      if (setIds.includes(setId)) {
        warnInvalidTemplate(template.name, `Combo "${combo.name}" repeats "${setName}".`)
        return null
      }

      if (assignedSetIds.has(setId)) {
        warnInvalidTemplate(template.name, `"${setName}" is assigned to more than one combo.`)
        return null
      }

      setIds.push(setId)
    }

    setIds.forEach((setId) => assignedSetIds.add(setId))
    mappedCombos.push({
      id: comboId,
      name: combo.name.trim(),
      color: combo.color ?? COMBO_COLOR_PALETTE[index % COMBO_COLOR_PALETTE.length],
      setIds,
    })
  }

  return mappedCombos
}

function isValidTemplateShell(value: SimpleQuickStartTemplate): boolean {
  return (
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    Array.isArray(value.sets) &&
    value.sets.length > 0 &&
    value.sets.length <= APP_LIMITS.maxSetsPerGroup &&
    (value.lockedDiceCounting === undefined ||
      value.lockedDiceCounting === 'include' ||
      value.lockedDiceCounting === 'exclude')
  )
}

export function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function warnInvalidTemplate(templateName: string, reason: string): void {
  if (import.meta.env.DEV) {
    console.warn(`[unrealDice] Skipping Quick Start template "${templateName}": ${reason}`)
  }
}
