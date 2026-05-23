import { usePressIntent } from '../../hooks/usePressIntent'

interface ResultTokenProps {
  label: string
  result: string | null
  isAnimating: boolean
  onPress: () => void
  onHistory: () => void
}

export function ResultToken({
  label,
  result,
  isAnimating,
  onPress,
  onHistory,
}: ResultTokenProps) {
  const pressHandlers = usePressIntent({
    onPress,
    onHistory,
    disabled: isAnimating,
  })

  return (
    <button
      className={`result-token${isAnimating ? ' result-token--moving' : ''}`}
      type="button"
      aria-label={label}
      disabled={isAnimating}
      {...pressHandlers}
    >
      <span>{result ?? ''}</span>
    </button>
  )
}
