import { useEffect, useState } from 'react'
import {
  loadQuickStartTemplates,
  type QuickStartTemplateLoadResult,
} from '../services/quickStartTemplateService'

interface QuickStartTemplateState extends QuickStartTemplateLoadResult {
  isLoading: boolean
}

export function useQuickStartTemplates(): QuickStartTemplateState {
  const [state, setState] = useState<QuickStartTemplateState>({
    templates: [],
    source: 'built-in',
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true

    void loadQuickStartTemplates().then((result) => {
      if (isMounted) {
        setState({ ...result, isLoading: false })
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
