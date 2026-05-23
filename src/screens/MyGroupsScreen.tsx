import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExportDialog } from '../components/backup/ExportDialog'
import { ConfirmDeleteDialog } from '../components/groups/ConfirmDeleteDialog'
import { GroupSummaryCard } from '../components/groups/GroupSummaryCard'
import { copy } from '../content/en'
import type { DiceGroup } from '../domain/types/groups'
import { useUserGroups } from '../hooks/useUserGroups'
import {
  createBackup,
  createBackupFilename,
  downloadBackup,
} from '../services/backupService'

type ExportTarget =
  | { type: 'single'; group: DiceGroup }
  | { type: 'all' }

export function MyGroupsScreen() {
  const { groups, message, error, setMessage, setError, deleteGroup } =
    useUserGroups()
  const [groupPendingDelete, setGroupPendingDelete] = useState<DiceGroup | null>(
    null,
  )
  const [exportTarget, setExportTarget] = useState<ExportTarget | null>(null)

  function confirmDelete(): void {
    if (groupPendingDelete === null) {
      return
    }

    deleteGroup(groupPendingDelete.id)
    setGroupPendingDelete(null)
  }

  function confirmExport(): void {
    if (exportTarget === null) {
      return
    }

    const isSingleExport = exportTarget.type === 'single'
    const exportGroups = isSingleExport ? [exportTarget.group] : groups
    const fileName = isSingleExport
      ? createBackupFilename(exportTarget.group.name)
      : 'unrealdice-all-groups.json'

    downloadBackup(
      createBackup(exportGroups, isSingleExport ? 'single-group' : 'all-groups'),
      fileName,
    )
    setMessage(copy.myGroups.feedback.exported(fileName))
    setError(null)
    setExportTarget(null)
  }

  return (
    <section className="list-screen" aria-labelledby="my-groups-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.myGroups.eyebrow}</p>
        <h1 id="my-groups-title">{copy.myGroups.title}</h1>
        <p>{copy.myGroups.description}</p>
      </div>

      {message ? (
        <div className="status-message" role="status">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="status-message status-message--error" role="alert">
          {error}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <div className="empty-state">
          <h2>{copy.myGroups.emptyTitle}</h2>
          <p>{copy.myGroups.emptyDescription}</p>
          <div className="empty-state__actions">
            <Link className="button-link button-link--primary" to="/quick-start">
              {copy.myGroups.actions.quickStart}
            </Link>
            <Link className="button-link" to="/groups/new">
              {copy.myGroups.actions.createGroup}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="list-toolbar">
            <button
              className="button-link button-link--primary"
              type="button"
              aria-label={copy.myGroups.exportAllLabel}
              onClick={() => setExportTarget({ type: 'all' })}
            >
              {copy.myGroups.actions.exportAll}
            </button>
          </div>
          <div className="group-grid">
            {groups.map((group) => (
              <GroupSummaryCard
                key={group.id}
                group={group}
                playTo={`/play/group/${group.id}`}
                editTo={`/groups/${group.id}/edit`}
                onExport={() => setExportTarget({ type: 'single', group })}
                onDelete={() => setGroupPendingDelete(group)}
              />
            ))}
          </div>
        </>
      )}

      <Link className="text-link" to="/">
        {copy.myGroups.actions.backHome}
      </Link>

      {groupPendingDelete ? (
        <ConfirmDeleteDialog
          groupName={groupPendingDelete.name}
          onCancel={() => setGroupPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {exportTarget ? (
        <ExportDialog
          groupName={exportTarget.type === 'single' ? exportTarget.group.name : undefined}
          groupCount={exportTarget.type === 'single' ? 1 : groups.length}
          onCancel={() => setExportTarget(null)}
          onConfirm={confirmExport}
        />
      ) : null}
    </section>
  )
}
