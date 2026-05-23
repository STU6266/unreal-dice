import { Link } from 'react-router-dom'
import { GroupSummaryCard } from '../components/groups/GroupSummaryCard'
import { copy } from '../content/en'
import { useQuickStartTemplates } from '../hooks/useQuickStartTemplates'
import { useUserGroups } from '../hooks/useUserGroups'

export function QuickStartScreen() {
  const { message, error, addCopiedTemplate } = useUserGroups()
  const { templates, source, message: loadMessage, isLoading } = useQuickStartTemplates()

  return (
    <section className="list-screen" aria-labelledby="quick-start-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.quickStart.eyebrow}</p>
        <h1 id="quick-start-title">{copy.quickStart.title}</h1>
        <p>{copy.quickStart.description}</p>
      </div>

      {message ? (
        <div className="status-message" role="status">
          <span>{message}</span>
          <Link to="/groups">{copy.quickStart.actions.myGroups}</Link>
        </div>
      ) : null}

      {error ? (
        <div className="status-message status-message--error" role="alert">
          {error}
        </div>
      ) : null}

      {loadMessage ? (
        <div className="status-message status-message--warning" role="status">
          {copy.quickStart.remoteFallback(source)}
        </div>
      ) : null}

      {isLoading ? (
        <div className="status-message" role="status">
          {copy.quickStart.loading}
        </div>
      ) : null}

      <div className="group-grid">
        {templates.map((template) => (
          <GroupSummaryCard
            key={template.id}
            group={template}
            playTo={`/play/quick-start/${template.id}`}
            onCopy={() => addCopiedTemplate(template)}
            variant="quick-start"
          />
        ))}
      </div>

      <Link className="text-link" to="/">
        {copy.quickStart.actions.backHome}
      </Link>
    </section>
  )
}
