import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StudioDeleteTemplateDialog } from '../../components/studio/StudioDeleteTemplateDialog'
import { StudioTemplateCard } from '../../components/studio/StudioTemplateCard'
import { copy } from '../../content/en'
import type { RemoteQuickStartTemplateRow } from '../../domain/types/remoteTemplates'
import { useStudioSession } from '../../hooks/useStudioSession'
import {
  deleteStudioTemplate,
  listStudioTemplates,
  setStudioTemplatePublished,
} from '../../services/studioTemplateService'
import { StudioLoginScreen } from './StudioLoginScreen'

export function StudioTemplatesScreen() {
  const { isConfigured, isLoading, session, error, signIn, signOut } = useStudioSession()
  const [templates, setTemplates] = useState<RemoteQuickStartTemplateRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RemoteQuickStartTemplateRow | null>(null)

  const refreshTemplates = useCallback(async (): Promise<void> => {
    const result = await listStudioTemplates()
    if (result.ok && result.data) {
      setTemplates(result.data)
      setLoadError(null)
      return
    }

    setLoadError(result.message ?? copy.studio.errors.loadFailed)
  }, [])

  useEffect(() => {
    if (session === null) {
      return
    }

    queueMicrotask(() => void refreshTemplates())
  }, [refreshTemplates, session])

  if (!isConfigured) {
    return <StudioUnavailableScreen />
  }

  if (isBrowserOffline()) {
    return <StudioOfflineScreen />
  }

  if (isLoading) {
    return (
      <section className="placeholder-screen" aria-labelledby="studio-loading-title">
        <div className="placeholder-panel">
          <p className="eyebrow">{copy.studio.eyebrow}</p>
          <h1 id="studio-loading-title">{copy.studio.loading}</h1>
        </div>
      </section>
    )
  }

  if (session === null) {
    return <StudioLoginScreen error={error} onSignIn={signIn} />
  }

  async function togglePublished(template: RemoteQuickStartTemplateRow): Promise<void> {
    const result = await setStudioTemplatePublished(template.id, !template.is_published)
    if (result.ok && result.data) {
      const updatedTemplate = result.data
      setTemplates((current) =>
        current.map((item) => (item.id === template.id ? updatedTemplate : item)),
      )
      setLoadError(null)
      return
    }

    setLoadError(result.message ?? copy.studio.errors.saveFailed)
  }

  async function confirmDelete(): Promise<void> {
    if (deleteTarget === null) {
      return
    }

    const result = await deleteStudioTemplate(deleteTarget.id)
    if (result.ok) {
      setTemplates((current) => current.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      setLoadError(null)
      return
    }

    setLoadError(result.message ?? copy.studio.errors.deleteFailed)
    setDeleteTarget(null)
  }

  return (
    <section className="list-screen" aria-labelledby="studio-templates-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.studio.eyebrow}</p>
        <h1 id="studio-templates-title">{copy.studio.templates.title}</h1>
        <p>{copy.studio.templates.description}</p>
      </div>

      {loadError ? (
        <div className="status-message status-message--error" role="alert">
          {loadError}
        </div>
      ) : null}

      <div className="list-toolbar">
        <Link className="button-link button-link--primary" to="/studio/templates/new">
          {copy.studio.actions.newTemplate}
        </Link>
        <button className="button-link" type="button" onClick={signOut}>
          {copy.studio.actions.signOut}
        </button>
      </div>

      <div className="group-grid">
        {templates.map((template) => (
          <StudioTemplateCard
            key={template.id}
            template={template}
            onTogglePublished={() => void togglePublished(template)}
            onDelete={() => setDeleteTarget(template)}
          />
        ))}
      </div>

      {templates.length === 0 && !loadError ? (
        <div className="empty-state">
          <h2>{copy.studio.templates.emptyTitle}</h2>
          <p>{copy.studio.templates.emptyDescription}</p>
        </div>
      ) : null}

      {deleteTarget ? (
        <StudioDeleteTemplateDialog
          templateName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </section>
  )
}

function StudioUnavailableScreen() {
  return (
    <section className="placeholder-screen" aria-labelledby="studio-unavailable-title">
      <div className="placeholder-panel">
        <p className="eyebrow">{copy.studio.eyebrow}</p>
        <h1 id="studio-unavailable-title">{copy.studio.unavailable.title}</h1>
        <p>{copy.studio.unavailable.message}</p>
        <Link className="text-link" to="/">
          {copy.backToHome}
        </Link>
      </div>
    </section>
  )
}

function StudioOfflineScreen() {
  return (
    <section className="placeholder-screen" aria-labelledby="studio-offline-title">
      <div className="placeholder-panel">
        <p className="eyebrow">{copy.studio.eyebrow}</p>
        <h1 id="studio-offline-title">{copy.studio.offline.title}</h1>
        <p>{copy.studio.offline.message}</p>
        <Link className="text-link" to="/">
          {copy.backToHome}
        </Link>
      </div>
    </section>
  )
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
