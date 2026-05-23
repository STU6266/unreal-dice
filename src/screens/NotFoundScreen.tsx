import { Link } from 'react-router-dom'
import { copy } from '../content/en'

export function NotFoundScreen() {
  return (
    <section className="placeholder-screen" aria-labelledby="not-found-title">
      <div className="placeholder-panel">
        <p className="eyebrow">{copy.notFound.eyebrow}</p>
        <h1 id="not-found-title">{copy.notFound.title}</h1>
        <p>{copy.notFound.message}</p>
        <Link className="text-link" to="/">
          {copy.backToHome}
        </Link>
      </div>
    </section>
  )
}
