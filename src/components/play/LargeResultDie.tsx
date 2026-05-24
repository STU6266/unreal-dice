import { usePressIntent } from '../../hooks/usePressIntent'
import type { CSSProperties } from 'react'

interface LargeResultDieProps {
  total: number | null
  diceColor: string
  pipColor: string
  isExpanded: boolean
  hasLockedDice: boolean
  hasActiveModifier: boolean
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
  hasActiveModifier,
  label,
  onToggleExpanded,
  onOpenMenu,
}: LargeResultDieProps) {
  const pressHandlers = usePressIntent({
    onPress: onToggleExpanded,
    onHistory: onOpenMenu,
  })
  const dieStyle = {
    backgroundColor: diceColor,
    color: pipColor,
    borderColor: pipColor,
    '--die-color': diceColor,
  } as CSSProperties

  return (
    <button
      className={[
        'large-result-die',
        hasLockedDice ? 'large-result-die--locked' : '',
        hasActiveModifier ? 'large-result-die--modifier' : '',
        hasActiveModifier && hasLockedDice ? 'large-result-die--modifier-locked' : '',
      ].join(' ')}
      type="button"
      aria-label={label}
      aria-expanded={isExpanded}
      style={dieStyle}
      {...pressHandlers}
    >
      {total ?? '—'}
    </button>
  )
}
