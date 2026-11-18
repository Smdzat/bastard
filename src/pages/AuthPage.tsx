import { useState } from 'react'
import type { FormEvent } from 'react'
import { postJson, safeNextPath } from '../lib/api'
import { links } from '../data'
import { Icon } from '../components/Icon'
import helpArtwork from '../assets/bento-community-1000.webp'
import './forms.css'

export type AuthMode = 'login' | 'register' | 'reset'

export function AuthForm({ mode, onSuccess }: { mode: AuthMode; onSuccess?: () => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const password = String(fields.get('password') || '')
    const passwordConfirm = String(fields.get('passwordConfirm') || '')
    setError('')
    if (mode === 'register' && password !== passwordConfirm) { setError('Die beiden Passwörter stimmen noch nicht überein.'); return }
    setPending(true)
    try {
      const email = String(fields.get('email') || '').trim()
      const result = await postJson(mode === 'login' ? '/auth/login' : mode === 'register' ? '/auth/register' : '/auth/forgot-password', mode === 'reset' ? { email } : mode === 'login' ? { email, password, rememberMe: fields.get('remember') === 'on' } : { email, username: String(fields.get('username') || '').trim(), password, passwordConfirm })
      if (mode === 'reset') { setResetSent(true); return }
      if (!result.ok) throw new Error('Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es erneut.')
      if (onSuccess) onSuccess()
      else window.location.assign(safeNextPath())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Bitte versuche es erneut.')
    } finally { setPending(false) }
  }

  if (resetSent) return <div className="form-success" role="status"><Icon name="check" /><h2>Schau in dein Postfach.</h2><p>Falls ein Konto mit dieser E-Mail-Adresse besteht, erhältst du einen Link zum Zurücksetzen. Prüfe bitte auch deinen Spam-Ordner.</p><a className="form-primary" href="/login">Zurück zum Login <Icon name="arrow" /></a></div>

  return <form className="erledo-form" onSubmit={submit} aria-label={mode === 'login' ? 'Einloggen' : mode === 'register' ? 'Konto erstellen' : 'Passwort zurücksetzen'}>
    {error && <div className="form-error" role="alert">{error}</div>}
    <label className="form-field">E-Mail-Adresse<input type="email" name="email" placeholder="du@beispiel.at" autoComplete="email" required maxLength={254} /></label>
    {mode === 'register' && <label className="form-field">Benutzername<input type="text" name="username" placeholder="z. B. alex_wien" autoComplete="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" /><span className="field-hint">3–20 Zeichen: Buchstaben, Zahlen und Unterstriche.</span></label>}
    {mode !== 'reset' && <label className="form-field">Passwort<span className="password-field"><input type={showPassword ? 'text' : 'password'} name="password" placeholder={mode === 'register' ? 'Mindestens 8 Zeichen' : 'Dein Passwort'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 8 : undefined} maxLength={256} /><button type="button" aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Verbergen' : 'Zeigen'}</button></span></label>}
    {mode === 'register' && <label className="form-field">Passwort wiederholen<input type={showPassword ? 'text' : 'password'} name="passwordConfirm" placeholder="Noch einmal dein Passwort" autoComplete="new-password" required minLength={8} maxLength={256} /></label>}
    {mode === 'login' && <div className="form-options"><label className="form-check"><input type="checkbox" name="remember" />Eingeloggt bleiben</label><a href="/passwort-vergessen">Passwort vergessen?</a></div>}
    {mode === 'register' && <label className="form-check form-consent"><input type="checkbox" name="terms" required /><span>Ich akzeptiere die <a href={links.terms} target="_blank" rel="noreferrer">Nutzungsbedingungen</a> und habe die <a href={links.privacy} target="_blank" rel="noreferrer">Datenschutzerklärung</a> gelesen.</span></label>}
    <button type="submit" className="form-primary" disabled={pending}>{pending ? 'Einen Moment …' : mode === 'login' ? 'Einloggen' : mode === 'register' ? 'Kostenloses Konto erstellen' : 'Link zum Zurücksetzen anfordern'}<Icon name="arrow" /></button>
    {!onSuccess && <p className="form-switch">{mode === 'login' ? <>Noch kein Konto? <a href="/registrieren">Kostenlos registrieren</a></> : mode === 'register' ? <>Schon dabei? <a href="/login">Einloggen</a></> : <a href="/login">Zurück zum Login</a>}</p>}
  </form>
}

const content = {
  login: { title: 'Schön, dass du wieder da bist.', description: 'Melde dich an und bring deinen Alltag ein Stück weiter.' },
  register: { title: 'Dein guter Anfang.', description: 'Ein kostenloses Konto. Viele Möglichkeiten, dir den Alltag leichter zu machen.' },
  reset: { title: 'Ein neuer Zugang.', description: 'Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.' },
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  return <main id="inhalt" className="account-page"><div className="account-layout">
    <aside className="account-story"><a className="page-back" href="/"><Icon name="arrow" /> Zur Startseite</a><h2>Ein bisschen Hilfe.<br />Ein großer Unterschied.</h2><p>Für die Dinge, die anstehen.<br />Und die Menschen, die mit anpacken.</p><img src={helpArtwork} alt="Grünes Erledigo-Megafon" width="500" height="500" /><div className="account-story-foot"><span>Dein Vorhaben.</span><span>Unsere Verbindung. ↗</span></div></aside>
    <div className="account-form-panel"><h1>{content[mode].title}</h1><p className="account-description">{content[mode].description}</p><AuthForm mode={mode} /><p className="account-privacy"><Icon name="shield" /> Deine Zugangsdaten bleiben vertraulich.</p></div>
  </div></main>
}
