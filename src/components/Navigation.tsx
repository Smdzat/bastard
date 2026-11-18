import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { ActionLink, Logo } from './ui'
import { Icon } from './Icon'
import './navigation.css'

export function Navigation({ onDemoRequest }: { onDemoRequest: () => void }) {
  const contactRef = useRef<HTMLDialogElement>(null)

  function handleDemoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    event.stopPropagation()
    onDemoRequest()
  }

  return <>
    <div id="start" className="navigation-spacer" aria-hidden="true" />
    <header className="header-shell">
      <nav className="floating-nav" aria-label="Main navigation">
        <a href="/#start" className="logo-link" aria-label="Naivano home"><Logo /></a>
        <div className="nav-actions">
          <button className="nav-contact" type="button" onClick={() => contactRef.current?.showModal()}>Contact</button>
          <ActionLink className="nav-cta" href="/#dashboard" onClick={handleDemoClick}>View demo</ActionLink>
          <a className="nav-progress-button" href="/progress" aria-label="Progress check" title="Progress check"><Icon name="github" /></a>
        </div>
      </nav>
    </header>
    <dialog className="nav-contact-dialog" ref={contactRef} aria-labelledby="contact-title" onClick={event => {
      if (event.target === event.currentTarget) contactRef.current?.close()
    }}>
      <div className="nav-contact-content">
        <button className="nav-contact-close" type="button" aria-label="Close contact" onClick={() => contactRef.current?.close()}><Icon name="close" /></button>
        <p className="section-label"><span aria-hidden="true" /> Contact Naivano</p>
        <h2 id="contact-title">Let's talk about your IT.</h2>
        <p>Write to us at <a href="mailto:artin@naivano.com">artin@naivano.com</a></p>
        <a href="/#faq" onClick={() => contactRef.current?.close()}>Read the FAQ <Icon name="arrow" /></a>
      </div>
    </dialog>
  </>
}
