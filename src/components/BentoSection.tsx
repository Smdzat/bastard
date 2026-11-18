import '@fontsource-variable/inter'
import serviceDesk from '../assets/nevian-service-desk-overview.webp'
import procurement from '../assets/nevian-hardware-procurement.webp'
import support from '../assets/nevian-helpdesk-ai-chat.webp'
import inventory from '../assets/nevian-device-inventory-fleet.webp'
import changes from '../assets/nevian-change-management.webp'
import knowledge from '../assets/nevian-knowledge-base.webp'
import security from '../assets/nevian-vulnerability-security-monitoring.webp'
import { Reveal } from './ui'
import './bento-section.css'

const features = [
  {
    id: 'service-desk', image: serviceDesk,
    title: ['Service Desk.', 'Im Überblick.'],
    description: 'Priorisiere Anfragen, weise Tickets zu und sieh, was noch offen ist.',
  },
  {
    id: 'procurement', image: procurement,
    title: ['Hardware.', 'Nach Bedarf.'],
    description: 'Bündle Bestellungen, Freigaben und Übergaben im Beschaffungsportal.',
  },
  {
    id: 'support', image: support,
    title: ['Support.', 'Direkt im Chat.'],
    description: 'Mitarbeitende fragen im KI-Chat nach Hilfe. Offene Fälle gehen ans IT-Team.',
  },
  {
    id: 'inventory', image: inventory,
    title: ['Geräte.', 'Im Inventar.'],
    description: 'Sieh, welche Geräte online sind und welche Software sie nutzen.',
  },
  {
    id: 'changes', image: changes,
    title: ['Änderungen.', 'Mit System.'],
    description: 'Plane Änderungen und Wartungsfenster und verfolge ihre Freigaben.',
  },
  {
    id: 'knowledge', image: knowledge,
    title: ['Wissen.', 'Für dein Team.'],
    description: 'Sammle Anleitungen und Lösungen für wiederkehrende Anfragen.',
  },
  {
    id: 'security', image: security,
    title: ['Sicherheit.', 'Im Blick.'],
    description: 'Finde Schwachstellen und passende Updates für betroffene Geräte.',
  },
]

export function BentoSection() {
  return <section id="funktionen" className="nevian-features" aria-labelledby="features-title" tabIndex={-1}>
    <div className="feature-shell">
      <Reveal className="feature-heading">
        <h2 id="features-title">Für den Service Desk.<br />Und alles drumherum.</h2>
        <p>Von der ersten Anfrage bis zur Lösung. Entdecke, was Naivano für Support und IT-Betrieb bündelt.</p>
      </Reveal>
      <div className="feature-grid">
        {features.map(({ id, image, title, description }) => (
          <div className={`feature-cell feature-cell--${id}`} key={id}>
            <article className="feature-card" aria-labelledby={`feature-${id}`}>
              <div className="feature-copy">
                <h3 id={`feature-${id}`}>{title[0]}<br />{title[1]}</h3>
                <p>{description}</p>
              </div>
              <div className="feature-art" aria-hidden="true"><img src={image} alt="" loading="lazy" decoding="async" /></div>
            </article>
          </div>
        ))}
      </div>
    </div>
  </section>
}
