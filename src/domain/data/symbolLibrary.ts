import type { ColorSymbolFace, IconSymbolFace, LetterSymbolFace } from '../types/dice'

export interface SymbolLibraryCategory {
  name: string
  symbols: IconSymbolFace[]
}

function icon(
  category: string,
  subgroup: string,
  id: string,
  label: string,
  symbol: string,
): IconSymbolFace {
  return { type: 'icon', id, category, subgroup, label, symbol }
}

export const SYMBOL_LIBRARY_CATEGORIES: readonly SymbolLibraryCategory[] = [
  {
    name: 'Fantasy',
    symbols: [
      icon('Fantasy', 'Combat', 'sword', 'Sword', '⚔'),
      icon('Fantasy', 'Combat', 'shield', 'Shield', '🛡'),
      icon('Fantasy', 'Combat', 'skull', 'Skull', '☠'),
      icon('Fantasy', 'Royal', 'crown', 'Crown', '👑'),
      icon('Fantasy', 'Loot', 'treasure', 'Treasure', '💰'),
      icon('Fantasy', 'Magic', 'potion', 'Potion', '🧪'),
      icon('Fantasy', 'Creatures', 'dragon', 'Dragon', '🐉'),
      icon('Fantasy', 'Places', 'castle', 'Castle', '♜'),
      icon('Fantasy', 'Magic', 'magic', 'Magic', '✨'),
      icon('Fantasy', 'Magic', 'scroll', 'Scroll', '📜'),
    ],
  },
  {
    name: 'Elements',
    symbols: [
      icon('Elements', 'Primary', 'fire', 'Fire', '🔥'),
      icon('Elements', 'Primary', 'water', 'Water', '💧'),
      icon('Elements', 'Primary', 'earth', 'Earth', '🪨'),
      icon('Elements', 'Primary', 'air', 'Air', '≈'),
      icon('Elements', 'Weather', 'ice', 'Ice', '❄'),
      icon('Elements', 'Weather', 'lightning', 'Lightning', '⚡'),
      icon('Elements', 'Sky', 'sun', 'Sun', '☀'),
      icon('Elements', 'Sky', 'moon', 'Moon', '☾'),
      icon('Elements', 'Nature', 'leaf', 'Leaf', '🌿'),
      icon('Elements', 'Nature', 'mountain', 'Mountain', '⛰'),
    ],
  },
  {
    name: 'Actions',
    symbols: [
      icon('Actions', 'Conflict', 'attack', 'Attack', '⚔'),
      icon('Actions', 'Conflict', 'defend', 'Defend', '🛡'),
      icon('Actions', 'Support', 'heal', 'Heal', '✚'),
      icon('Actions', 'Movement', 'move', 'Move', '↗'),
      icon('Actions', 'Explore', 'search', 'Search', '⌕'),
      icon('Actions', 'Support', 'rest', 'Rest', '🛏'),
      icon('Actions', 'Social', 'trade', 'Trade', '⇄'),
      icon('Actions', 'Social', 'steal', 'Steal', '🗝'),
      icon('Actions', 'Craft', 'build', 'Build', '🔨'),
      icon('Actions', 'Craft', 'repair', 'Repair', '⚙'),
    ],
  },
  {
    name: 'Resources',
    symbols: [
      icon('Resources', 'Currency', 'coin', 'Coin', '🪙'),
      icon('Resources', 'Materials', 'wood', 'Wood', '🪵'),
      icon('Resources', 'Materials', 'stone', 'Stone', '🪨'),
      icon('Resources', 'Supplies', 'food', 'Food', '🍞'),
      icon('Resources', 'Materials', 'metal', 'Metal', '⛓'),
      icon('Resources', 'Magic', 'crystal', 'Crystal', '💎'),
      icon('Resources', 'Magic', 'energy', 'Energy', '🔋'),
      icon('Resources', 'Magic', 'mana', 'Mana', '✨'),
      icon('Resources', 'Utility', 'key', 'Key', '🗝'),
      icon('Resources', 'Currency', 'gem', 'Gem', '🔷'),
    ],
  },
  {
    name: 'Directions',
    symbols: [
      icon('Directions', 'Cardinal', 'up', 'Up', '↑'),
      icon('Directions', 'Cardinal', 'down', 'Down', '↓'),
      icon('Directions', 'Cardinal', 'left', 'Left', '←'),
      icon('Directions', 'Cardinal', 'right', 'Right', '→'),
      icon('Directions', 'Movement', 'forward', 'Forward', '↟'),
      icon('Directions', 'Movement', 'back', 'Back', '↡'),
      icon('Directions', 'Rotation', 'rotate-left', 'Rotate Left', '↺'),
      icon('Directions', 'Rotation', 'rotate-right', 'Rotate Right', '↻'),
    ],
  },
  {
    name: 'Game / Card',
    symbols: [
      icon('Game / Card', 'Cards', 'heart', 'Heart', '♥'),
      icon('Game / Card', 'Cards', 'diamond', 'Diamond', '♦'),
      icon('Game / Card', 'Cards', 'club', 'Club', '♣'),
      icon('Game / Card', 'Cards', 'spade', 'Spade', '♠'),
      icon('Game / Card', 'Marks', 'star', 'Star', '★'),
      icon('Game / Card', 'Marks', 'target', 'Target', '🎯'),
      icon('Game / Card', 'Marks', 'flag', 'Flag', '⚑'),
      icon('Game / Card', 'Objects', 'dice', 'Dice', '⚂'),
      icon('Game / Card', 'Objects', 'trophy', 'Trophy', '🏆'),
      icon('Game / Card', 'Marks', 'cross', 'Cross', '✕'),
    ],
  },
  {
    name: 'Emotions / Story',
    symbols: [
      icon('Emotions / Story', 'Mood', 'happy', 'Happy', '☺'),
      icon('Emotions / Story', 'Mood', 'sad', 'Sad', '☹'),
      icon('Emotions / Story', 'Mood', 'angry', 'Angry', '‼'),
      icon('Emotions / Story', 'Mood', 'fear', 'Fear', '😨'),
      icon('Emotions / Story', 'Story', 'mystery', 'Mystery', '🕵'),
      icon('Emotions / Story', 'Story', 'danger', 'Danger', '⚠'),
      icon('Emotions / Story', 'Story', 'help', 'Help', '🆘'),
      icon('Emotions / Story', 'Story', 'question', 'Question', '？'),
      icon('Emotions / Story', 'Mood', 'sleep', 'Sleep', '😴'),
      icon('Emotions / Story', 'Mood', 'surprise', 'Surprise', '!'),
    ],
  },
]

export const LETTER_SYMBOLS: readonly LetterSymbolFace[] =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß'.split('').map((value) => ({ type: 'letter', value }))

export const COLOR_SYMBOLS: readonly ColorSymbolFace[] = [
  { type: 'color', value: '#dc2626', label: 'Red' },
  { type: 'color', value: '#f97316', label: 'Orange' },
  { type: 'color', value: '#facc15', label: 'Yellow' },
  { type: 'color', value: '#16a34a', label: 'Green' },
  { type: 'color', value: '#2563eb', label: 'Blue' },
  { type: 'color', value: '#9333ea', label: 'Purple' },
  { type: 'color', value: '#ec4899', label: 'Pink' },
  { type: 'color', value: '#92400e', label: 'Brown' },
  { type: 'color', value: '#000000', label: 'Black' },
  { type: 'color', value: '#ffffff', label: 'White' },
  { type: 'color', value: '#6b7280', label: 'Gray' },
]

export function getSymbolFaceLabel(face: IconSymbolFace | LetterSymbolFace | ColorSymbolFace): string {
  if (face.type === 'letter') {
    return face.value
  }

  return face.label
}
