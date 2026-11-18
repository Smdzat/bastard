import { useState } from 'react'
import { Navigation } from './components/Navigation'
import { ConnectionStatement } from './components/ConnectionStatement'
import { DashboardShowcase } from './components/DashboardShowcase'
import type { DemoRequest } from './components/DashboardShowcase'
import { TechnologyStrip } from './components/TechnologyStrip'
import { ApiSection } from './components/ApiSection'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'
import { ProgressPage } from './pages/ProgressPage'
import './reference-flow.css'
import { useSmoothScroll } from './hooks/useSmoothScroll'

export function App() {
  const scroller = useSmoothScroll()
  const [demoRequest, setDemoRequest] = useState<DemoRequest | null>(null)
  const isProgress = window.location.pathname.replace(/\/$/, '') === '/progress'
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Navigation onDemoRequest={() => {
      if (isProgress) window.location.assign('/#dashboard')
      else setDemoRequest({ target: 'overview' })
    }} />
    <main id="main-content">
      {isProgress ? <ProgressPage /> : <>
      <DashboardShowcase demoRequest={demoRequest} scroller={scroller} />
      <TechnologyStrip />
      <div className="reference-flow"><ConnectionStatement onAiRequest={() => setDemoRequest({ target: 'ai' })} /></div>
      <ApiSection />
      <FAQ />
      </>}
    </main>
    <Footer />
  </>
}
