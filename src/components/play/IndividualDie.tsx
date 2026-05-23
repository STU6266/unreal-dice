import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

interface IndividualDieProps {
  value: number | null
  sides: number
  diceColor: string
  pipColor: string
  locked: boolean
  label: string
  onToggleLocked: () => void
}

const LONG_PRESS_DELAY_MS = 520
const MOVE_CANCEL_DISTANCE_PX = 12

export function IndividualDie({
  value,
  sides,
  diceColor,
  pipColor,
  locked,
  label,
  onToggleLocked,
}: IndividualDieProps) {
  const longPressTimerRef = useRef<number | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  function clearLongPressTimer(): void {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function toggleIfRolled(): void {
    if (value !== null) {
      onToggleLocked()
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>): void {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(toggleIfRolled, LONG_PRESS_DELAY_MS)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    const pointerStart = pointerStartRef.current
    if (pointerStart === null) {
      return
    }

    const movedDistance = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y,
    )

    if (movedDistance > MOVE_CANCEL_DISTANCE_PX) {
      clearLongPressTimer()
    }
  }

  function handlePointerEnd(): void {
    pointerStartRef.current = null
    clearLongPressTimer()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleIfRolled()
    }
  }

  return (
    <button
      className={`individual-die${locked ? ' individual-die--locked' : ''}`}
      type="button"
      aria-label={label}
      aria-pressed={locked}
      disabled={value === null}
      style={{ backgroundColor: diceColor, color: pipColor, borderColor: pipColor }}
      onDoubleClick={toggleIfRolled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {value === null ? null : sides >= 2 && sides <= 6 ? (
        <span className={`pip-face pip-face--${value}`}>
          {Array.from({ length: value }, (_, index) => (
            <span key={index} className="pip-dot" />
          ))}
        </span>
      ) : (
        <span>{value}</span>
      )}
    </button>
  )
}
