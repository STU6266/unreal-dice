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
  return (
    <button
      className="combo-roll-button"
      type="button"
      disabled={disabled}
      style={{ borderColor: color }}
      onClick={onRoll}
    >
      {total === null ? name : copy.play.actions.comboTotal(name, total)}
    </button>
  )
}
import { copy } from '../../content/en'
