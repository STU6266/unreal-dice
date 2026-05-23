import type { CSSProperties } from 'react'
import { copy } from '../../content/en'

interface ComboRollButtonProps {
  name: string
  total: number | null
  color: string
  disabled: boolean
  onRoll: () => void
}

export function ComboRollButton({
  name,
  total,
  color,
  disabled,
  onRoll,
}: ComboRollButtonProps) {
  const comboStyle = {
    '--combo-color': color,
    borderColor: color,
  } as CSSProperties

  return (
    <button
      className="combo-roll-button"
      type="button"
      disabled={disabled}
      style={comboStyle}
      onClick={onRoll}
    >
      {total === null ? name : copy.play.actions.comboTotal(name, total)}
    </button>
  )
}
