import type { QuickStartTemplate } from '../data/quickStartTemplates'
import type { DiceCombo, DiceSet } from '../types/dice'
import type {
  RemoteQuickStartTemplatePayload,
  RemoteQuickStartTemplateRow,
  StudioTemplateDraft,
} from '../types/remoteTemplates'
import { createQuickStartId, validateRemoteTemplateRow } from '../validation/remoteTemplateValidators'
import { validateDiceGroup } from '../validation/validators'

export function mapRemoteRowToQuickStartTemplate(
  row: RemoteQuickStartTemplateRow,
): QuickStartTemplate | null {
  const validation = validateRemoteTemplateRow(row)
  if (!validation.ok) {
    return null
  }

  return {
    id: createQuickStartId(row.template_key),
    name: row.name,
    source: 'quick-start',
    lockedDiceCounting: row.locked_dice_counting,
    sets: copySets(row.sets as DiceSet[]),
    combos: copyCombos(row.combos as DiceCombo[]),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapRemoteRowToStudioDraft(
  row: RemoteQuickStartTemplateRow,
): StudioTemplateDraft | null {
  const template = mapRemoteRowToQuickStartTemplate(row)
  if (template === null) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    templateKey: row.template_key,
    lockedDiceCounting: row.locked_dice_counting,
    sets: copySets(template.sets),
    combos: copyCombos(template.combos),
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export type StudioTemplateSaveResult =
  | { ok: true; payload: RemoteQuickStartTemplatePayload }
  | { ok: false; message: string }

export function prepareStudioTemplatePayload(
  draft: StudioTemplateDraft,
): StudioTemplateSaveResult {
  const name = draft.name.trim()
  const templateKey = draft.templateKey.trim()

  if (name === '') {
    return { ok: false, message: 'Template name is required.' }
  }

  if (!isSafeTemplateKey(templateKey)) {
    return {
      ok: false,
      message: 'Template key must use lowercase letters, numbers, and hyphens.',
    }
  }

  const now = new Date().toISOString()
  const validationGroup = {
    id: createQuickStartId(templateKey),
    name,
    source: 'quick-start',
    lockedDiceCounting: draft.lockedDiceCounting,
    sets: copySets(draft.sets),
    combos: copyCombos(draft.combos),
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  }
  const validation = validateDiceGroup(validationGroup)
  if (!validation.isValid) {
    return {
      ok: false,
      message: validation.issues.map((issue) => issue.message).join(' '),
    }
  }

  return {
    ok: true,
    payload: {
      name,
      template_key: templateKey,
      locked_dice_counting: draft.lockedDiceCounting,
      sets: copySets(draft.sets),
      combos: copyCombos(draft.combos),
      is_published: draft.isPublished,
      sort_order: Number.isFinite(draft.sortOrder) ? draft.sortOrder : 0,
    },
  }
}

export function createNewStudioTemplateDraft(): StudioTemplateDraft {
  return {
    id: null,
    name: '',
    templateKey: '',
    lockedDiceCounting: 'exclude',
    sets: [],
    combos: [],
    isPublished: false,
    sortOrder: 0,
    createdAt: null,
  }
}

export function createTemplateKeyFromName(name: string): string {
  const key = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return key || 'template'
}

export function isSafeTemplateKey(templateKey: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(templateKey)
}

function copySets(sets: readonly DiceSet[]): DiceSet[] {
  return sets.map((set) => ({ ...set }))
}

function copyCombos(combos: readonly DiceCombo[]): DiceCombo[] {
  return combos.map((combo) => ({ ...combo, setIds: [...combo.setIds] }))
}
