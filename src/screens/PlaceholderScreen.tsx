import { Link } from 'react-router-dom'
import { copy } from '../content/en'

interface PlaceholderScreenProps {
  title: string
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <section className="placeholder-screen" aria-labelledby="placeholder-title">
      <div className="placeholder-panel">
        <p className="eyebrow">{copy.laterPhase}</p>
        <h1 id="placeholder-title">{title}</h1>
        <p>{copy.placeholderMessage}</p>
        <Link className="text-link" to="/">
          {copy.backToHome}
        </Link>
      </div>
    </section>
  )
}
