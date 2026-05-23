export const STORAGE_KEYS = {
  userGroups: 'unrealDice:userGroups',
  setHistory: 'unrealDice:setHistory',
  coinFlipHistory: 'unrealDice:coinFlipHistory',
  randomNumberHistory: 'unrealDice:randomNumberHistory',
  quickStartTemplateCache: 'unrealDice:quickStartTemplateCache',
  userPreferences: 'unrealDice:userPreferences',
} as const

// I version stored data from the start so future migrations can be explicit instead of guessing which shape a user's backup uses.
export const DATA_SCHEMA_VERSION = 1
