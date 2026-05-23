import { copy } from '../../content/en'
import type { DiceCombo, DiceSet } from '../../domain/types/dice'

interface ComboSummaryCardProps {
  combo: DiceCombo
  sets: readonly DiceSet[]
  onEdit: () => void
  onDelete: () => void
}

export function ComboSummaryCard({
  combo,
  sets,
  onEdit,
  onDelete,
}: ComboSummaryCardProps) {
  const includedSets = combo.setIds
    .map((setId) => sets.find((set) => set.id === setId))
    .filter((set): set is DiceSet => set !== undefined)

  return (
    <article className={`combo-card${includedSets.length === 0 ? ' combo-card--empty' : ''}`}>
      <div className="combo-card__header">
        <span
          className="combo-card__swatch"
          style={{ backgroundColor: combo.color }}
          aria-label={copy.groupEditor.combos.colorSwatch(combo.name)}
        />
        <div>
          <h3>{combo.name}</h3>
          <p>{combo.color}</p>
        </div>
      </div>

      {includedSets.length === 0 ? (
        <p className="combo-card__warning">{copy.groupEditor.combos.emptyWarning}</p>
      ) : (
        <p>
          {copy.groupEditor.combos.includedSets}:{' '}
          {includedSets.map((set) => set.name).join(', ')}
        </p>
      )}

      <div className="combo-card__actions">
        <button className="button-link" type="button" onClick={onEdit}>
          {copy.groupEditor.combos.edit}
        </button>
        <button
          className="button-link button-link--danger"
          type="button"
          onClick={onDelete}
        >
          {copy.groupEditor.combos.delete}
        </button>
      </div>
    </article>
  )
}
