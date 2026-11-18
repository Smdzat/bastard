import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from './Icon'
import './footer.css'

const mark = '/assets/naivano-mark.png'
const links = [
  { title: 'Navigation', items: [
    ['How it works', '#plattform'], ['Platforms and tools', '#technologien'],
    ['API & Webhooks', '#api'], ['FAQ', '#faq'],
  ] },
  { title: 'Explore', items: [
    ['Dashboard demo', '/executive'], ['Service desk', '/tickets/'],
    ['Device inventory', '/fleet/'], ['Naivano AI', '/naivanoai/'],
  ] },
] as const

const shortcuts = [
  { icon: 'globe', label: 'Technology platforms', href: '#technologien' },
  { icon: 'chat', label: 'Frequently asked questions', href: '#faq' },
  { icon: 'copy', label: 'API examples', href: '#api' },
  { icon: 'arrow-up', label: 'Open the demo workspace', href: '/executive' },
] as const

export function Footer() {
  const [notice, setNotice] = useState(false)

  function previewSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    setNotice(true)
  }

  return <footer id="footer" className="site-footer">
    <div className="site-footer-layout">
      <div className="site-footer-brand">
        <a className="site-footer-logo" href="#start" aria-label="Naivano home">
          <img src={mark} alt="" width={30} height={30} /> Naivano
        </a>
        <p>Your IT service desk,<br /><span>powered by AI.</span></p>
        <div className="site-footer-shortcuts">
          <span>Explore Naivano</span>
          <div>{shortcuts.map(({ icon, label, href }) => <a key={href} href={href} aria-label={label} title={label}><Icon name={icon} /></a>)}</div>
        </div>
      </div>

      <div className="site-footer-panel">
        <div className="site-footer-sticker" aria-hidden="true"><img src={mark} alt="" width={100} height={100} /></div>
        <nav className="site-footer-nav" aria-label="Footer navigation">
          {links.map(({ title, items }) => <div key={title}>
            <h2>{title}</h2>
            <ul>{items.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
          </div>)}
        </nav>
        <div className="site-footer-lower">
          <p className="site-footer-copyright">© {new Date().getFullYear()} Naivano. All rights reserved.</p>
          <div className="site-footer-newsletter">
            <h2><span>AI moves fast.</span><br />Stay up to date with Naivano.</h2>
            <form onSubmit={previewSubscription}>
              <input type="email" name="email" aria-label="Email address" placeholder="Enter email address" autoComplete="email" required onChange={() => setNotice(false)} />
              <button type="submit">Subscribe</button>
            </form>
            <p className="site-footer-notice" role="status">{notice ? 'Newsletter preview. No email was collected.' : 'Newsletter preview'}</p>
          </div>
        </div>
      </div>
    </div>
    <div className="site-footer-watermark" aria-hidden="true"><span>Naivano</span></div>
  </footer>
}
