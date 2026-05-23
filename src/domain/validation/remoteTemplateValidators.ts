import type { QuickStartTemplate } from '../data/quickStartTemplates'
import type { DiceCombo, DiceSet } from '../types/dice'
import type { DiceGroup } from '../types/groups'
import type { RemoteQuickStartTemplateRow } from '../types/remoteTemplates'
import { validateDiceGroup } from './validators'

export interface RemoteTemplateValidationResult {
  ok: boolean
  message?: string
}

export function isRemoteTemplateRow(value: unknown): value is RemoteQuickStartTemplateRow {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.template_key === 'string' &&
    (value.locked_dice_counting === 'include' ||
      value.locked_dice_counting === 'exclude') &&
    Array.isArray(value.sets) &&
    Array.isArray(value.combos) &&
    typeof value.is_published === 'boolean' &&
    typeof value.sort_order === 'number' &&
    typeof value.created_at === 'string' &&
    typeof value.updated_at === 'string'
  )
}

export function validateRemoteTemplateRow(
  row: unknown,
): RemoteTemplateValidationResult {
  if (!isRemoteTemplateRow(row)) {
    return { ok: false, message: 'Remote template row has an unsupported shape.' }
  }

  if (row.name.trim() === '' || row.template_key.trim() === '') {
    return { ok: false, message: 'Remote template name and key are required.' }
  }

  return validateRemoteTemplateAsQuickStart(row)
}

export function validateRemoteTemplateAsQuickStart(
  row: RemoteQuickStartTemplateRow,
): RemoteTemplateValidationResult {
  const group: DiceGroup = {
    id: createQuickStartId(row.template_key),
    name: row.name,
    source: 'quick-start',
    lockedDiceCounting: row.locked_dice_counting,
    sets: row.sets as DiceSet[],
    combos: row.combos as DiceCombo[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
  const result = validateDiceGroup(group)

  if (!result.isValid) {
    return {
      ok: false,
      message: result.issues.map((issue) => issue.message).join(' '),
    }
  }

  return { ok: true }
}

export function isValidQuickStartTemplate(
  template: QuickStartTemplate,
): boolean {
  return validateDiceGroup(template).isValid
}

export function createQuickStartId(templateKey: string): string {
  return `quick-start-${templateKey}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
