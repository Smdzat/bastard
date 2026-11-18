import { Fragment, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import '@fontsource-variable/inter'
import taskIcon from '../assets/mini-auftrag.webp'
import helperIcon from '../assets/mini-helfer.webp'
import chatIcon from '../assets/mini-chat.webp'
import { useScrollWordReveal } from '../hooks/useScrollWordReveal'
import { AiShowcase } from './AiShowcase'
import './connection-statement.css'

const message = 'One place for tickets, devices and everything your IT team knows.'

function Words({ text }: { text: string }) {
  return <>{text.split(' ').map((word, index) => <Fragment key={`${word}-${index}`}><span className="connection-word" data-reveal-word>{word}</span>{' '}</Fragment>)}</>
}

function FloatingIcon({ src, tilt, delay }: { src: string; tilt: number; delay: number }) {
  return <span className="connection-inline-icon" style={{ '--icon-tilt': `${tilt}deg`, '--float-delay': `${delay}s` } as CSSProperties}>
    <img src={src} alt="" width="128" height="128" loading="lazy" decoding="async" />
  </span>
}

export function ConnectionStatement({ onAiRequest }: { onAiRequest: () => void }) {
  const ref = useScrollWordReveal()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const armed = useRef(true)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    const toggle = toggleRef.current
    if (!toggle) return
    let frame = 0

    function update() {
      frame = 0
      if (!toggle) return
      const bounds = toggle.getBoundingClientRect()
      const trigger = window.innerHeight - 84
      if (bounds.top > trigger + 24) {
        if (!armed.current) {
          armed.current = true
          setDemoOpen(false)
        }
      } else if (armed.current && bounds.bottom > 0 && bounds.top + bounds.height * .6 <= trigger) {
        armed.current = false
        setDemoOpen(true)
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  function toggleDemo() {
    armed.current = false
    setDemoOpen(value => !value)
  }

  return <section ref={ref} className="connection-section" id="plattform" aria-labelledby="connection-title" tabIndex={-1}>
    <div className="connection-container">
      <h2 className="sr-only" id="connection-title">{message}</h2>
      <div className="connection-heading" data-reveal-heading>
        <div className="connection-visual">
          <div aria-hidden="true">
          <span className="connection-line"><Words text="One place for" /><FloatingIcon src={taskIcon} tilt={-6} delay={0} /><Words text="Tickets," /></span>
          <span className="connection-line"><Words text="devices" /><FloatingIcon src={helperIcon} tilt={7} delay={-2.4} /><Words text="and the knowledge" /></span>
          <span className="connection-line"><Words text="of your" /><FloatingIcon src={chatIcon} tilt={-5} delay={-4.6} /></span>
          </div>
          <span className="connection-line connection-ending">
            <button ref={toggleRef} className="connection-toggle" type="button" role="switch" aria-checked={demoOpen} aria-label="Show Naivano AI preview" aria-controls="ai-showcase" onClick={toggleDemo}>
              <span className="connection-toggle-equals" aria-hidden="true"><span /><span /></span>
              <span className="connection-toggle-thumb" aria-hidden="true" />
            </button>
            <span aria-hidden="true"><Words text="IT team." /></span>
          </span>
        </div>
      </div>
    </div>
    <AiShowcase open={demoOpen} onAiRequest={onAiRequest} />
  </section>
}
