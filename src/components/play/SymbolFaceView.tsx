import type { SymbolDieFace } from '../../domain/types/dice'
import { getSymbolFaceDisplay } from '../../domain/utils/symbolDiceUtils'

interface SymbolFaceViewProps {
  face: SymbolDieFace
}

export function SymbolFaceView({ face }: SymbolFaceViewProps) {
  if (face.type === 'color') {
    return (
      <span
        className="symbol-color-face"
        style={{ backgroundColor: face.value }}
        aria-label={face.label}
        title={face.label}
      />
    )
  }

  return (
    <span className="symbol-face-glyph" aria-label={getAccessibleLabel(face)} title={getAccessibleLabel(face)}>
      {getSymbolFaceDisplay(face)}
    </span>
  )
}

function getAccessibleLabel(face: SymbolDieFace): string {
  if (face.type === 'icon') {
    return face.label
  }

  if (face.type === 'number') {
    return `Number ${face.value}`
  }

  return getSymbolFaceDisplay(face)
}
