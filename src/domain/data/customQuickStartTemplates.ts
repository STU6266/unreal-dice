import type { SimpleQuickStartTemplate } from '../utils/simpleQuickStartTemplateMapper'

// Add your own Quick Start templates inside this array.
// You only write names, dice, sides, optional colors, combos, and modifiers.
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
] as const satisfies readonly SimpleQuickStartTemplate[]
