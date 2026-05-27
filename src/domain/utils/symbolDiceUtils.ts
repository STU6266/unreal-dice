import { APP_LIMITS } from '../constants/limits'
import type { SymbolDieDefinition, SymbolDieFace } from '../types/dice'

export const MAX_SYMBOL_FACES_PER_DIE = 30

export function createEmptySymbolDie(idFactory: () => string = createRandomId): SymbolDieDefinition {
  return { id: idFactory(), faces: [] }
}

export function copySymbolDice(
  symbolDice: readonly SymbolDieDefinition[] | undefined,
): SymbolDieDefinition[] {
  return (symbolDice ?? []).map((die) => ({
    id: die.id,
    faces: die.faces.map(copySymbolFace),
  }))
}

export function normalizeSymbolDice(value: unknown): SymbolDieDefinition[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(normalizeSymbolDie)
    .filter((die): die is SymbolDieDefinition => die !== null)
    .slice(0, APP_LIMITS.maxDicePerSet)
}

export function normalizeSymbolDie(value: unknown): SymbolDieDefinition | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !Array.isArray(value.faces)) {
    return null
  }

  const faces = value.faces
    .map(normalizeSymbolFace)
    .filter((face): face is SymbolDieFace => face !== null)

  return { id: value.id, faces }
}

export function normalizeSymbolFace(value: unknown): SymbolDieFace | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  if (
    value.type === 'icon' &&
    typeof value.symbol === 'string' &&
    value.symbol.trim() !== '' &&
    typeof value.label === 'string' &&
    value.label.trim() !== ''
  ) {
    return { type: 'icon', symbol: value.symbol, label: value.label }
  }

  if (
    value.type === 'letter' &&
    typeof value.value === 'string' &&
    /^[A-ZÄÖÜß]$/.test(value.value)
  ) {
    return { type: 'letter', value: value.value }
  }

  if (
    value.type === 'number' &&
    typeof value.value === 'number' &&
    Number.isInteger(value.value) &&
    value.value >= 0 &&
    value.value <= 100 &&
    typeof value.countsTowardTotal === 'boolean'
  ) {
    return {
      type: 'number',
      value: value.value,
      countsTowardTotal: value.countsTowardTotal,
    }
  }

  if (
    value.type === 'color' &&
    typeof value.value === 'string' &&
    value.value.trim() !== '' &&
    typeof value.label === 'string' &&
    value.label.trim() !== ''
  ) {
    return { type: 'color', value: value.value, label: value.label }
  }

  return null
}

export function copySymbolFace(face: SymbolDieFace): SymbolDieFace {
  return { ...face }
}

export function getSymbolFaceContribution(face: SymbolDieFace | undefined): number | null {
  return face?.type === 'number' && face.countsTowardTotal ? face.value : null
}

export function getSymbolFaceDisplay(face: SymbolDieFace | undefined): string {
  if (face === undefined) {
    return ''
  }

  if (face.type === 'icon') {
    return face.symbol
  }

  if (face.type === 'letter') {
    return face.value
  }

  if (face.type === 'number') {
    return String(face.value)
  }

  return face.label
}

function createRandomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `symbol-${Date.now()}-${Math.random()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
