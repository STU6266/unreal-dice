import type {
  DiceModifier,
  ModifierApplication,
  ModifierOperator,
} from '../types/dice'
import type { IndividualDieMode, IndividualDieResult } from '../types/history'

export const MODIFIER_OPERATORS = [
  'add',
  'subtract',
  'multiply',
  'divide',
] as const satisfies readonly ModifierOperator[]

export const MODIFIER_APPLICATIONS = [
  'each-die',
  'set-total',
] as const satisfies readonly ModifierApplication[]

export const DEFAULT_DICE_MODIFIER: DiceModifier = {
  enabled: false,
  operator: 'add',
  value: 1,
  application: 'set-total',
}

export function createDisabledModifier(): DiceModifier {
  return { ...DEFAULT_DICE_MODIFIER }
}

export function copyModifier(modifier: DiceModifier): DiceModifier {
  return { ...modifier }
}

export function normalizeDiceModifier(value: unknown): DiceModifier {
  if (!isRecord(value)) {
    return createDisabledModifier()
  }

  const operator = isModifierOperator(value.operator)
    ? value.operator
    : DEFAULT_DICE_MODIFIER.operator
  const application = isModifierApplication(value.application)
    ? value.application
    : DEFAULT_DICE_MODIFIER.application
  const rawValue = value.value
  const modifierValue =
    typeof rawValue === 'number' && Number.isInteger(rawValue)
      ? rawValue
      : DEFAULT_DICE_MODIFIER.value

  return {
    enabled: value.enabled === true,
    operator,
    value: modifierValue,
    application,
  }
}

export function isValidDiceModifier(value: unknown): value is DiceModifier {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.enabled === 'boolean' &&
    isModifierOperator(value.operator) &&
    Number.isInteger(value.value) &&
    typeof value.value === 'number' &&
    value.value >= 1 &&
    value.value <= 100 &&
    isModifierApplication(value.application)
  )
}

export function applyModifier(value: number, modifier: DiceModifier): number {
  switch (modifier.operator) {
    case 'add':
      return value + modifier.value
    case 'subtract':
      return value - modifier.value
    case 'multiply':
      return value * modifier.value
    case 'divide':
      return Math.ceil(value / modifier.value)
  }
}

export function normalizeDieMode(
  die: { locked?: unknown; mode?: unknown } | undefined,
): IndividualDieMode {
  if (die?.mode === 'modifier-active' || die?.mode === 'normal' || die?.mode === 'locked') {
    return die.mode
  }

  return die?.locked === true ? 'locked' : 'normal'
}

export function isLockedDie(die: IndividualDieResult | { locked?: unknown; mode?: unknown }): boolean {
  return normalizeDieMode(die) === 'locked'
}

export function isModifierActiveDie(
  die: IndividualDieResult | { locked?: unknown; mode?: unknown },
): boolean {
  return normalizeDieMode(die) === 'modifier-active'
}

export function getLegacyLockedFlag(die: IndividualDieResult): boolean {
  return die.mode === 'locked'
}

function isModifierOperator(value: unknown): value is ModifierOperator {
  return typeof value === 'string' && MODIFIER_OPERATORS.includes(value as ModifierOperator)
}

function isModifierApplication(value: unknown): value is ModifierApplication {
  return typeof value === 'string' && MODIFIER_APPLICATIONS.includes(value as ModifierApplication)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
