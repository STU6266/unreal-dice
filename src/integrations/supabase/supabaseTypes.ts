import type { RemoteQuickStartTemplateRow } from '../../domain/types/remoteTemplates'

export interface SupabaseDatabase {
  public: {
    Tables: {
      quick_start_templates: {
        Row: RemoteQuickStartTemplateRow
        Insert: {
          name: string
          template_key: string
          locked_dice_counting: 'include' | 'exclude'
          sets: unknown
          combos?: unknown
          is_published?: boolean
          sort_order?: number
        }
        Update: Partial<SupabaseDatabase['public']['Tables']['quick_start_templates']['Insert']>
      }
    }
  }
}
