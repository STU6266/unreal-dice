import { copy } from '../../content/en'

interface PublishStatusBadgeProps {
  isPublished: boolean
}

export function PublishStatusBadge({ isPublished }: PublishStatusBadgeProps) {
  return (
    <span className={`status-badge${isPublished ? ' status-badge--published' : ''}`}>
      {isPublished ? copy.studio.status.published : copy.studio.status.hidden}
    </span>
  )
}
