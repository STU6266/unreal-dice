import { copy } from '../../content/en'

interface RollAllButtonProps {
  total: number | null
  onRoll: () => void
}

export function RollAllButton({ total, onRoll }: RollAllButtonProps) {
  return (
    <button className="roll-all-button" type="button" onClick={onRoll}>
      {total === null ? copy.play.actions.rollAll : copy.play.actions.rollAllTotal(total)}
    </button>
  )
}
