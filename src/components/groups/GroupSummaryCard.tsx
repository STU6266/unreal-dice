import { Link } from 'react-router-dom'
import { copy } from '../../content/en'
import type { DiceCombo, DiceSet, LockedDiceCounting } from '../../domain/types/dice'
import type { GroupSource } from '../../domain/types/groups'

interface GroupSummaryCardProps {
  group: {
    id: string
    name: string
    source: GroupSource
    lockedDiceCounting: LockedDiceCounting
    sets: readonly Readonly<DiceSet>[]
    combos: readonly Readonly<DiceCombo>[]
  }
  playTo: string
  editTo?: string
  onCopy?: () => void
  onDelete?: () => void
  onExport?: () => void
  variant?: 'quick-start' | 'saved'
}

export function GroupSummaryCard({
  group,
  playTo,
  editTo,
  onCopy,
  onDelete,
  onExport,
  variant = 'saved',
}: GroupSummaryCardProps) {
  return (
    <article className="group-card">
      <div className="group-card__header">
        <div>
          <h2>{group.name}</h2>
          {variant === 'saved' ? (
            <p>{sourceLabel(group.source)}</p>
          ) : (
            <p>{copy.quickStart.setsLabel(group.sets.length)}</p>
          )}
        </div>
        <span className="group-card__badge">
          {copy.lockedDiceCountingLabels[group.lockedDiceCounting]}
        </span>
      </div>

      <ul className="group-card__meta" aria-label={`${group.name} summary`}>
        {variant === 'saved' ? (
          <>
            <li>{copy.myGroups.setsLabel(group.sets.length)}</li>
            <li>{copy.myGroups.combosLabel(group.combos.length)}</li>
          </>
        ) : (
          group.sets.slice(0, 3).map((set) => (
            <li key={set.id}>
              {set.name} · {set.diceCount}d{set.sides}
            </li>
          ))
        )}
      </ul>

      <div className="group-card__actions">
        <Link className="button-link button-link--primary" to={playTo}>
          {copy.myGroups.actions.play}
        </Link>
        {onCopy ? (
          <button className="button-link" type="button" onClick={onCopy}>
            {copy.quickStart.actions.copy}
          </button>
        ) : null}
        {editTo ? (
          <Link className="button-link" to={editTo}>
            {copy.myGroups.actions.edit}
          </Link>
        ) : null}
        {onExport ? (
          <button
            className="button-link"
            type="button"
            onClick={onExport}
            aria-label={copy.myGroups.exportUnavailableLabel}
          >
            {copy.myGroups.actions.export}
          </button>
        ) : null}
        {onDelete ? (
          <button
            className="button-link button-link--danger"
            type="button"
            onClick={onDelete}
          >
            {copy.myGroups.actions.delete}
          </button>
        ) : null}
      </div>
    </article>
  )
}

function sourceLabel(source: GroupSource): string {
  return copy.myGroups.sourceLabels[source]
}
