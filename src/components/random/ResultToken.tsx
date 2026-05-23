import { usePressIntent } from '../../hooks/usePressIntent'

interface ResultTokenProps {
  label: string
  result: string | null
  isAnimating: boolean
  variant?: 'coin' | 'number'
  onPress: () => void
  onHistory: () => void
}

export function ResultToken({
  label,
  result,
  isAnimating,
  variant = 'number',
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
      {variant === 'coin' && result !== null ? (
        <>
          <span
            className={`result-token__coin-face result-token__coin-face--${result.toLowerCase()}`}
            aria-hidden="true"
          />
          <span className="sr-only">{result}</span>
        </>
      ) : (
        <span>{result ?? ''}</span>
      )}
    </button>
  )
}
