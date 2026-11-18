import { useState } from 'react'
import { categories } from '../data'
import { Icon } from './Icon'
import { ActionLink, SectionLabel } from './ui'

export function Hero() {
  const [active, setActive] = useState(0)
  const category = categories[active]
  const change = (direction: number) => setActive(index => (index + direction + categories.length) % categories.length)

  return <section id="start" className="hero section-container" aria-labelledby="hero-title">
    <div className="hero-copy">
      <SectionLabel>Große Hilfe für deinen Alltag</SectionLabel>
      <h1 id="hero-title">Dein Alltag.<br />Einfach <span>leichter.</span></h1>
      <p className="hero-description">Ein Einkauf. Ein Umzug. Ein Projekt.<br className="desktop-break" /> Finde Menschen, die mit anpacken – und gewinne Zeit für das, was dir wichtig ist.</p>
      <div className="hero-actions"><ActionLink>Auftrag erstellen</ActionLink><a href="#so-gehts" className="text-link">So funktioniert’s<Icon name="arrow" /></a></div>
      <p className="hero-reassurance"><span className="tiny-check"><Icon name="check" /></span>Kostenlos erstellen. Direkt Hilfe finden.</p>
      <div className="hero-bottom"><span className="austria-mark" aria-hidden="true"><span /><span /><span /></span><p>Für Menschen. Für Möglichkeiten.<br /><strong>In ganz Österreich.</strong></p></div>
    </div>

    <div className={`hero-scene scene-${category.tone}`} aria-label="Beispiele für Aufgaben auf Erledigo">
      <div className="scene-topline"><span>WENIGER TO-DOS. MEHR LEBEN.</span><span className="scene-plus" aria-hidden="true">+</span></div>
      <div className="scene-ring scene-ring-one" aria-hidden="true" /><div className="scene-ring scene-ring-two" aria-hidden="true" />
      <div className="scene-main-image" key={category.id}><img src={category.image} srcSet={`${category.thumbnail} 320w, ${category.image} 720w`} sizes="(max-width: 600px) 240px, 340px" alt="" fetchPriority={active === 0 ? 'high' : 'auto'} width="400" height="400" /></div>
      <div className="scene-sticker"><span className="sticker-check"><Icon name="check" /></span><span>Ein To-do weniger.<br /><strong>Ein bisschen mehr du.</strong></span></div>
      <div className="scene-task glass-surface" aria-live="polite" aria-atomic="true">
        <div className="scene-task-top"><span><span className="status-dot" />So könnte dein Auftrag aussehen</span><Icon name="arrow-up" /></div>
        <h2>{category.task}</h2><div className="scene-task-bottom"><span><Icon name="pin" />{category.location}<span className="task-separator">·</span>{category.shortTitle}</span><strong>{category.budget} €<small>Wunschpreis</small></strong></div>
      </div>
      <div className="scene-controls"><div><span className="scene-current">0{active + 1}</span><span className="scene-total"> / 06</span><span className="scene-category">{category.shortTitle}</span></div><div className="flex gap-2"><button type="button" className="scene-control" onClick={() => change(-1)} aria-label="Vorheriges Aufgabenbeispiel"><Icon name="arrow" className="rotate-180" /></button><button type="button" className="scene-control" onClick={() => change(1)} aria-label="Nächstes Aufgabenbeispiel"><Icon name="arrow" /></button></div></div>
    </div>
  </section>
}

export function ValueStrip() {
  return <div className="section-container"><div className="value-strip">
    <div><Icon name="plus" /><span>Dein Auftrag.<strong>Kostenlos erstellt.</strong></span></div>
    <div><Icon name="chat" /><span>Deine Absprache.<strong>Direkt miteinander.</strong></span></div>
    <div><Icon name="globe" /><span>Deine Möglichkeiten.<strong>In ganz Österreich.</strong></span></div>
  </div></div>
}
