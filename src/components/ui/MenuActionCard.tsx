import { Link } from 'react-router-dom'

interface MenuActionCardProps {
  label: string
  to: string
}

export function MenuActionCard({ label, to }: MenuActionCardProps) {
  return (
    <Link className="menu-action-card" to={to}>
      <span className="menu-action-card__mark" aria-hidden="true" />
      <span className="menu-action-card__label">{label}</span>
    </Link>
  )
}
