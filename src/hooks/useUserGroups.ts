import { useCallback, useState } from 'react'
import { copy } from '../content/en'
import type { QuickStartTemplate } from '../domain/data/quickStartTemplates'
import { addQuickStartTemplateCopy } from '../domain/utils/groupFactory'
import type { DiceGroup } from '../domain/types/groups'
import { loadUserGroups, saveUserGroups } from '../services/storageService'

export function useUserGroups() {
  const [groups, setGroups] = useState<DiceGroup[]>(() => loadUserGroups())
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addCopiedTemplate = useCallback(
    (template: QuickStartTemplate): DiceGroup | null => {
      const result = addQuickStartTemplateCopy(template, groups)

      if (!result.ok) {
        setError(copy.quickStart.errors.maxGroupsReached)
        setMessage(null)
        return null
      }

      try {
        saveUserGroups(result.groups)
        setGroups(result.groups)
        setMessage(copy.quickStart.feedback.copied(result.group.name))
        setError(null)
        return result.group
      } catch {
        setError(copy.quickStart.errors.copyFailed)
        setMessage(null)
        return null
      }
    },
    [groups],
  )

  const deleteGroup = useCallback(
    (groupId: string): void => {
      const nextGroups = groups.filter((group) => group.id !== groupId)
      saveUserGroups(nextGroups)
      setGroups(nextGroups)
      setMessage(copy.myGroups.feedback.deleted)
      setError(null)
    },
    [groups],
  )

  const showExportUnavailable = useCallback((): void => {
    setMessage(copy.myGroups.feedback.exportUnavailable)
    setError(null)
  }, [])

  return {
    groups,
    message,
    error,
    addCopiedTemplate,
    deleteGroup,
    showExportUnavailable,
  }
}
