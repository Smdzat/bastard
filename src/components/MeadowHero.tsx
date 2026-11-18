import '@fontsource-variable/inter'
import './meadow-hero.css'

export function MeadowHero() {
  return <section className="meadow-hero" aria-labelledby="meadow-title">
    <div className="meadow-sheet">
      <div className="meadow-intro">
        <p className="meadow-eyebrow">IT-Service-Management für Teams</p>
        <h2 className="meadow-title" id="meadow-title">IT-Support.<br />Alles im Blick.</h2>
        <p className="meadow-description">Tickets bearbeiten, Geräte verwalten und IT-Prozesse koordinieren. <br />Mit Naivano hat dein Team alles an einem Ort.</p>
        <a className="meadow-cta" href="#dashboard"><span>Dashboard ansehen</span><span className="meadow-cta-arrow"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></span></a>
      </div>
    </div>
  </section>
}
