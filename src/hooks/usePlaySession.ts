import { useState } from 'react'
import type { DiceGroup } from '../domain/types/groups'
import type { IndividualDieMode, IndividualDieResult } from '../domain/types/history'
import type { GroupPlaySession } from '../domain/types/session'
import { rollAllSets, rollComboSets, rollSet } from '../domain/utils/diceEngine'
import { createPlaySession } from '../domain/utils/playSessionFactory'
import {
  addSetHistoryEntry,
  createSetHistoryEntry,
} from '../services/setHistoryService'
import { normalizeDieMode } from '../domain/utils/modifierUtils'

export function usePlaySession(
  group: DiceGroup,
  initialSession?: GroupPlaySession,
) {
  const [session, setSession] = useState<GroupPlaySession>(() =>
    initialSession ?? createPlaySession(group),
  )

  function toggleSetExpanded(setId: string): void {
    setSession((current) => {
      const setState = current.setStates[setId]
      if (setState === undefined) {
        return current
      }

      return {
        ...current,
        setStates: {
          ...current.setStates,
          [setId]: {
            ...setState,
            isExpanded: !setState.isExpanded,
          },
        },
      }
    })
  }

  function rollSingleSet(setId: string): void {
    const set = group.sets.find((item) => item.id === setId)
    if (set === undefined) {
      return
    }

    setSession((current) => {
      const nextSetState = rollSet(
        set,
        current.setStates[setId],
        group.lockedDiceCounting,
      )
      addSetHistoryEntry(
        createSetHistoryEntry(
          set,
          nextSetState.diceResults,
          group.lockedDiceCounting,
          nextSetState.total ?? 0,
          undefined,
          undefined,
          nextSetState.setModifierActive,
        ),
      )

      return {
        ...current,
        setStates: {
          ...current.setStates,
          [setId]: nextSetState,
        },
      }
    })
  }

  function rollAll(): void {
    setSession((current) => {
      const nextSession = rollAllSets(group, current)
      group.sets.forEach((set) => {
        const setState = nextSession.setStates[set.id]
        if (setState !== undefined && setState.total !== null) {
          addSetHistoryEntry(
            createSetHistoryEntry(
              set,
              setState.diceResults,
              group.lockedDiceCounting,
              setState.total,
              undefined,
              undefined,
              setState.setModifierActive,
            ),
          )
        }
      })
      return nextSession
    })
  }

  function rollCombo(comboId: string): void {
    const combo = group.combos.find((item) => item.id === comboId)
    if (combo === undefined) {
      return
    }

    setSession((current) => {
      const nextSession = rollComboSets(group, current, comboId)
      combo.setIds.forEach((setId) => {
        const set = group.sets.find((item) => item.id === setId)
        const setState = nextSession.setStates[setId]
        if (set !== undefined && setState !== undefined && setState.total !== null) {
          addSetHistoryEntry(
            createSetHistoryEntry(
              set,
              setState.diceResults,
              group.lockedDiceCounting,
              setState.total,
              undefined,
              undefined,
              setState.setModifierActive,
            ),
          )
        }
      })
      return nextSession
    })
  }

  function toggleDieLocked(setId: string, dieIndex: number): void {
    setSession((current) => {
      const setState = current.setStates[setId]
      const set = group.sets.find((item) => item.id === setId)

      if (setState === undefined || set === undefined || dieIndex >= set.diceCount) {
        return current
      }

      const diceResults: IndividualDieResult[] =
        setState.diceResults.length > 0
          ? setState.diceResults
          : Array.from({ length: set.diceCount }, () => ({
              value: 0,
              mode:
                set.modifier.enabled && set.modifier.application === 'each-die'
                  ? 'modifier-active'
                  : 'normal',
            }))

      return {
        ...current,
        setStates: {
          ...current.setStates,
          [setId]: {
            ...setState,
            diceResults: diceResults.map((currentDie, index) =>
              index === dieIndex
                ? {
                    ...currentDie,
                    mode: getNextDieMode(
                      normalizeDieMode(currentDie),
                      set.modifier.enabled && set.modifier.application === 'each-die',
                    ),
                  }
                : currentDie,
            ),
          },
        },
      }
    })
  }

  function toggleSetModifierActive(setId: string): void {
    const set = group.sets.find((item) => item.id === setId)
    if (set?.modifier.enabled !== true || set.modifier.application !== 'set-total') {
      return
    }

    setSession((current) => {
      const setState = current.setStates[setId]
      if (setState === undefined) {
        return current
      }

      return {
        ...current,
        setStates: {
          ...current.setStates,
          [setId]: {
            ...setState,
            setModifierActive: !setState.setModifierActive,
          },
        },
      }
    })
  }

  function resetSetState(setId: string, nextGroup: DiceGroup = group): void {
    const freshSession = createPlaySession(nextGroup)
    const freshSetState = freshSession.setStates[setId]
    if (freshSetState === undefined) {
      return
    }

    setSession((current) => ({
      ...current,
      setStates: {
        ...current.setStates,
        [setId]: freshSetState,
      },
      lastRollAllTotal: null,
      comboTotals: freshSession.comboTotals,
    }))
  }

  return {
    session,
    toggleSetExpanded,
    rollSingleSet,
    rollAll,
    rollCombo,
    toggleDieLocked,
    toggleSetModifierActive,
    resetSetState,
  }
}

function getNextDieMode(
  currentMode: IndividualDieMode,
  hasEachDieModifier: boolean,
): IndividualDieMode {
  if (!hasEachDieModifier) {
    return currentMode === 'locked' ? 'normal' : 'locked'
  }

  if (currentMode === 'modifier-active') {
    return 'normal'
  }

  if (currentMode === 'normal') {
    return 'locked'
  }

  return 'modifier-active'
}
