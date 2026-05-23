import { copy } from '../../content/en'
import type { DiceSet } from '../../domain/types/dice'
import type { SetPlayState } from '../../domain/types/session'
import { IndividualDie } from './IndividualDie'
import { LargeResultDie } from './LargeResultDie'

interface SetPlayTileProps {
  set: DiceSet
  state: SetPlayState
  onToggleExpanded: () => void
  onOpenMenu: () => void
  onRoll: () => void
  onToggleDieLocked: (dieIndex: number) => void
}

export function SetPlayTile({
  set,
  state,
  onToggleExpanded,
  onOpenMenu,
  onRoll,
  onToggleDieLocked,
}: SetPlayTileProps) {
  const hasLockedDice = state.diceResults.some((die) => die.locked)
  const diceForDisplay =
    state.diceResults.length > 0
      ? state.diceResults
      : Array.from({ length: set.diceCount }, () => null)

  return (
    <article className={`set-play-tile${state.isExpanded ? ' set-play-tile--expanded' : ''}`}>
      <h2>{set.name}</h2>
      <LargeResultDie
        total={state.total}
        diceColor={set.diceColor}
        pipColor={set.pipColor}
        isExpanded={state.isExpanded}
        hasLockedDice={hasLockedDice}
        label={copy.play.labels.toggleSet(set.name)}
        onToggleExpanded={onToggleExpanded}
        onOpenMenu={onOpenMenu}
      />
      <button className="set-menu-button" type="button" onClick={onOpenMenu}>
        {copy.play.actions.setMenu}
      </button>
      <button className="button-link button-link--primary" type="button" onClick={onRoll}>
        {copy.play.actions.rollSet(set.name)}
      </button>

      {state.isExpanded ? (
        <div className="individual-dice-grid">
          {diceForDisplay.map((die, index) => (
            <IndividualDie
              key={index}
              value={die?.value ?? null}
              sides={set.sides}
              diceColor={set.diceColor}
              pipColor={set.pipColor}
              locked={die?.locked ?? false}
              label={copy.play.labels.toggleDie(set.name, index + 1, die?.locked ?? false)}
              onToggleLocked={() => onToggleDieLocked(index)}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}
