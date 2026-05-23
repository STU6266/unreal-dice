import { DEFAULT_SET_COLORS } from '../constants/colors'
import type { DiceCombo, DiceSet } from '../types/dice'
import type { DiceGroup } from '../types/groups'

type ReadonlyDiceSet = Readonly<DiceSet>
type ReadonlyDiceCombo = Readonly<DiceCombo> & {
  readonly setIds: readonly string[]
}
type ReadonlyQuickStartGroup = Omit<
  Readonly<DiceGroup>,
  'sets' | 'combos' | 'source'
> & {
  readonly source: 'quick-start'
  readonly sets: readonly ReadonlyDiceSet[]
  readonly combos: readonly ReadonlyDiceCombo[]
}

export type QuickStartTemplate = ReadonlyQuickStartGroup

const TEMPLATE_TIMESTAMP = '2026-01-01T00:00:00.000Z'

function createTemplateSet(
  templateId: string,
  name: string,
  diceCount: number,
  sides: number,
): ReadonlyDiceSet {
  return {
    id: `${templateId}-${name.toLowerCase().replaceAll(' ', '-').replaceAll('/', '')}`,
    name,
    diceCount,
    sides,
    diceColor: DEFAULT_SET_COLORS.diceColor,
    pipColor: DEFAULT_SET_COLORS.pipColor,
    modifier: 0,
  }
}

export const QUICK_START_TEMPLATES = [
  {
    id: 'quick-start-standard-dice',
    name: 'Standard Dice',
    source: 'quick-start',
    lockedDiceCounting: 'exclude',
    sets: [
      createTemplateSet('standard-dice', 'd4', 1, 4),
      createTemplateSet('standard-dice', 'd6', 1, 6),
      createTemplateSet('standard-dice', 'd8', 1, 8),
      createTemplateSet('standard-dice', 'd10', 1, 10),
      createTemplateSet('standard-dice', 'd12', 1, 12),
      createTemplateSet('standard-dice', 'd20', 1, 20),
      createTemplateSet('standard-dice', 'd100', 1, 100),
    ],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-yahtzee',
    name: 'Yahtzee',
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [createTemplateSet('yahtzee', 'Yahtzee Roll', 5, 6)],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-risk',
    name: 'Risk',
    source: 'quick-start',
    lockedDiceCounting: 'exclude',
    sets: [
      createTemplateSet('risk', 'Attack', 3, 6),
      createTemplateSet('risk', 'Defense', 2, 6),
    ],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-monopoly-style',
    name: 'Monopoly Style',
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [createTemplateSet('monopoly-style', 'Move Roll', 2, 6)],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-farkle',
    name: 'Farkle',
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [createTemplateSet('farkle', 'Farkle Roll', 6, 6)],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-liars-dice',
    name: "Liar's Dice",
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [createTemplateSet('liars-dice', 'Player Hand', 5, 6)],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-ten-dice',
    name: 'Ten Dice',
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [createTemplateSet('ten-dice', 'Ten Dice', 10, 6)],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-tabletop-rpg-essentials',
    name: 'Tabletop RPG Essentials',
    source: 'quick-start',
    lockedDiceCounting: 'exclude',
    sets: [
      createTemplateSet('tabletop-rpg-essentials', 'Check / Attack', 1, 20),
      createTemplateSet('tabletop-rpg-essentials', 'Damage d6', 1, 6),
      createTemplateSet('tabletop-rpg-essentials', 'Damage d8', 1, 8),
      createTemplateSet('tabletop-rpg-essentials', 'Damage d10', 1, 10),
      createTemplateSet('tabletop-rpg-essentials', 'Damage d12', 1, 12),
      createTemplateSet('tabletop-rpg-essentials', 'Percent Roll', 1, 100),
    ],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-simple-kids-dice',
    name: 'Simple Kids Dice',
    source: 'quick-start',
    lockedDiceCounting: 'include',
    sets: [
      createTemplateSet('simple-kids-dice', 'Single Roll', 1, 6),
      createTemplateSet('simple-kids-dice', 'Double Roll', 2, 6),
    ],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
  {
    id: 'quick-start-random-tables',
    name: 'Random Tables',
    source: 'quick-start',
    lockedDiceCounting: 'exclude',
    sets: [
      createTemplateSet('random-tables', 'd2 Choice', 1, 2),
      createTemplateSet('random-tables', 'd20 Table', 1, 20),
      createTemplateSet('random-tables', 'd100 Table', 1, 100),
    ],
    combos: [],
    createdAt: TEMPLATE_TIMESTAMP,
    updatedAt: TEMPLATE_TIMESTAMP,
  },
] as const satisfies readonly ReadonlyQuickStartGroup[]
