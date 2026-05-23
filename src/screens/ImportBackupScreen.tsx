import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { ImportConfirmDialog } from '../components/backup/ImportConfirmDialog'
import { copy } from '../content/en'
import type { UnrealDiceBackup } from '../domain/types/backup'
import type { DiceGroup } from '../domain/types/groups'
import { createImportedGroups } from '../domain/utils/importedGroupFactory'
import { parseBackupJson } from '../domain/validation/backupValidators'
import { loadUserGroups, saveUserGroups } from '../services/storageService'

type ImportState =
  | { status: 'idle' }
  | { status: 'valid'; backup: UnrealDiceBackup; message: string }
  | { status: 'invalid'; message: string }
  | { status: 'success'; message: string }

export function ImportBackupScreen() {
  const [importState, setImportState] = useState<ImportState>({ status: 'idle' })
  const [preparedGroups, setPreparedGroups] = useState<DiceGroup[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]

    if (file === undefined) {
      setImportState({ status: 'idle' })
      setPreparedGroups([])
      return
    }

    try {
      const rawValue = await file.text()
      const parsedBackup = parseBackupJson(rawValue)

      if (!parsedBackup.isValid || parsedBackup.backup === undefined) {
        setImportState({
          status: 'invalid',
          message: parsedBackup.issues[0]?.message ?? copy.backup.importScreen.errors.noValidBackup,
        })
        setPreparedGroups([])
        return
      }

      const existingGroups = loadUserGroups()
      const importedGroups = createImportedGroups(
        parsedBackup.backup.groups,
        existingGroups,
      )

      if (!importedGroups.ok) {
        setImportState({
          status: 'invalid',
          message: copy.backup.importScreen.errors.maxGroupsReached,
        })
        setPreparedGroups([])
        return
      }

      setPreparedGroups(importedGroups.groups)
      setImportState({
        status: 'valid',
        backup: parsedBackup.backup,
        message: copy.backup.importScreen.validMessage(
          parsedBackup.backup.groups.length,
          parsedBackup.backup.exportType,
        ),
      })
    } catch {
      setImportState({
        status: 'invalid',
        message: copy.backup.importScreen.errors.readFailed,
      })
      setPreparedGroups([])
    }
  }

  function requestImport(): void {
    if (importState.status !== 'valid' || preparedGroups.length === 0) {
      setImportState({
        status: 'invalid',
        message: copy.backup.importScreen.errors.noValidBackup,
      })
      return
    }

    setIsConfirmOpen(true)
  }

  function confirmImport(): void {
    try {
      const existingGroups = loadUserGroups()
      saveUserGroups([...existingGroups, ...preparedGroups])
      setImportState({
        status: 'success',
        message: copy.backup.importScreen.success(preparedGroups.length),
      })
      setPreparedGroups([])
      setIsConfirmOpen(false)
    } catch {
      setImportState({
        status: 'invalid',
        message: copy.backup.importScreen.errors.saveFailed,
      })
      setIsConfirmOpen(false)
    }
  }

  const isImportEnabled = importState.status === 'valid' && preparedGroups.length > 0

  return (
    <section className="list-screen import-screen" aria-labelledby="import-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.backup.importScreen.eyebrow}</p>
        <h1 id="import-title">{copy.backup.importScreen.title}</h1>
        <p>{copy.backup.importScreen.description}</p>
      </div>

      <div className="backup-warning">{copy.backup.importScreen.warning}</div>

      <div className="import-panel">
        <label className="field">
          <span>{copy.backup.importScreen.fileLabel}</span>
          <input type="file" accept=".json,application/json" onChange={handleFileChange} />
          <small>{copy.backup.importScreen.fileHint}</small>
        </label>

        <div
          className={`backup-status backup-status--${importState.status}`}
          role={importState.status === 'invalid' ? 'alert' : 'status'}
        >
          {importState.status === 'idle'
            ? copy.backup.importScreen.fileHint
            : importState.message}
        </div>

        <div className="import-actions">
          <button
            className="button-link button-link--primary"
            type="button"
            disabled={!isImportEnabled}
            onClick={requestImport}
          >
            {copy.backup.importScreen.actions.import}
          </button>
          {importState.status === 'success' ? (
            <Link className="button-link" to="/groups">
              {copy.backup.importScreen.actions.myGroups}
            </Link>
          ) : null}
          <Link className="button-link" to="/">
            {copy.backup.importScreen.actions.back}
          </Link>
        </div>
      </div>

      {isConfirmOpen ? (
        <ImportConfirmDialog
          groupCount={preparedGroups.length}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={confirmImport}
        />
      ) : null}
    </section>
  )
}
