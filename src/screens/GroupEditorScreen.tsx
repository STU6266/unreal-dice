import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ComboEditorDialog } from '../components/groups/ComboEditorDialog'
import { ComboSummaryCard } from '../components/groups/ComboSummaryCard'
import { GroupHelpDialog } from '../components/groups/GroupHelpDialog'
import { SetEditorDialog } from '../components/groups/SetEditorDialog'
import { SetSlotGrid } from '../components/groups/SetSlotGrid'
import { UnsavedChangesDialog } from '../components/groups/UnsavedChangesDialog'
import { copy } from '../content/en'
import { APP_LIMITS } from '../domain/constants/limits'
import type { DiceCombo, DiceSet } from '../domain/types/dice'
import type { DiceGroup } from '../domain/types/groups'
import type { GroupPlaySession } from '../domain/types/session'
import { deleteCombo, removeSetFromCombos } from '../domain/utils/comboFactory'
import { reconcilePlaySession } from '../domain/utils/sessionReconciliation'
import {
  addEmptySlot,
  areGroupDraftsEqual,
  createGroupDraftFromGroup,
  createNewGroupDraft,
  prepareGroupDraftForSaving,
  resizeSlots,
  wouldDiscardConfiguredSets,
  type GroupDraft,
} from '../domain/utils/groupDraftFactory'
import { loadUserGroups, saveUserGroups } from '../services/storageService'

interface GroupEditorScreenProps {
  mode: 'create' | 'edit'
}

type SaveTarget = 'groups' | 'play'
type ConfirmationKind =
  | 'discard-unsaved'
  | 'reduce-slots'
  | 'remove-set'
  | 'delete-combo'
  | 'empty-slots'
  | 'overwrite'

interface PendingConfirmation {
  kind: ConfirmationKind
  slotCount?: number
  slotId?: string
  comboId?: string
  preparedGroup?: DiceGroup
  saveTarget?: SaveTarget
}

export function GroupEditorScreen({ mode }: GroupEditorScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { groupId } = useParams()
  const playReturnState = location.state as
    | { fromPlay?: boolean; playSession?: GroupPlaySession; previousGroup?: DiceGroup }
    | null
  const savedGroups = useMemo(() => loadUserGroups(), [])
  const existingGroup =
    mode === 'edit' ? savedGroups.find((group) => group.id === groupId) : undefined
  const initialDraft = useMemo(
    () =>
      existingGroup
        ? createGroupDraftFromGroup(existingGroup)
        : createNewGroupDraft(1),
    [existingGroup],
  )
  const [draft, setDraft] = useState<GroupDraft>(initialDraft)
  const [slotCountInput, setSlotCountInput] = useState(String(draft.slots.length))
  const [slotCountError, setSlotCountError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null)
  const [editingComboId, setEditingComboId] = useState<string | null>(null)

  if (mode === 'edit' && existingGroup === undefined) {
    return (
      <section className="placeholder-screen" aria-labelledby="group-not-found-title">
        <div className="placeholder-panel">
          <p className="eyebrow">{copy.groupEditor.editTitle}</p>
          <h1 id="group-not-found-title">{copy.groupEditor.notFoundTitle}</h1>
          <p>{copy.groupEditor.notFoundMessage}</p>
          <Link className="text-link" to="/groups">
            {copy.groupEditor.actions.backToGroups}
          </Link>
        </div>
      </section>
    )
  }

  const currentSlot = draft.slots.find((slot) => slot.id === editingSlotId)
  const hasUnsavedChanges = !areGroupDraftsEqual(draft, initialDraft)
  const configuredSets = draft.slots
    .map((slot) => slot.set)
    .filter((set): set is DiceSet => set !== null)
  const currentCombo =
    editingComboId === null
      ? undefined
      : draft.combos.find((combo) => combo.id === editingComboId) ?? null

  function updateDraft(updater: (current: GroupDraft) => GroupDraft): void {
    setDraft((current) => updater(current))
    setSaveError(null)
  }

  function applySlotCount(): void {
    const nextCount = Number(slotCountInput)

    if (
      !Number.isInteger(nextCount) ||
      nextCount < 1 ||
      nextCount > APP_LIMITS.maxSetsPerGroup
    ) {
      setSlotCountError(copy.groupEditor.errors.slotCount(APP_LIMITS.maxSetsPerGroup))
      return
    }

    if (nextCount < draft.slots.length && wouldDiscardConfiguredSets(draft.slots, nextCount)) {
      setPendingConfirmation({ kind: 'reduce-slots', slotCount: nextCount })
      return
    }

    updateDraft((current) => ({
      ...current,
      slots: resizeSlots(current.slots, nextCount),
    }))
    setSlotCountError(null)
  }

  function addSetSlot(): void {
    if (draft.slots.length >= APP_LIMITS.maxSetsPerGroup) {
      setSaveError(copy.groupEditor.errors.maxSetsReached(APP_LIMITS.maxSetsPerGroup))
      return
    }

    updateDraft((current) => {
      const slots = addEmptySlot(current.slots)
      setSlotCountInput(String(slots.length))
      return { ...current, slots }
    })
  }

  function requestRemoveSlot(slotId: string): void {
    const slot = draft.slots.find((item) => item.id === slotId)

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
    updateDraft((current) => {
      const removedSetId = current.slots.find((slot) => slot.id === slotId)?.set?.id
      const nextSlots = current.slots.filter((slot) => slot.id !== slotId)
      const safeSlots = nextSlots.length > 0 ? nextSlots : resizeSlots([], 1)
      setSlotCountInput(String(safeSlots.length))
      return {
        ...current,
        slots: safeSlots,
        combos:
          removedSetId === undefined
            ? current.combos
            : removeSetFromCombos(current.combos, removedSetId),
      }
    })
  }

  function saveSet(set: DiceSet): void {
    updateDraft((current) => ({
      ...current,
      slots: current.slots.map((slot) =>
        slot.id === editingSlotId ? { ...slot, set } : slot,
      ),
    }))
    setEditingSlotId(null)
  }

  function saveCombo(_combo: DiceCombo, updatedCombos: DiceCombo[]): void {
    updateDraft((current) => ({
      ...current,
      combos: updatedCombos,
    }))
    setEditingComboId(null)
  }

  function requestDeleteCombo(comboId: string): void {
    setPendingConfirmation({ kind: 'delete-combo', comboId })
  }

  function getComboForSet(setId: string): { name: string; color: string } | undefined {
    return draft.combos.find((combo) => combo.setIds.includes(setId))
  }

  function requestSave(target: SaveTarget): void {
    if (mode === 'create' && savedGroups.length >= APP_LIMITS.maxUserGroups) {
      setSaveError(copy.groupEditor.errors.maxGroupsReached)
      return
    }

    const result = prepareGroupDraftForSaving(draft, {
      existingGroup,
    })

    if (!result.ok) {
      setSaveError(result.message)
      return
    }

    if (result.requiresEmptySlotConfirmation) {
      setPendingConfirmation({
        kind: 'empty-slots',
        preparedGroup: result.group,
        saveTarget: target,
      })
      return
    }

    if (mode === 'edit') {
      setPendingConfirmation({
        kind: 'overwrite',
        preparedGroup: result.group,
        saveTarget: target,
      })
      return
    }

    commitGroup(result.group, target)
  }

  function commitGroup(group: DiceGroup, target: SaveTarget): void {
    const nextGroups =
      mode === 'edit'
        ? savedGroups.map((savedGroup) =>
            savedGroup.id === group.id ? group : savedGroup,
          )
        : [...savedGroups, group]

    try {
      saveUserGroups(nextGroups)
      const playState =
        target === 'play' && playReturnState?.playSession && playReturnState.previousGroup
          ? {
              playSession: reconcilePlaySession(
                playReturnState.playSession,
                playReturnState.previousGroup,
                group,
              ),
              previousGroup: group,
            }
          : undefined

      navigate(target === 'play' ? `/play/group/${group.id}` : '/groups', {
        state: playState,
      })
    } catch {
      setSaveError(copy.groupEditor.errors.saveFailed)
    }
  }

  function requestCancel(): void {
    if (hasUnsavedChanges) {
      setPendingConfirmation({ kind: 'discard-unsaved' })
      return
    }

    navigateAfterCancel()
  }

  function navigateAfterCancel(): void {
    if (playReturnState?.fromPlay && playReturnState.playSession && playReturnState.previousGroup) {
      navigate(`/play/group/${playReturnState.previousGroup.id}`, {
        state: {
          playSession: playReturnState.playSession,
          previousGroup: playReturnState.previousGroup,
        },
      })
      return
    }

    navigate('/groups')
  }

  function confirmPendingAction(): void {
    if (pendingConfirmation === null) {
      return
    }

    if (pendingConfirmation.kind === 'discard-unsaved') {
      navigateAfterCancel()
    }

    if (
      pendingConfirmation.kind === 'reduce-slots' &&
      pendingConfirmation.slotCount !== undefined
    ) {
      const slotCount = pendingConfirmation.slotCount
      updateDraft((current) => ({
        ...current,
        slots: resizeSlots(current.slots, slotCount),
      }))
      setSlotCountError(null)
      setSlotCountInput(String(slotCount))
    }

    if (
      pendingConfirmation.kind === 'remove-set' &&
      pendingConfirmation.slotId !== undefined
    ) {
      removeSlot(pendingConfirmation.slotId)
    }

    if (
      pendingConfirmation.kind === 'delete-combo' &&
      pendingConfirmation.comboId !== undefined
    ) {
      const comboId = pendingConfirmation.comboId
      updateDraft((current) => ({
        ...current,
        combos: deleteCombo(current.combos, comboId),
      }))
    }

    if (
      pendingConfirmation.kind === 'empty-slots' &&
      pendingConfirmation.preparedGroup &&
      pendingConfirmation.saveTarget
    ) {
      if (mode === 'edit') {
        setPendingConfirmation({
          kind: 'overwrite',
          preparedGroup: pendingConfirmation.preparedGroup,
          saveTarget: pendingConfirmation.saveTarget,
        })
        return
      }

      commitGroup(pendingConfirmation.preparedGroup, pendingConfirmation.saveTarget)
    }

    if (
      pendingConfirmation.kind === 'overwrite' &&
      pendingConfirmation.preparedGroup &&
      pendingConfirmation.saveTarget
    ) {
      commitGroup(pendingConfirmation.preparedGroup, pendingConfirmation.saveTarget)
    }

    setPendingConfirmation(null)
  }

  const confirmationContent = getConfirmationContent(pendingConfirmation, draft)

  return (
    <section className="list-screen editor-screen" aria-labelledby="group-editor-title">
      <div className="screen-heading">
        <p className="eyebrow">{mode === 'create' ? copy.groupEditor.createTitle : copy.groupEditor.editTitle}</p>
        <h1 id="group-editor-title">
          {mode === 'create' ? copy.groupEditor.createTitle : copy.groupEditor.editTitle}
        </h1>
        <p>{copy.groupEditor.description}</p>
      </div>

      {saveError ? (
        <div className="status-message status-message--error" role="alert">
          {saveError}
        </div>
      ) : null}

      <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
        <div className="editor-form__top-actions">
          <button className="button-link" type="button" onClick={() => setIsHelpOpen(true)}>
            {copy.groupEditor.actions.help}
          </button>
        </div>

        <div className="form-grid form-grid--panel">
          <label className="field">
            <span>{copy.groupEditor.form.groupName}</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, name: event.target.value }))
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
                  lockedDiceCounting:
                    event.target.value === 'include' ? 'include' : 'exclude',
                }))
              }
            >
              <option value="exclude">{copy.groupEditor.form.excludeLockedDice}</option>
              <option value="include">{copy.groupEditor.form.includeLockedDice}</option>
            </select>
          </label>

          <div className="field">
            <label htmlFor="slot-count">{copy.groupEditor.form.initialSlots}</label>
            <div className="inline-control">
              <input
                id="slot-count"
                type="number"
                min={1}
                max={APP_LIMITS.maxSetsPerGroup}
                value={slotCountInput}
                aria-describedby={slotCountError ? 'slot-count-error' : undefined}
                onChange={(event) => setSlotCountInput(event.target.value)}
              />
              <button className="button-link" type="button" onClick={applySlotCount}>
                {copy.groupEditor.actions.createSlots}
              </button>
            </div>
            {slotCountError ? (
              <small className="field-error" id="slot-count-error">
                {slotCountError}
              </small>
            ) : null}
          </div>
        </div>

        <SetSlotGrid
          slots={draft.slots}
          getComboForSet={getComboForSet}
          onConfigureSlot={setEditingSlotId}
          onRemoveSlot={requestRemoveSlot}
        />

        <section className="combo-section" aria-labelledby="combo-section-title">
          <div className="combo-section__header">
            <div>
              <h2 id="combo-section-title">{copy.groupEditor.combos.title}</h2>
              {configuredSets.length === 0 ? (
                <p>{copy.groupEditor.combos.noConfiguredSets}</p>
              ) : null}
            </div>
            <button
              className="button-link"
              type="button"
              disabled={configuredSets.length === 0}
              onClick={() => setEditingComboId('')}
            >
              {copy.groupEditor.actions.addCombo}
            </button>
          </div>

          {draft.combos.length === 0 ? (
            <p className="combo-section__empty">{copy.groupEditor.combos.empty}</p>
          ) : (
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
          )}
        </section>

        <div className="editor-actions">
          <button className="button-link" type="button" onClick={addSetSlot}>
            {copy.groupEditor.actions.addSet}
          </button>
          <button className="button-link button-link--primary" type="button" onClick={() => requestSave('groups')}>
            {copy.groupEditor.actions.save}
          </button>
          <button className="button-link button-link--primary" type="button" onClick={() => requestSave('play')}>
            {copy.groupEditor.actions.saveAndPlay}
          </button>
          <button className="button-link" type="button" onClick={requestCancel}>
            {copy.groupEditor.actions.cancel}
          </button>
        </div>
      </form>

      {currentSlot ? (
        <SetEditorDialog
          set={currentSlot.set}
          slotPosition={draft.slots.findIndex((slot) => slot.id === currentSlot.id) + 1}
          onCancel={() => setEditingSlotId(null)}
          onSave={saveSet}
        />
      ) : null}

      {isHelpOpen ? <GroupHelpDialog onClose={() => setIsHelpOpen(false)} /> : null}

      {editingComboId !== null ? (
        <ComboEditorDialog
          combo={currentCombo ?? null}
          combos={draft.combos}
          sets={configuredSets}
          onCancel={() => setEditingComboId(null)}
          onSave={saveCombo}
        />
      ) : null}

      {pendingConfirmation && confirmationContent ? (
        <UnsavedChangesDialog
          title={confirmationContent.title}
          message={confirmationContent.message}
          confirmLabel={confirmationContent.confirmLabel}
          onCancel={() => setPendingConfirmation(null)}
          onConfirm={confirmPendingAction}
        />
      ) : null}
    </section>
  )
}

function getConfirmationContent(
  pendingConfirmation: PendingConfirmation | null,
  draft: GroupDraft,
):
  | {
      title: string
      message: string
      confirmLabel: string
    }
  | null {
  if (pendingConfirmation === null) {
    return null
  }

  if (pendingConfirmation.kind === 'discard-unsaved') {
    return {
      title: copy.groupEditor.confirmations.unsavedTitle,
      message: copy.groupEditor.confirmations.unsavedMessage,
      confirmLabel: copy.groupEditor.confirmations.discard,
    }
  }

  if (pendingConfirmation.kind === 'reduce-slots') {
    return {
      title: copy.groupEditor.confirmations.reduceSlotsTitle,
      message: copy.groupEditor.confirmations.reduceSlotsMessage,
      confirmLabel: copy.groupEditor.confirmations.confirm,
    }
  }

  if (pendingConfirmation.kind === 'remove-set') {
    const setName =
      draft.slots.find((slot) => slot.id === pendingConfirmation.slotId)?.set?.name ??
      copy.groupEditor.setSlot.empty

    return {
      title: copy.groupEditor.confirmations.removeSetTitle,
      message: copy.groupEditor.confirmations.removeSetMessage(setName),
      confirmLabel: copy.groupEditor.confirmations.remove,
    }
  }

  if (pendingConfirmation.kind === 'delete-combo') {
    const comboName =
      draft.combos.find((combo) => combo.id === pendingConfirmation.comboId)?.name ??
      copy.groupEditor.combos.title

    return {
      title: copy.groupEditor.confirmations.deleteComboTitle,
      message: copy.groupEditor.confirmations.deleteComboMessage(comboName),
      confirmLabel: copy.groupEditor.confirmations.delete,
    }
  }

  if (pendingConfirmation.kind === 'empty-slots') {
    return {
      title: copy.groupEditor.confirmations.emptySlotsTitle,
      message: copy.groupEditor.confirmations.emptySlotsMessage,
      confirmLabel: copy.groupEditor.confirmations.confirm,
    }
  }

  return {
    title: copy.groupEditor.confirmations.overwriteTitle,
    message: copy.groupEditor.confirmations.overwriteMessage(
      pendingConfirmation.preparedGroup?.name ?? draft.name,
    ),
    confirmLabel: copy.groupEditor.confirmations.save,
  }
}
