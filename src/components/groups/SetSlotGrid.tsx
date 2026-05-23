import { copy } from '../../content/en'
import type { SetSlotDraft } from '../../domain/utils/groupDraftFactory'
import { SetSlotCard } from './SetSlotCard'

interface SetSlotGridProps {
  slots: readonly SetSlotDraft[]
  getComboForSet: (setId: string) => { name: string; color: string } | undefined
  onConfigureSlot: (slotId: string) => void
  onRemoveSlot: (slotId: string) => void
}

export function SetSlotGrid({
  slots,
  getComboForSet,
  onConfigureSlot,
  onRemoveSlot,
}: SetSlotGridProps) {
  return (
    <div className="set-slot-grid" aria-label={copy.groupEditor.form.setSlots}>
      {slots.map((slot, index) => (
        <SetSlotCard
          key={slot.id}
          slot={slot}
          position={index + 1}
          combo={slot.set ? getComboForSet(slot.set.id) : undefined}
          onConfigure={() => onConfigureSlot(slot.id)}
          onRemove={() => onRemoveSlot(slot.id)}
        />
      ))}
    </div>
  )
}
