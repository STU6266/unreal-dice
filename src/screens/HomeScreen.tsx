import { MenuActionCard } from '../components/ui/MenuActionCard'
import { copy } from '../content/en'

export function HomeScreen() {
  return (
    <section className="home-screen" aria-labelledby="home-title">
      <div className="brand-lockup">
        <p className="eyebrow">{copy.home.eyebrow}</p>
        <h1 id="home-title">{copy.home.appName}</h1>
        <p className="home-screen__subtitle">{copy.home.subtitle}</p>
      </div>

      <nav className="home-menu" aria-label={copy.home.mainMenuLabel}>
        {copy.home.actions.map((action) => (
          <MenuActionCard
            key={action.path}
            label={action.label}
            to={action.path}
          />
        ))}
      </nav>

      <p className="home-screen__note">{copy.home.footerNote}</p>
    </section>
  )
}
