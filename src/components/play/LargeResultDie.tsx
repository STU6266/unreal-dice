import { usePressIntent } from '../../hooks/usePressIntent'

interface LargeResultDieProps {
  total: number | null
  diceColor: string
  pipColor: string
  isExpanded: boolean
  hasLockedDice: boolean
  label: string
  onToggleExpanded: () => void
  onOpenMenu: () => void
}

export function LargeResultDie({
  total,
  diceColor,
  pipColor,
  isExpanded,
  hasLockedDice,
  label,
  onToggleExpanded,
  onOpenMenu,
}: LargeResultDieProps) {
  const pressHandlers = usePressIntent({
    onPress: onToggleExpanded,
    onHistory: onOpenMenu,
  })

  return (
    <button
      className={`large-result-die${hasLockedDice ? ' large-result-die--locked' : ''}`}
      type="button"
      aria-label={label}
      aria-expanded={isExpanded}
      style={{ backgroundColor: diceColor, color: pipColor, borderColor: pipColor }}
      {...pressHandlers}
    >
      {total ?? '—'}
    </button>
  )
}
