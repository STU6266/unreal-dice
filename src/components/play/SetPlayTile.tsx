import type { CSSProperties } from 'react'
import { copy } from '../../content/en'
import type { DiceSet } from '../../domain/types/dice'
import type { IndividualDieMode } from '../../domain/types/history'
import type { SetPlayState } from '../../domain/types/session'
import { normalizeDieMode } from '../../domain/utils/modifierUtils'
import { IndividualDie } from './IndividualDie'
import { LargeResultDie } from './LargeResultDie'

interface SetPlayTileProps {
  set: DiceSet
  state: SetPlayState
  comboColor?: string
  onToggleExpanded: () => void
  onOpenMenu: () => void
  onRoll: () => void
  onToggleDieLocked: (dieIndex: number) => void
}

export function SetPlayTile({
  set,
  state,
  comboColor,
  onToggleExpanded,
  onOpenMenu,
  onRoll,
  onToggleDieLocked,
}: SetPlayTileProps) {
  const hasLockedDice = state.diceResults.some((die) => normalizeDieMode(die) === 'locked')
  const hasActiveModifier =
    (set.modifier.enabled &&
      set.modifier.application === 'set-total' &&
      state.setModifierActive) ||
    state.diceResults.some((die) => normalizeDieMode(die) === 'modifier-active')
  const comboStyle =
    comboColor === undefined
      ? undefined
      : ({ '--combo-color': comboColor } as CSSProperties)
  const diceForDisplay =
    state.diceResults.length > 0
      ? state.diceResults
      : Array.from({ length: set.diceCount }, () => null)
  const isSingleDieSet = set.diceCount === 1

  return (
    <article
      className={[
        'set-play-tile',
        state.isExpanded && !isSingleDieSet ? 'set-play-tile--expanded' : '',
        isSingleDieSet ? 'set-play-tile--single-die' : '',
        comboColor ? 'set-play-tile--combo' : '',
      ].join(' ')}
      style={comboStyle}
    >
      <h2>
        {isSingleDieSet ? (
          <button
            className="set-title-button"
            type="button"
            aria-label={copy.play.labels.openSetMenu(set.name)}
            onClick={onOpenMenu}
          >
            {set.name}
          </button>
        ) : (
          set.name
        )}
      </h2>
      {isSingleDieSet ? null : (
        <LargeResultDie
          total={state.total}
          diceColor={set.diceColor}
          pipColor={set.pipColor}
          isExpanded={state.isExpanded}
          hasLockedDice={hasLockedDice}
          hasActiveModifier={hasActiveModifier}
          label={copy.play.labels.toggleSet(set.name, getLargeDieState(hasActiveModifier, hasLockedDice))}
          onToggleExpanded={onToggleExpanded}
          onOpenMenu={onOpenMenu}
        />
      )}
      <button className="button-link button-link--primary" type="button" onClick={onRoll}>
        {copy.play.actions.rollSet(set.name)}
      </button>

      {state.isExpanded || isSingleDieSet ? (
        <div className="individual-dice-grid">
          {diceForDisplay.map((die, index) => (
            <IndividualDie
              key={index}
              value={die?.value ?? null}
              sides={set.sides}
              diceColor={set.diceColor}
              pipColor={set.pipColor}
              mode={getDisplayMode(die)}
              label={copy.play.labels.toggleDie(set.name, index + 1, getDisplayMode(die))}
              onToggleLocked={() => onToggleDieLocked(index)}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}

function getDisplayMode(die: { mode?: unknown; locked?: unknown } | null): IndividualDieMode {
  return die === null ? 'normal' : normalizeDieMode(die)
}

function getLargeDieState(hasActiveModifier: boolean, hasLockedDice: boolean) {
  if (hasActiveModifier && hasLockedDice) {
    return 'modifier-and-locked'
  }

  if (hasActiveModifier) {
    return 'modifier'
  }

  if (hasLockedDice) {
    return 'locked'
  }

  return 'normal'
}
