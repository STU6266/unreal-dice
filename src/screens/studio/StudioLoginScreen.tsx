import { useState, type FormEvent } from 'react'
import { copy } from '../../content/en'

interface StudioLoginScreenProps {
  error: string | null
  onSignIn: (email: string, password: string) => Promise<void>
}

export function StudioLoginScreen({ error, onSignIn }: StudioLoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    await onSignIn(email, password)
    setIsSubmitting(false)
  }

  return (
    <section className="editor-screen" aria-labelledby="studio-login-title">
      <div className="screen-heading">
        <p className="eyebrow">{copy.studio.eyebrow}</p>
        <h1 id="studio-login-title">{copy.studio.login.title}</h1>
        <p>{copy.studio.login.description}</p>
      </div>

      {error ? (
        <div className="status-message status-message--error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="editor-panel" onSubmit={submit}>
        <div className="form-grid">
          <label className="field">
            <span>{copy.studio.login.email}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{copy.studio.login.password}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="editor-actions">
          <button className="button-link button-link--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? copy.studio.login.signingIn : copy.studio.login.signIn}
          </button>
        </div>
      </form>
    </section>
  )
}
