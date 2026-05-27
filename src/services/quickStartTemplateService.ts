import { QUICK_START_TEMPLATES, type QuickStartTemplate } from '../domain/data/quickStartTemplates'

export function loadQuickStartTemplates(): readonly QuickStartTemplate[] {
  return QUICK_START_TEMPLATES
}

export function findQuickStartTemplate(templateId: string | undefined): QuickStartTemplate | undefined {
  return QUICK_START_TEMPLATES.find((template) => template.id === templateId)
}
