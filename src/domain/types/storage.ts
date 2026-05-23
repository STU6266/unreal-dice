import type { DiceGroup } from './groups'

export interface StoredUserGroupsData {
  schemaVersion: number
  groups: DiceGroup[]
}
