import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

interface UsePressIntentOptions {
  onPress: () => void
  onHistory: () => void
  disabled?: boolean
}

const DOUBLE_CLICK_DELAY_MS = 240
const LONG_PRESS_DELAY_MS = 520
const MOVE_CANCEL_DISTANCE_PX = 12

export function usePressIntent({
  onPress,
  onHistory,
  disabled = false,
}: UsePressIntentOptions) {
  const clickTimerRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const longPressTriggeredRef = useRef(false)

  function clearClickTimer(): void {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
  }

  function clearLongPressTimer(): void {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // I separate normal taps from history gestures so opening history never
  // changes the random result the user is trying to inspect.
  function openHistory(): void {
    if (disabled) {
      return
    }

    clearClickTimer()
    clearLongPressTimer()
    longPressTriggeredRef.current = true
    onHistory()
  }

  function handleClick(): void {
    if (disabled || longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }

    clearClickTimer()
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null
      onPress()
    }, DOUBLE_CLICK_DELAY_MS)
  }

  function handleDoubleClick(): void {
    openHistory()
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>): void {
    if (disabled) {
      return
    }

    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    longPressTriggeredRef.current = false
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(openHistory, LONG_PRESS_DELAY_MS)
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
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

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (disabled) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onPress()
    }
  }

  return {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
    onKeyDown: handleKeyDown,
  }
}
