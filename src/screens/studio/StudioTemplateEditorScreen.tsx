import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ComboEditorDialog } from '../../components/groups/ComboEditorDialog'
import { ComboSummaryCard } from '../../components/groups/ComboSummaryCard'
import { SetEditorDialog } from '../../components/groups/SetEditorDialog'
import { SetSlotGrid } from '../../components/groups/SetSlotGrid'
import { UnsavedChangesDialog } from '../../components/groups/UnsavedChangesDialog'
import { copy } from '../../content/en'
import { APP_LIMITS } from '../../domain/constants/limits'
import type { DiceCombo, DiceSet } from '../../domain/types/dice'
import type { RemoteQuickStartTemplateRow, StudioTemplateDraft } from '../../domain/types/remoteTemplates'
import { deleteCombo, removeSetFromCombos } from '../../domain/utils/comboFactory'
import {
  createNewStudioTemplateDraft,
  createTemplateKeyFromName,
  mapRemoteRowToStudioDraft,
  prepareStudioTemplatePayload,
} from '../../domain/utils/remoteTemplateMapper'
import {
  addEmptySlot,
  createEmptySlots,
  type SetSlotDraft,
} from '../../domain/utils/groupDraftFactory'
import { useStudioSession } from '../../hooks/useStudioSession'
import {
  createStudioTemplate,
  getStudioTemplate,
  updateStudioTemplate,
} from '../../services/studioTemplateService'
import { StudioLoginScreen } from './StudioLoginScreen'

interface StudioTemplateEditorScreenProps {
  mode: 'create' | 'edit'
}

type PendingConfirmation =
  | { kind: 'remove-set'; slotId: string }
  | { kind: 'delete-combo'; comboId: string }

export function StudioTemplateEditorScreen({ mode }: StudioTemplateEditorScreenProps) {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const { isConfigured, isLoading, session, error, signIn } = useStudioSession()
  const [draft, setDraft] = useState<StudioTemplateDraft>(createNewStudioTemplateDraft)
  const [slots, setSlots] = useState<SetSlotDraft[]>(createEmptySlots(1))
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(mode === 'edit')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [editingComboId, setEditingComboId] = useState<string | null | undefined>(undefined)
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || session === null || templateId === undefined) {
      return
    }

    let isMounted = true
    void getStudioTemplate(templateId).then((result) => {
      if (!isMounted) {
        return
      }

      if (result.ok && result.data) {
        const mappedDraft = mapRemoteRowToStudioDraft(result.data)
        if (mappedDraft === null) {
          setSaveError(copy.studio.errors.invalidTemplate)
        } else {
          setDraft(mappedDraft)
          setSlots(createSlotsFromTemplate(result.data))
          setSaveError(null)
        }
      } else {
        setSaveError(result.message ?? copy.studio.errors.loadFailed)
      }
      setIsLoadingTemplate(false)
    })

    return () => {
      isMounted = false
    }
  }, [mode, session, templateId])

  if (!isConfigured) {
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

  if (isBrowserOffline()) {
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

  if (isLoading || isLoadingTemplate) {
    return (
      <section className="placeholder-screen" aria-labelledby="studio-editor-loading-title">
        <div className="placeholder-panel">
          <p className="eyebrow">{copy.studio.eyebrow}</p>
          <h1 id="studio-editor-loading-title">{copy.studio.loading}</h1>
        </div>
      </section>
    )
  }

  if (session === null) {
    return <StudioLoginScreen error={error} onSignIn={signIn} />
  }

  const currentSlot = slots.find((slot) => slot.id === editingSlotId)
  const configuredSets = slots
    .map((slot) => slot.set)
    .filter((set): set is DiceSet => set !== null)
  const currentCombo =
    editingComboId === undefined
      ? undefined
      : editingComboId === null
        ? null
        : draft.combos.find((combo) => combo.id === editingComboId) ?? null

  function updateDraft(updater: (current: StudioTemplateDraft) => StudioTemplateDraft): void {
    setDraft(updater)
    setSaveError(null)
  }

  function updateName(name: string): void {
    updateDraft((current) => ({
      ...current,
      name,
      templateKey:
        mode === 'create' && current.templateKey.trim() === ''
          ? createTemplateKeyFromName(name)
          : current.templateKey,
    }))
  }

  function addSetSlot(): void {
    if (slots.length >= APP_LIMITS.maxSetsPerGroup) {
      setSaveError(copy.groupEditor.errors.maxSetsReached(APP_LIMITS.maxSetsPerGroup))
      return
    }

    setSlots((current) => addEmptySlot(current))
  }

  function saveSet(set: DiceSet): void {
    setSlots((current) =>
      current.map((slot) => (slot.id === editingSlotId ? { ...slot, set } : slot)),
    )
    setEditingSlotId(null)
  }

  function requestRemoveSlot(slotId: string): void {
    const slot = slots.find((item) => item.id === slotId)
    if (slot === undefined) {
      return
    }

    if (slot.set === null) {
      removeSlot(slotId)
      return
    }

    setPendingConfirmation({ kind: 'remove-set', slotId })
  }

  function removeSlot(slotId: string): void {
    const removedSetId = slots.find((slot) => slot.id === slotId)?.set?.id
    setSlots((current) => {
      const nextSlots = current.filter((slot) => slot.id !== slotId)
      return nextSlots.length > 0 ? nextSlots : createEmptySlots(1)
    })

    if (removedSetId !== undefined) {
      updateDraft((current) => ({
        ...current,
        combos: removeSetFromCombos(current.combos, removedSetId),
      }))
    }
  }

  function saveCombo(_combo: DiceCombo, updatedCombos: DiceCombo[]): void {
    updateDraft((current) => ({ ...current, combos: updatedCombos }))
    setEditingComboId(undefined)
  }

  function requestDeleteCombo(comboId: string): void {
    setPendingConfirmation({ kind: 'delete-combo', comboId })
  }

  function getComboForSet(setId: string): { name: string; color: string } | undefined {
    return draft.combos.find((combo) => combo.setIds.includes(setId))
  }

  async function saveTemplate(): Promise<void> {
    const prepared = prepareStudioTemplatePayload({
      ...draft,
      sets: configuredSets,
    })

    if (!prepared.ok) {
      setSaveError(prepared.message)
      return
    }

    const result =
      mode === 'edit' && draft.id
        ? await updateStudioTemplate(draft.id, prepared.payload)
        : await createStudioTemplate(prepared.payload)

    if (result.ok) {
      navigate('/studio/templates')
      return
    }

    setSaveError(result.message ?? copy.studio.errors.saveFailed)
  }

  function confirmPendingAction(): void {
    if (pendingConfirmation === null) {
      return
    }

    if (pendingConfirmation.kind === 'remove-set') {
      removeSlot(pendingConfirmation.slotId)
    } else {
      updateDraft((current) => ({
        ...current,
        combos: deleteCombo(current.combos, pendingConfirmation.comboId),
      }))
    }
    setPendingConfirmation(null)
  }

  return (
    <section className="editor-screen" aria-labelledby="studio-editor-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.studio.eyebrow}</p>
        <h1 id="studio-editor-title">
          {mode === 'create'
            ? copy.studio.editor.createTitle
            : copy.studio.editor.editTitle}
        </h1>
        <p>{copy.studio.editor.description}</p>
      </div>

      {saveError ? (
        <div className="status-message status-message--error" role="alert">
          {saveError}
        </div>
      ) : null}

      <div className="editor-panel">
        <div className="form-grid">
          <label className="field">
            <span>{copy.studio.fields.name}</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => updateName(event.target.value)}
            />
          </label>
          <label className="field">
            <span>{copy.studio.fields.templateKey}</span>
            <input
              type="text"
              value={draft.templateKey}
              readOnly={mode === 'edit'}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  templateKey: createTemplateKeyFromName(event.target.value),
                }))
              }
            />
          </label>
          <label className="field">
            <span>{copy.studio.fields.sortOrder}</span>
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value),
                }))
              }
            />
          </label>
          <label className="field">
            <span>{copy.groupEditor.form.lockedDiceCounting}</span>
            <select
              value={draft.lockedDiceCounting}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  lockedDiceCounting: event.target.value === 'include' ? 'include' : 'exclude',
                }))
              }
            >
              <option value="exclude">{copy.groupEditor.form.excludeLockedDice}</option>
              <option value="include">{copy.groupEditor.form.includeLockedDice}</option>
            </select>
          </label>
          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  isPublished: event.target.checked,
                }))
              }
            />
            <span>{copy.studio.fields.published}</span>
          </label>
        </div>
      </div>

      <div className="editor-toolbar">
        <button className="button-link" type="button" onClick={addSetSlot}>
          {copy.groupEditor.actions.addSet}
        </button>
        <button
          className="button-link"
          type="button"
          disabled={configuredSets.length === 0}
          onClick={() => setEditingComboId(null)}
        >
          {copy.groupEditor.actions.addCombo}
        </button>
      </div>

      <SetSlotGrid
        slots={slots}
        getComboForSet={getComboForSet}
        onConfigureSlot={setEditingSlotId}
        onRemoveSlot={requestRemoveSlot}
      />

      <section className="combo-section" aria-labelledby="studio-combos-title">
        <div className="section-heading">
          <h2 id="studio-combos-title">{copy.groupEditor.combos.title}</h2>
          <p>
            {configuredSets.length === 0
              ? copy.groupEditor.combos.noConfiguredSets
              : copy.groupEditor.combos.empty}
          </p>
        </div>
        <div className="combo-grid">
          {draft.combos.map((combo) => (
            <ComboSummaryCard
              key={combo.id}
              combo={combo}
              sets={configuredSets}
              onEdit={() => setEditingComboId(combo.id)}
              onDelete={() => requestDeleteCombo(combo.id)}
            />
          ))}
        </div>
      </section>

      <div className="editor-actions">
        <Link className="button-link" to="/studio/templates">
          {copy.studio.actions.cancel}
        </Link>
        <button className="button-link button-link--primary" type="button" onClick={() => void saveTemplate()}>
          {copy.studio.actions.save}
        </button>
      </div>

      {currentSlot ? (
        <SetEditorDialog
          set={currentSlot.set}
          slotPosition={slots.findIndex((slot) => slot.id === currentSlot.id) + 1}
          onCancel={() => setEditingSlotId(null)}
          onSave={saveSet}
        />
      ) : null}

      {editingComboId !== undefined ? (
        <ComboEditorDialog
          combo={currentCombo ?? null}
          combos={draft.combos}
          sets={configuredSets}
          onCancel={() => setEditingComboId(undefined)}
          onSave={saveCombo}
        />
      ) : null}

      {pendingConfirmation ? (
        <UnsavedChangesDialog
          title={
            pendingConfirmation.kind === 'remove-set'
              ? copy.groupEditor.confirmations.removeSetTitle
              : copy.groupEditor.confirmations.deleteComboTitle
          }
          message={
            pendingConfirmation.kind === 'remove-set'
              ? copy.groupEditor.confirmations.removeSetMessage(
                  slots.find((slot) => slot.id === pendingConfirmation.slotId)?.set?.name ??
                    copy.groupEditor.setSlot.empty,
                )
              : copy.groupEditor.confirmations.deleteComboMessage(
                  draft.combos.find((combo) => combo.id === pendingConfirmation.comboId)?.name ??
                    copy.groupEditor.combos.title,
                )
          }
          confirmLabel={
            pendingConfirmation.kind === 'remove-set'
              ? copy.groupEditor.confirmations.remove
              : copy.groupEditor.confirmations.delete
          }
          onCancel={() => setPendingConfirmation(null)}
          onConfirm={confirmPendingAction}
        />
      ) : null}
    </section>
  )
}

function createSlotsFromTemplate(row: RemoteQuickStartTemplateRow): SetSlotDraft[] {
  if (!Array.isArray(row.sets) || row.sets.length === 0) {
    return createEmptySlots(1)
  }

  return (row.sets as DiceSet[]).map((set) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `slot-${set.id}`,
    set: { ...set },
  }))
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
