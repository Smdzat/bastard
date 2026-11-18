import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import * as Switch from '@radix-ui/react-switch'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { categories, links } from '../data'
import parcel from '../assets/bento-paket-640.webp'
import taskIcon from '../assets/mini-auftrag.webp'
import { Icon } from '../components/Icon'
import { api } from '../lib/api'
import { AuthForm } from './AuthPage'
import type { AuthMode } from './AuthPage'
import './forms.css'
import './order-page.css'

const options = [
  { value: 'Sofort-Hilfe', label: 'Sofort-Hilfe', description: 'Wenn es schnell gehen soll.', image: categories[4].thumbnail },
  { value: 'Einkauf & Besorgungen', label: 'Einkauf & Besorgungen', description: 'Alles auf deiner Liste.', image: categories[0].thumbnail },
  { value: 'Lieferservice', label: 'Abholung & Lieferung', description: 'Ein Weg weniger für dich.', image: parcel },
  { value: 'Transport & Umzug', label: 'Transport & Umzug', description: 'Von hier nach dort.', image: categories[1].thumbnail },
  { value: 'Handwerk & Aufbau', label: 'Montage & Handwerk', description: 'Gemeinsam wird’s fertig.', image: categories[3].thumbnail },
  { value: 'Haushalt', label: 'Haushalt & Garten', description: 'Hilfe für dein Zuhause.', image: categories[2].thumbnail },
  { value: 'Sonstiges', label: 'Etwas anderes', description: 'Deine Idee passt auch hierher.', image: categories[5].thumbnail },
]
const times = { sofort: 'So bald wie möglich', heute: 'Heute', diese_woche: 'Diese Woche', flexibel: 'Ich bin flexibel', bestimmtes_datum: 'An einem bestimmten Tag' }
const emptyDraft = { category: '', what: '', location: 'Wien', address: '', pickup: '', dropoff: '', timeframe: 'flexibel', date: '', time: '', budget: '', flexible: true, tools: '', recurrence: 'einmalig' }
type Draft = typeof emptyDraft
const toolOptions: [string, string][] = [['ja', 'Ja'], ['nein', 'Nein'], ['teilweise', 'Teilweise']]
const recurrenceOptions: [string, string][] = [['einmalig', 'Einmalig'], ['regelmäßig', 'Regelmäßig']]

function FieldLabel({ children, id, optional = false }: { children: ReactNode; id?: string; optional?: boolean }) {
  return <span className="field-label" id={id}>{children}{optional && <span className="field-optional">Optional</span>}</span>
}

function ChoiceField({ label, options, value, onChange, optional = false }: { label: string; options: [string, string][]; value: string; onChange: (value: string) => void; optional?: boolean }) {
  const id = useId()
  return <div className="form-field">
    <FieldLabel id={id} optional={optional}>{label}</FieldLabel>
    <ToggleGroup.Root type="single" className="choice-group" aria-labelledby={id} value={value} onValueChange={next => { if (next || optional) onChange(next) }}>
      {options.map(([key, text]) => <ToggleGroup.Item key={key} value={key} className="choice">{text}</ToggleGroup.Item>)}
    </ToggleGroup.Root>
  </div>
}

function PhotoPreviews({ files, onRemove }: { files: File[]; onRemove?: (index: number) => void }) {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    const next = files.map(file => URL.createObjectURL(file))
    setUrls(next)
    return () => next.forEach(url => URL.revokeObjectURL(url))
  }, [files])
  return <div className="order-photos">{urls.map((url, index) => <div key={url}><img src={url} alt={`Foto ${index + 1} zu deinem Auftrag`} />{onRemove && <button type="button" onClick={() => onRemove(index)} aria-label={`Foto ${index + 1} entfernen`}><Icon name="close" /></button>}</div>)}</div>
}

export function OrderPage() {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState<{ number?: string | number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const current = options.find(option => option.value === draft.category)
  const transport = draft.category === 'Transport & Umzug'
  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    let active = true
    api('/auth/me').then(data => { if (active) setLoggedIn(Boolean(data.loggedIn)) }).catch(() => {}).finally(() => { if (active) setCheckingSession(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }) }, [step])

  function update<Key extends keyof Draft>(key: Key, value: Draft[Key]) { setDraft(old => ({ ...old, [key]: value })) }
  function goTo(next: number) { setError(''); setStep(next) }
  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const added = [...(event.currentTarget.files || [])]
    event.currentTarget.value = ''
    setError('')
    if (added.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { setError('Bitte wähle JPG-, PNG- oder WebP-Bilder.'); return }
    if (added.some(file => file.size > 5 * 1024 * 1024)) { setError('Ein Bild darf höchstens 5 MB groß sein.'); return }
    const combined = [...files, ...added.filter(file => !files.some(old => old.name === file.name && old.size === file.size && old.lastModified === file.lastModified))]
    if (combined.length > 5) { setError('Du kannst bis zu fünf Fotos hinzufügen.'); return }
    setFiles(combined)
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending || !loggedIn) return
    setPending(true); setError('')
    const details: Record<string, string> = { what: draft.what }
    if (transport) { details.pickup = draft.pickup; details.dropoff = draft.dropoff }
    else if (draft.address) details.address = draft.address
    if (draft.category === 'Handwerk & Aufbau' && draft.tools) details.tools = draft.tools
    if (draft.category === 'Haushalt') details.recurrence = draft.recurrence
    const payload = new FormData()
    payload.set('category', draft.category)
    payload.set('title', draft.what.trim())
    payload.set('category_details', JSON.stringify(details))
    payload.set('location_text', draft.location.trim())
    payload.set('timeframe', draft.timeframe)
    if (draft.timeframe === 'bestimmtes_datum') { payload.set('scheduled_date', draft.date); payload.set('scheduled_time', draft.time) }
    if (draft.budget) payload.set('budget', draft.budget)
    payload.set('is_flexible_price', draft.flexible ? '1' : '0')
    files.forEach(file => payload.append('images', file))
    try {
      const result = await api('/tasks', { method: 'POST', body: payload })
      if (!result.ok) throw new Error('Die Veröffentlichung wurde nicht bestätigt. Bitte versuche es erneut.')
      setSuccess({ number: result.taskNumber })
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Das hat nicht geklappt. Bitte versuche es erneut.') }
    finally { setPending(false) }
  }

  return <main id="inhalt" className="order-page"><div className="order-layout">
    <aside className="order-story"><a className="page-back" href="/"><Icon name="arrow" /> Zur Startseite</a><p className="page-kicker">DEIN NÄCHSTES TO-DO</p><h1>Gib es in<br />gute Hände.</h1><p>Ein Einkauf. Ein Umzug. Eine kleine Reparatur. Beschreibe, was ansteht – und finde jemanden, der mit anpackt.</p><img className="order-story-art" src={current?.image || taskIcon} alt="" width="280" height="280" /><div className="order-assurance"><Icon name="check" /><span>Kostenlos einstellen.<br />Preis und Details direkt vereinbaren.</span></div></aside>
    <div className="order-workspace">
      {!success && <ol className="order-progress" aria-label="Schritte der Auftragserstellung">{['Kategorie', 'Dein Vorhaben', 'Prüfen & starten'].map((label, index) => <li key={label} data-active={step === index + 1} data-complete={step > index + 1}><button type="button" disabled={index + 1 > step} onClick={() => goTo(index + 1)} aria-current={step === index + 1 ? 'step' : undefined}><span>{step > index + 1 ? <Icon name="check" /> : index + 1}</span>{label}</button></li>)}</ol>}
      <div className="order-card">
        {success ? <div className="form-success order-success" role="status"><Icon name="check" /><h2>Dein Auftrag ist unterwegs.</h2><p>{success.number ? `Auftrag #${success.number} wurde veröffentlicht.` : 'Dein Auftrag wurde veröffentlicht.'} Du findest ihn in deinem Erledigo-Konto.</p><a className="form-primary" href="https://erledo.at/konto">Zur Kontoübersicht <Icon name="arrow" /></a><button className="form-secondary" type="button" onClick={() => { setSuccess(null); setDraft(emptyDraft); setFiles([]); goTo(1) }}>Weiteren Auftrag erstellen</button></div> : <>
          <header className="order-step-heading"><h2 ref={headingRef} tabIndex={-1}>{step === 1 ? 'Was steht bei dir an?' : step === 2 ? 'Erzähl uns von deinem Vorhaben.' : 'So kann es losgehen.'}</h2><p>{step === 1 ? 'Wähle, wobei du Unterstützung brauchst.' : step === 2 ? 'Je konkreter du bist, desto leichter findet sich passende Hilfe.' : 'Prüfe deine Angaben. Veröffentlicht wird erst mit deinem letzten Klick.'}</p></header>
          {error && <div className="form-error" role="alert">{error}</div>}
          {step === 1 && <form onSubmit={event => { event.preventDefault(); if (draft.category) goTo(2) }}><fieldset className="order-categories"><legend className="sr-only">Kategorie auswählen</legend>{options.map(option => <label className="order-category" key={option.value} data-selected={draft.category === option.value}><input type="radio" name="category" value={option.value} checked={draft.category === option.value} onChange={() => update('category', option.value)} required /><img src={option.image} alt="" width="76" height="76" /><span><strong>{option.label}</strong><span>{option.description}</span></span><span className="order-category-check"><Icon name="check" /></span></label>)}</fieldset><button className="form-primary" type="submit" disabled={!draft.category}>Weiter zu deinem Vorhaben <Icon name="arrow" /></button></form>}
          {step === 2 && <form className="erledo-form order-details" onSubmit={event => { event.preventDefault(); goTo(3) }}>
            <label className="form-field"><FieldLabel>Was brauchst du?</FieldLabel><span className="field-box"><textarea name="what" placeholder="Zum Beispiel: Ich brauche Hilfe, um ein Sofa in den dritten Stock zu tragen …" value={draft.what} onChange={event => update('what', event.target.value)} minLength={10} maxLength={500} required rows={4} /><span className="field-counter" aria-hidden="true">{draft.what.length}/500</span></span><span className="field-hint">Mindestens 10 Zeichen.</span></label>
            <div className="form-field" role="group" aria-labelledby="order-location-label">
              <FieldLabel id="order-location-label">Wo wird Hilfe gebraucht?</FieldLabel>
              <div className="field-stack">
                <label className="field-row"><span>Ort</span><input name="location" value={draft.location} onChange={event => update('location', event.target.value)} maxLength={150} placeholder="Wien 1070 oder Leopoldstadt" autoComplete="address-level2" /></label>
                {transport ? <>
                  <label className="field-row"><span>Abholort</span><input value={draft.pickup} onChange={event => update('pickup', event.target.value)} placeholder="Straße oder Bezirk · optional" maxLength={250} /></label>
                  <label className="field-row"><span>Zielort</span><input value={draft.dropoff} onChange={event => update('dropoff', event.target.value)} placeholder="Straße oder Bezirk · optional" maxLength={250} /></label>
                </> : <label className="field-row"><span>Adresse</span><input value={draft.address} onChange={event => update('address', event.target.value)} placeholder="Straße oder Treffpunkt · optional" maxLength={250} autoComplete="street-address" /></label>}
              </div>
              <span className="field-hint">Persönliche Details kannst du auch später direkt vereinbaren.</span>
            </div>
            <ChoiceField label="Wann soll es losgehen?" options={Object.entries(times)} value={draft.timeframe} onChange={value => update('timeframe', value)} />
            {draft.timeframe === 'bestimmtes_datum' && <div className="form-columns"><label className="form-field"><FieldLabel>Datum</FieldLabel><input type="date" value={draft.date} onChange={event => update('date', event.target.value)} min={today} required /></label><label className="form-field"><FieldLabel optional>Uhrzeit</FieldLabel><input type="time" value={draft.time} onChange={event => update('time', event.target.value)} /></label></div>}
            {draft.category === 'Handwerk & Aufbau' && <ChoiceField label="Ist Werkzeug vorhanden?" options={toolOptions} value={draft.tools} onChange={value => update('tools', value)} optional />}
            {draft.category === 'Haushalt' && <ChoiceField label="Wie oft brauchst du Hilfe?" options={recurrenceOptions} value={draft.recurrence} onChange={value => update('recurrence', value)} />}
            <div className="form-field" role="group" aria-labelledby="order-budget-label">
              <FieldLabel id="order-budget-label" optional>Dein Budget</FieldLabel>
              <div className="field-stack field-budget">
                <label className="field-row"><span>Betrag</span><span className="field-amount"><input type="number" min="0" max="100000" step="1" value={draft.budget} onChange={event => update('budget', event.target.value)} placeholder="z. B. 25" inputMode="numeric" /><span aria-hidden="true">€</span></span></label>
                <label className="field-negotiable"><span>Verhandelbar</span><Switch.Root className="switch" checked={draft.flexible} onCheckedChange={value => update('flexible', value)}><Switch.Thumb className="switch-thumb" /></Switch.Root></label>
              </div>
            </div>
            <label className="order-upload" data-dragging={dragging}><span className="order-upload-icon"><Icon name="plus" /></span><span className="order-upload-text"><strong>Fotos hinzufügen <span>oder hierher ziehen</span></strong><span className="order-upload-meta">Optional · JPG, PNG oder WebP · bis zu 5 Bilder · je max. 5 MB</span></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDrop={() => setDragging(false)} /></label>
            <PhotoPreviews files={files} onRemove={index => setFiles(old => old.filter((_, i) => i !== index))} />
            <div className="order-form-actions"><button type="button" className="form-secondary" onClick={() => goTo(1)}>Zurück</button><button type="submit" className="form-primary">Angaben prüfen <Icon name="arrow" /></button></div>
          </form>}
          {step === 3 && <div className="order-review"><div className="order-review-top"><img src={current?.image} alt="" width="78" height="78" /><div><span>{current?.label}</span><h3>{draft.what}</h3></div><button className="form-secondary" type="button" onClick={() => goTo(2)}>Bearbeiten</button></div>
            <dl>{[['Ort', draft.location || 'Wird direkt vereinbart'], ['Zeitpunkt', times[draft.timeframe as keyof typeof times] + (draft.timeframe === 'bestimmtes_datum' ? ` · ${draft.date.split('-').reverse().join('.')} ${draft.time}` : '')], ['Budget', draft.budget ? `${draft.budget} €${draft.flexible ? ' · verhandelbar' : ''}` : 'Wird direkt vereinbart'], ...(transport ? [['Abholort', draft.pickup], ['Zielort', draft.dropoff]] : [['Adresse', draft.address]]), ['Werkzeug', draft.category === 'Handwerk & Aufbau' ? draft.tools : ''], ['Häufigkeit', draft.category === 'Haushalt' ? draft.recurrence : '']].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <PhotoPreviews files={files} />
            {checkingSession ? <p className="order-session-note" role="status">Dein Anmeldestatus wird geprüft …</p> : !loggedIn ? <div className="order-auth"><h3>Dein Auftrag ist bereit.<br />Jetzt noch kurz anmelden.</h3><p>Deine Angaben bleiben während der Anmeldung hier erhalten.</p><div className="order-auth-tabs"><button type="button" aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}>Einloggen</button><button type="button" aria-pressed={authMode === 'register'} onClick={() => setAuthMode('register')}>Konto erstellen</button></div><AuthForm key={authMode} mode={authMode} onSuccess={() => setLoggedIn(true)} /></div> : <p className="order-session-note"><Icon name="check" /> Du bist angemeldet. Dein Auftrag kann starten.</p>}
            <form className="erledo-form order-publish" onSubmit={publish}><label className="form-check form-consent"><input type="checkbox" name="consent" required disabled={!loggedIn || pending} /><span>Ich habe meine Angaben geprüft und akzeptiere die <a href={links.terms} target="_blank" rel="noreferrer">Nutzungsbedingungen</a>. Hinweise zum Umgang mit meinen Daten finde ich im <a href={links.privacy} target="_blank" rel="noreferrer">Datenschutz</a>.</span></label><div className="order-form-actions"><button type="button" className="form-secondary" onClick={() => goTo(2)} disabled={pending}>Zurück</button><button type="submit" className="form-primary" disabled={!loggedIn || pending}>{pending ? 'Wird veröffentlicht …' : 'Auftrag kostenlos veröffentlichen'}<Icon name="arrow" /></button></div></form>
          </div>}
        </>}
      </div>
    </div>
  </div></main>
}
