import { Link } from 'react-router-dom'
import { copy } from '../../content/en'
import type { RemoteQuickStartTemplateRow } from '../../domain/types/remoteTemplates'
import { PublishStatusBadge } from './PublishStatusBadge'

interface StudioTemplateCardProps {
  template: RemoteQuickStartTemplateRow
  onTogglePublished: () => void
  onDelete: () => void
}

export function StudioTemplateCard({
  template,
  onTogglePublished,
  onDelete,
}: StudioTemplateCardProps) {
  const setCount = Array.isArray(template.sets) ? template.sets.length : 0
  const comboCount = Array.isArray(template.combos) ? template.combos.length : 0

  return (
    <article className="group-card">
      <div className="group-card__header">
        <div>
          <h2>{template.name}</h2>
          <p>{template.template_key}</p>
        </div>
        <PublishStatusBadge isPublished={template.is_published} />
      </div>

      <dl className="group-card__meta">
        <div>
          <dt>{copy.groupEditor.form.setSlots}</dt>
          <dd>{copy.myGroups.setsLabel(setCount)}</dd>
        </div>
        <div>
          <dt>{copy.groupEditor.combos.title}</dt>
          <dd>{copy.myGroups.combosLabel(comboCount)}</dd>
        </div>
        <div>
          <dt>{copy.studio.fields.sortOrder}</dt>
          <dd>{template.sort_order}</dd>
        </div>
      </dl>

      <div className="group-card__actions">
        <Link className="button-link" to={`/studio/templates/${template.id}/edit`}>
          {copy.studio.actions.edit}
        </Link>
        <button className="button-link" type="button" onClick={onTogglePublished}>
          {template.is_published
            ? copy.studio.actions.unpublish
            : copy.studio.actions.publish}
        </button>
        <button className="button-link button-link--danger" type="button" onClick={onDelete}>
          {copy.studio.actions.delete}
        </button>
      </div>
    </article>
  )
}
