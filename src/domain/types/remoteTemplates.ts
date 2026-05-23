import type { DiceCombo, DiceSet, LockedDiceCounting } from './dice'

export interface RemoteQuickStartTemplateRow {
  id: string
  name: string
  template_key: string
  locked_dice_counting: LockedDiceCounting
  sets: unknown
  combos: unknown
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface RemoteQuickStartTemplatePayload {
  name: string
  template_key: string
  locked_dice_counting: LockedDiceCounting
  sets: DiceSet[]
  combos: DiceCombo[]
  is_published: boolean
  sort_order: number
}

export interface StudioTemplateDraft {
  id: string | null
  name: string
  templateKey: string
  lockedDiceCounting: LockedDiceCounting
  sets: DiceSet[]
  combos: DiceCombo[]
  isPublished: boolean
  sortOrder: number
  createdAt: string | null
}
