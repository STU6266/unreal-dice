import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ComboEditorDialog } from '../components/groups/ComboEditorDialog'
import { ComboRollButton } from '../components/play/ComboRollButton'
import { RollAllButton } from '../components/play/RollAllButton'
import { SetActionDialog } from '../components/play/SetActionDialog'
import { SetHistoryDialog } from '../components/play/SetHistoryDialog'
import { SetPlayTile } from '../components/play/SetPlayTile'
import { copy } from '../content/en'
import type { QuickStartTemplate } from '../domain/data/quickStartTemplates'
import type { DiceCombo, DiceSet } from '../domain/types/dice'
import type { DiceGroup } from '../domain/types/groups'
import type { GroupPlaySession } from '../domain/types/session'
import type { SetHistoryEntry } from '../domain/types/history'
import { addQuickStartTemplateCopy } from '../domain/utils/groupFactory'
import { usePlaySession } from '../hooks/usePlaySession'
import { loadUserGroups, saveUserGroups } from '../services/storageService'
import { createPlaySession } from '../domain/utils/playSessionFactory'
import { loadSetHistory, clearSetHistory } from '../services/setHistoryService'
import { findQuickStartTemplate } from '../services/quickStartTemplateService'
import { useEffect, useState } from 'react'

interface PlayModeScreenProps {
  source: 'quick-start' | 'saved'
}

export function PlayModeScreen({ source }: PlayModeScreenProps) {
  const { groupId } = useParams()
  const [quickStartGroup, setQuickStartGroup] = useState<QuickStartTemplate | null>(null)
  const [isLoadingQuickStart, setIsLoadingQuickStart] = useState(source === 'quick-start')
  const group =
    source === 'quick-start'
      ? quickStartGroup === null
        ? null
        : cloneQuickStartTemplateToGroup(quickStartGroup)
      : loadUserGroups().find((savedGroup) => savedGroup.id === groupId)

  useEffect(() => {
    if (source !== 'quick-start') {
      return
    }

    let isMounted = true
    void findQuickStartTemplate(groupId).then((template) => {
      if (isMounted) {
        setQuickStartGroup(template ?? null)
        setIsLoadingQuickStart(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [groupId, source])

  if (isLoadingQuickStart) {
    return (
      <section className="placeholder-screen" aria-labelledby="play-loading-title">
        <div className="placeholder-panel">
          <p className="eyebrow">{copy.play.eyebrow}</p>
          <h1 id="play-loading-title">{copy.play.loading}</h1>
        </div>
      </section>
    )
  }

  if (group == null) {
    return (
      <section className="placeholder-screen" aria-labelledby="play-not-found-title">
        <div className="placeholder-panel">
          <p className="eyebrow">{copy.play.eyebrow}</p>
          <h1 id="play-not-found-title">{copy.play.notFoundTitle}</h1>
          <p>{copy.play.notFoundMessage}</p>
          <Link className="text-link" to={source === 'quick-start' ? '/quick-start' : '/groups'}>
            {source === 'quick-start'
              ? copy.play.actions.backQuickStart
              : copy.play.actions.backMyGroups}
          </Link>
        </div>
      </section>
    )
  }

  return <LoadedPlayMode group={group} source={source} />
}

function LoadedPlayMode({
  group,
  source,
}: {
  group: DiceGroup
  source: PlayModeScreenProps['source']
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as
    | { playSession?: GroupPlaySession; previousGroup?: DiceGroup }
    | null
  const [activeGroup, setActiveGroup] = useState(group)
  const [activeSetId, setActiveSetId] = useState<string | null>(null)
  const [historySetId, setHistorySetId] = useState<string | null>(null)
  const [historyEntries, setHistoryEntries] = useState<SetHistoryEntry[]>([])
  const [isAddingCombo, setIsAddingCombo] = useState(false)
  const {
    session,
    toggleSetExpanded,
    rollSingleSet,
    rollAll,
    rollCombo,
    toggleDieLocked,
  } = usePlaySession(activeGroup, routeState?.playSession)

  const activeSet =
    activeSetId === null
      ? undefined
      : activeGroup.sets.find((set) => set.id === activeSetId)
  const historySet =
    historySetId === null
      ? undefined
      : activeGroup.sets.find((set) => set.id === historySetId)

  return (
    <section className="play-screen" aria-labelledby="play-title">
      <h1 id="play-title">{activeGroup.name}</h1>

      <div className="play-set-grid">
        {activeGroup.sets.map((set) => {
          const fallbackSession = createPlaySession(activeGroup)
          const setState = session.setStates[set.id] ?? fallbackSession.setStates[set.id]

          if (setState === undefined) {
            return null
          }

          return (
            <SetPlayTile
              key={set.id}
              set={set}
              state={setState}
              onToggleExpanded={() => toggleSetExpanded(set.id)}
              onOpenMenu={() => setActiveSetId(set.id)}
              onRoll={() => rollSingleSet(set.id)}
              onToggleDieLocked={(dieIndex) => toggleDieLocked(set.id, dieIndex)}
            />
          )
        })}
      </div>

      <section className="play-actions" aria-label="Play actions">
        <RollAllButton total={session.lastRollAllTotal} onRoll={rollAll} />

        {activeGroup.combos.length > 0 ? (
          <div className="combo-roll-grid">
            {activeGroup.combos.map((combo) => {
              const isValidCombo = combo.setIds.some((setId) =>
                activeGroup.sets.some((set) => set.id === setId),
              )

              return (
                <ComboRollButton
                  key={combo.id}
                  name={combo.name}
                  total={session.comboTotals[combo.id] ?? null}
                  color={combo.color}
                  disabled={!isValidCombo}
                  onRoll={() => rollCombo(combo.id)}
                />
              )
            })}
          </div>
        ) : null}

        <div className="play-bottom-actions">
          <Link className="button-link" to={source === 'quick-start' ? '/quick-start' : '/groups'}>
            {source === 'quick-start'
              ? copy.play.actions.backQuickStart
              : copy.play.actions.backMyGroups}
          </Link>
          {source === 'saved' ? (
            <>
              <button className="button-link" type="button" onClick={() => setIsAddingCombo(true)}>
                {copy.groupEditor.actions.addCombo}
              </button>
              <button
                className="button-link"
                type="button"
                onClick={() =>
                  navigate(`/groups/${activeGroup.id}/edit`, {
                    state: { fromPlay: true, playSession: session, previousGroup: activeGroup },
                  })
                }
              >
                {copy.play.actions.groupSetup}
              </button>
            </>
          ) : (
            <>
              <button className="button-link" type="button" disabled>
                {copy.play.actions.copyBeforeCombos}
              </button>
              <button className="button-link" type="button" onClick={copyQuickStartToEdit}>
                {copy.play.actions.copyToEdit}
              </button>
            </>
          )}
        </div>
      </section>

      {activeSet ? (
        <SetActionDialog
          setName={activeSet.name}
          source={source}
          onHistory={() => openHistory(activeSet.id)}
          onSetSetup={() =>
            navigate(`/groups/${activeGroup.id}/edit`, {
              state: { fromPlay: true, playSession: session, previousGroup: activeGroup },
            })
          }
          onCopyToEdit={copyQuickStartToEdit}
          onClose={() => setActiveSetId(null)}
        />
      ) : null}

      {historySet ? (
        <SetHistoryDialog
          setName={historySet.name}
          entries={historyEntries}
          onClear={() => {
            clearSetHistory(historySet.id)
            setHistoryEntries([])
          }}
          onClose={() => setHistorySetId(null)}
        />
      ) : null}

      {isAddingCombo && source === 'saved' ? (
        <ComboEditorDialog
          combo={null}
          combos={activeGroup.combos}
          sets={activeGroup.sets}
          onCancel={() => setIsAddingCombo(false)}
          onSave={savePlayCombo}
        />
      ) : null}
    </section>
  )

  function openHistory(setId: string): void {
    setActiveSetId(null)
    setHistorySetId(setId)
    setHistoryEntries(loadSetHistory(setId))
  }

  function savePlayCombo(_combo: DiceCombo, updatedCombos: DiceCombo[]): void {
    const nextGroup = { ...activeGroup, combos: updatedCombos, updatedAt: new Date().toISOString() }
    const groups = loadUserGroups()
    saveUserGroups(groups.map((item) => (item.id === nextGroup.id ? nextGroup : item)))
    setActiveGroup(nextGroup)
    setIsAddingCombo(false)
  }

  function copyQuickStartToEdit(): void {
    if (source !== 'quick-start') {
      return
    }

    const groups = loadUserGroups()
    const result = addQuickStartTemplateCopy(createQuickStartTemplateFromGroup(activeGroup), groups)
    if (result.ok) {
      saveUserGroups(result.groups)
      navigate(`/groups/${result.group.id}/edit`)
    }
  }
}

function createQuickStartTemplateFromGroup(group: DiceGroup): QuickStartTemplate {
  return {
    id: group.id,
    name: group.name,
    source: 'quick-start',
    lockedDiceCounting: group.lockedDiceCounting,
    sets: group.sets.map((set): DiceSet => ({ ...set })),
    combos: group.combos.map((combo): DiceCombo => ({ ...combo, setIds: [...combo.setIds] })),
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  }
}

function cloneQuickStartTemplateToGroup(template: QuickStartTemplate): DiceGroup {
  return {
    id: template.id,
    name: template.name,
    source: 'quick-start',
    lockedDiceCounting: template.lockedDiceCounting,
    sets: template.sets.map((set): DiceSet => ({ ...set })),
    combos: template.combos.map((combo): DiceCombo => ({ ...combo, setIds: [...combo.setIds] })),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }
}
