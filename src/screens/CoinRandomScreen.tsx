import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { copy } from '../content/en'
import {
  isValidRandomMax,
  RANDOM_NUMBER_LIMITS,
} from '../domain/utils/randomResultFactory'

export function CoinRandomScreen() {
  const navigate = useNavigate()
  const [maxInput, setMaxInput] = useState('20')
  const [error, setError] = useState<string | null>(null)

  function startRandomNumber(): void {
    const max = Number(maxInput)

    if (!isValidRandomMax(max)) {
      setError(copy.random.menu.errors.max)
      return
    }

    navigate(`/random/number?max=${max}`)
  }

  return (
    <section className="list-screen random-menu-screen" aria-labelledby="random-menu-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.random.menu.eyebrow}</p>
        <h1 id="random-menu-title">{copy.random.menu.title}</h1>
        <p>{copy.random.menu.description}</p>
      </div>

      <div className="random-menu-panel">
        <Link className="menu-action-card" to="/random/coin">
          <span className="menu-action-card__mark" aria-hidden="true" />
          <span className="menu-action-card__label">{copy.random.menu.coinAction}</span>
        </Link>

        <div className="random-number-setup">
          <label className="field">
            <span>{copy.random.menu.maxLabel}</span>
            <input
              type="number"
              min={RANDOM_NUMBER_LIMITS.min}
              max={RANDOM_NUMBER_LIMITS.max}
              value={maxInput}
              aria-describedby={error ? 'random-max-error' : undefined}
              onChange={(event) => {
                setMaxInput(event.target.value)
                setError(null)
              }}
            />
            {error ? (
              <small className="field-error" id="random-max-error">
                {error}
              </small>
            ) : null}
          </label>
          <button
            className="button-link button-link--primary"
            type="button"
            onClick={startRandomNumber}
          >
            {copy.random.menu.startNumber}
          </button>
        </div>
      </div>

      <Link className="text-link" to="/">
        {copy.random.menu.backHome}
      </Link>
    </section>
  )
}
