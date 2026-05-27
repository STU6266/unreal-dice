import type { SimpleQuickStartTemplate } from '../utils/simpleQuickStartTemplateMapper'

// Add your own Quick Start templates inside this array.
// You only write names, dice, sides, optional symbol dice, colors, combos, and modifiers.
// IDs, timestamps, defaults, and Quick Start source values are generated for you.
export const customQuickStartTemplates = [
  // Copy this block, remove the comment markers, and edit it:
  //
  // {
  //   name: 'My RPG Battle',
  //   lockedDiceCounting: 'exclude',
  //   sets: [
  //     { name: 'Attack', dice: 1, sides: 20 },
  //     { name: 'Damage', dice: 2, sides: 6 },
  //   ],
  //   combos: [
  //     { name: 'Full Attack', sets: ['Attack', 'Damage'] },
  //   ],
  // },
  {
    name: 'Dice Poker',
    lockedDiceCounting: 'include',
    sets: [
      {
        name: 'Poker Dice',
        dice: 0,
        sides: 6,
        symbolDice: Array.from({ length: 5 }, () => ({
          faces: [
            { type: 'number', value: 9, countsTowardTotal: false },
            { type: 'number', value: 10, countsTowardTotal: false },
            { type: 'letter', value: 'J' },
            { type: 'letter', value: 'Q' },
            { type: 'letter', value: 'K' },
            { type: 'letter', value: 'A' },
          ],
        })),
      },
    ],
  },
] as const satisfies readonly SimpleQuickStartTemplate[]
