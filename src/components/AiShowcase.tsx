import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import wave from '../assets/naivano-ai-wave.webp'
import { Icon } from './Icon'
import './ai-showcase.css'

const aiUrl = '/naivanoai'
const assets = '/assets/integrations/'

export function AiShowcase({ open, onAiRequest }: { open: boolean; onAiRequest: () => void }) {
  const panel = useRef<HTMLElement>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (!open || !panel.current) return
    const elements = Array.from(panel.current.querySelectorAll<HTMLElement>('[data-ai-reveal]'))
    if (!('IntersectionObserver' in window)) {
      elements.forEach(element => { element.dataset.revealed = 'true' })
      return
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        element.dataset.revealed = 'true'
        observer.unobserve(element)
      }
    }, { threshold: .12 })
    elements.forEach(element => observer.observe(element))
    return () => {
      observer.disconnect()
      elements.forEach(element => { delete element.dataset.revealed })
    }
  }, [open])

  function handleDemoClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    onAiRequest()
  }

  return <div className="ai-showcase-collapse" id="ai-showcase" data-open={open} inert={!open} aria-hidden={!open}>
    <div className="ai-showcase-clip">
      <section className="ai-showcase" ref={panel} aria-labelledby="ai-showcase-title">
        <header className="ai-showcase-intro" data-ai-reveal>
          <p className="ai-showcase-kicker"><span aria-hidden="true">✦</span> Naivano AI</p>
          <h2 id="ai-showcase-title">Clarity for your<br />IT support.</h2>
          <p className="ai-showcase-summary">Ask about tickets, devices and what needs attention.</p>
          <div className="ai-showcase-actions">
            <a className="ai-showcase-primary" href={aiUrl} onClick={handleDemoClick}>Try Naivano AI</a>
          </div>
        </header>

        <div className="ai-showcase-banner" data-ai-reveal>
          <img className="ai-showcase-wave" src={wave} alt="" width={1600} height={533} loading="lazy" />
          <div className="ai-showcase-conversation">
            <div className="ai-showcase-chat">
              <p>Which tickets need my attention today?</p>
              <div className="ai-showcase-chat-controls">
                <small>Example question</small>
                <button type="button" aria-expanded={showAnswer} aria-controls="ai-example-answer" aria-label={showAnswer ? 'Hide answer' : 'Show example answer'} onClick={() => setShowAnswer(value => !value)}>
                  <Icon name={showAnswer ? 'close' : 'arrow-up'} />
                </button>
              </div>
              <p className="ai-showcase-answer" id="ai-example-answer" hidden={!showAnswer}>Two sample tickets are open. Check the Outlook sign-in issue first, then assign the monitor request.</p>
            </div>
            <a className="ai-showcase-banner-link" href={aiUrl} onClick={handleDemoClick}>Ask your own question in the demo <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <ul className="ai-showcase-brands" aria-label="Platforms and tools" data-ai-reveal>
          <li><img className="ai-showcase-wordmark" src={assets + 'microsoft-6.svg'} alt="Microsoft" loading="lazy" /></li>
          <li><img className="ai-showcase-wordmark" src={assets + 'windows-server.svg'} alt="Windows Server" loading="lazy" /></li>
          <li><img src={assets + 'azure-2.svg'} alt="" loading="lazy" /> Azure</li>
          <li><img src={assets + 'azure-active-directory.svg'} alt="" loading="lazy" /> Entra ID</li>
          <li><img src={assets + 'powershell.svg'} alt="" loading="lazy" /> PowerShell</li>
        </ul>

        <div className="ai-showcase-impact" data-ai-reveal>
          <h3>Naivano AI summarizes open tickets, <span>finds affected devices</span> and helps you see <span>what needs attention next.</span></h3>
          <a className="ai-showcase-primary" href={aiUrl} onClick={handleDemoClick}>Try Naivano AI</a>
        </div>
      </section>
    </div>
  </div>
}
