import legalContent from '../data/legal.json'
import { Icon } from '../components/Icon'
import './legal-page.css'

export type LegalSlug = keyof typeof legalContent

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const document = legalContent[slug]
  return <main id="inhalt" className="legal-page">
    <header className="legal-page-heading"><a className="page-back" href="/"><Icon name="arrow" /> Zur Startseite</a><p className="page-kicker">ERLEDIGO · RECHTLICHES</p><h1>{document.title}</h1><p>Transparent. Verständlich. An einem Ort.</p><span>Stand der bestehenden Erklärung: {document.sourceDate}</span></header>
    <div className="legal-page-layout">
      <aside className="legal-toc"><p>Auf dieser Seite</p><nav aria-label="Inhaltsverzeichnis">{document.sections.map((section, index) => <a key={section.id} href={`#${section.id}`}><span>{String(index + 1).padStart(2, '0')}</span>{section.title.replace(/^\d+\.\s*/, '')}</a>)}</nav><a className="legal-source" href={document.source} target="_blank" rel="noreferrer">Original auf erledo.at ↗</a></aside>
      <article className="legal-article">{document.sections.map(section => <section key={section.id} id={section.id}><h2>{section.title}</h2><div dangerouslySetInnerHTML={{ __html: section.html }} /></section>)}</article>
    </div>
  </main>
}
