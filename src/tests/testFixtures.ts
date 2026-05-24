import { DEFAULT_SET_COLORS } from '../domain/constants/colors'
import type { DiceCombo, DiceSet } from '../domain/types/dice'
import type { DiceGroup, GroupSource } from '../domain/types/groups'
import { createDisabledModifier } from '../domain/utils/modifierUtils'

export function createTestSet(overrides: Partial<DiceSet> = {}): DiceSet {
  return {
    id: 'set-1',
    name: 'Test Set',
    diceCount: 2,
    sides: 6,
    diceColor: DEFAULT_SET_COLORS.diceColor,
    pipColor: DEFAULT_SET_COLORS.pipColor,
    modifier: createDisabledModifier(),
    ...overrides,
  }
}

export function createTestCombo(
  overrides: Partial<DiceCombo> = {},
): DiceCombo {
  return {
    id: 'combo-1',
    name: 'Combo A',
    color: '#7dd3fc',
    setIds: ['set-1'],
    ...overrides,
  }
}

export function createTestGroup(
  overrides: Partial<DiceGroup> = {},
): DiceGroup {
  return {
    id: 'group-1',
    name: 'Test Group',
    source: 'user',
    lockedDiceCounting: 'exclude',
    sets: [createTestSet()],
    combos: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createGroups(count: number, source: GroupSource = 'user'): DiceGroup[] {
  return Array.from({ length: count }, (_, index) =>
    createTestGroup({
      id: `group-${index + 1}`,
      name: `Group ${index + 1}`,
      source,
      sets: [createTestSet({ id: `set-${index + 1}` })],
    }),
  )
}
