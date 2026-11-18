import { useCallback, useEffect, useRef } from 'react'
import type { MouseEvent, RefObject } from 'react'
import type Lenis from 'lenis'
import './dashboard-showcase.css'

const demoPath = '/executive'
const aiDemoPath = '/naivanoai'
const expansionDuration = 450
const returnDuration = 340

type OpenDemo = {
  update: (path?: string) => void
  restore: () => void
}

export type DemoRequest = { target: 'overview' | 'ai' }

interface DashboardShowcaseProps {
  demoRequest: DemoRequest | null
  scroller: RefObject<Lenis | null>
}

export function DashboardShowcase({ demoRequest, scroller }: DashboardShowcaseProps) {
  const slotRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDialogElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const openDemo = useRef<OpenDemo | null>(null)
  const syncFramePath = useRef<((path: string) => void) | null>(null)
  const cleanupFrame = useRef<(() => void) | null>(null)
  const pendingScroll = useRef<number | undefined>(undefined)
  const scrollRestoration = useRef<ScrollRestoration>('auto')

  const expand = useCallback((path: string, openAiAfterExpansion = false) => {
    const slot = slotRef.current
    const preview = previewRef.current
    const iframe = iframeRef.current
    if (!slot || !preview || !iframe || openDemo.current) return

    const rect = preview.getBoundingClientRect()
    const radius = getComputedStyle(preview).borderRadius
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingInlineEnd
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousTitle = document.title
    const returnFocus = document.activeElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    slot.classList.add('has-open-demo')
    preview.classList.remove('has-returned-demo')
    history.scrollRestoration = 'manual'
    if (scrollbarWidth > 0) {
      const padding = getComputedStyle(document.body).paddingInlineEnd
      document.body.style.paddingInlineEnd = `calc(${padding} + ${scrollbarWidth}px)`
    }
    document.body.style.overflow = 'hidden'
    document.title = 'Demo — Naivano'
    preview.close()
    preview.classList.add('is-opening-demo')
    preview.setAttribute('role', 'dialog')
    preview.setAttribute('aria-label', 'Naivano Demo')
    iframe.inert = false
    iframe.removeAttribute('aria-hidden')
    iframe.removeAttribute('tabindex')
    iframe.title = 'Interactive Naivano demo'
    iframe.contentDocument?.documentElement.classList.remove('nevian-demo-embedded')
    preview.showModal()
    preview.querySelector<HTMLAnchorElement>('.demo-home-link')?.focus({ preventScroll: true })
    syncFramePath.current?.(path)

    let animation: Animation | undefined
    const canAnimate = !reduceMotion && typeof preview.animate === 'function'
    const expanded = { transform: 'none', borderRadius: '0px', '--showcase-contour': '0' }
    const compact = (bounds: DOMRect) => ({
      transform: `translate(${bounds.left}px, ${bounds.top}px) scale(${bounds.width / preview.offsetWidth}, ${bounds.height / preview.offsetHeight})`,
      borderRadius: radius,
      '--showcase-contour': '1',
    })
    const currentFrame = () => {
      const style = getComputedStyle(preview)
      return { transform: style.transform, borderRadius: style.borderRadius, '--showcase-contour': style.getPropertyValue('--showcase-contour') || '0' }
    }
    const play = (from: Keyframe, to: Keyframe, duration: number) => {
      animation?.cancel()
      animation = preview.animate([from, to], { duration, easing: 'cubic-bezier(.22, .76, .22, 1)', fill: 'both' })
      return animation
    }

    const restore = (revealPreview = false) => {
      const scrollTop = window.scrollY
      animation?.cancel()
      preview.close()
      preview.classList.remove('is-opening-demo', 'is-returning-demo')
      if (revealPreview) preview.classList.add('has-returned-demo')
      preview.style.removeProperty('--showcase-return-shade')
      preview.style.removeProperty('--showcase-return-opacity')
      preview.setAttribute('role', 'region')
      preview.setAttribute('aria-label', 'Dashboard preview')
      iframe.inert = true
      iframe.setAttribute('aria-hidden', 'true')
      iframe.tabIndex = -1
      iframe.title = 'Naivano dashboard preview'
      iframe.contentDocument?.documentElement.classList.add('nevian-demo-embedded')
      preview.show()
      slot.classList.remove('has-open-demo')
      document.body.style.overflow = previousOverflow
      document.body.style.paddingInlineEnd = previousPadding
      document.title = previousTitle
      history.scrollRestoration = scrollRestoration.current
      syncFramePath.current?.(demoPath)
      const focusTarget = returnFocus instanceof HTMLElement && returnFocus !== document.body && !returnFocus.closest('[inert]')
        ? returnFocus
        : document.querySelector<HTMLElement>('.nav-cta')
      focusTarget?.focus({ preventScroll: true })
      window.scrollTo({ top: scrollTop, behavior: 'instant' })
      openDemo.current = null
    }

    openDemo.current = {
      restore,
      update(nextPath) {
        const returning = preview.classList.contains('is-returning-demo')
        if (nextPath) {
          syncFramePath.current?.(nextPath)
          if (returning) {
            const from = currentFrame()
            preview.classList.remove('is-returning-demo')
            iframe.inert = false
            play(from, expanded, expansionDuration)
          }
          return
        }
        if (!canAnimate) { restore(); return }
        if (returning) return

        const from = currentFrame()
        preview.style.setProperty('--showcase-return-shade', getComputedStyle(preview, '::backdrop').opacity)
        preview.style.setProperty('--showcase-return-opacity', getComputedStyle(iframe).opacity)
        preview.classList.add('is-returning-demo')
        iframe.inert = true
        syncFramePath.current?.(demoPath)
        // Keep the same frame and animate only its shell back to the preview slot.
        void play(from, compact(slot.getBoundingClientRect()), returnDuration).finished.then(() => restore(true), () => {})
      },
    }

    const opening = canAnimate ? play(compact(rect), expanded, expansionDuration) : undefined
    if (openAiAfterExpansion) {
      const showAi = () => {
        if (!history.state?.naivanoDemoDepth || location.pathname !== demoPath || preview.classList.contains('is-returning-demo')) return
        history.replaceState(history.state, '', aiDemoPath)
        syncFramePath.current?.(aiDemoPath)
      }
      if (opening) void opening.finished.then(showAi, () => {})
      else showAi()
    }
  }, [])

  const launchDemo = useCallback((request: DemoRequest) => {
    if (window.matchMedia('(max-width: 700px)').matches) {
      window.location.assign(request.target === 'ai' ? aiDemoPath : demoPath)
      return
    }
    const preview = previewRef.current
    if (!preview || openDemo.current || pendingScroll.current !== undefined || history.state?.naivanoDemoDepth) return

    const open = () => {
      pendingScroll.current = undefined
      if (!preview.isConnected || openDemo.current || history.state?.naivanoDemoDepth) return
      scrollRestoration.current = history.scrollRestoration
      history.scrollRestoration = 'manual'
      history.pushState({ naivanoDemoDepth: 1 }, '', demoPath)
      expand(demoPath, request.target === 'ai')
    }
    pendingScroll.current = requestAnimationFrame(() => {
      const lenis = scroller.current
      const scrollTarget = window.scrollY + preview.getBoundingClientRect().top - 100
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!lenis || reduceMotion) {
        window.scrollTo({ top: scrollTarget, behavior: 'instant' })
        open()
        return
      }
      lenis.scrollTo(scrollTarget, {
        duration: .24, easing: t => 1 - (1 - t) ** 3, lock: true, force: true, onComplete: open,
      })
    })
  }, [expand, scroller])

  const closeDemo = useCallback(() => {
    const depth = history.state?.naivanoDemoDepth
    if (depth) history.go(-depth)
  }, [])

  useEffect(() => {
    if (demoRequest) launchDemo(demoRequest)
  }, [demoRequest, launchDemo])

  useEffect(() => {
    const restoreRoute = () => {
      if (history.state?.naivanoDemoDepth) {
        const path = location.pathname + location.search
        if (openDemo.current) openDemo.current.update(path)
        else expand(path)
      } else {
        openDemo.current?.update()
      }
    }
    window.addEventListener('popstate', restoreRoute)
    return () => {
      window.removeEventListener('popstate', restoreRoute)
      if (pendingScroll.current !== undefined) cancelAnimationFrame(pendingScroll.current)
      pendingScroll.current = undefined
      openDemo.current?.restore()
      cleanupFrame.current?.()
    }
  }, [expand])

  function bindFrame() {
    cleanupFrame.current?.()
    const iframe = iframeRef.current
    const child = iframe?.contentWindow
    const childDocument = iframe?.contentDocument
    if (!child || !childDocument) return

    const childHistory = child.history
    const push = childHistory.pushState
    const replace = childHistory.replaceState
    const framePath = () => child.location.pathname + child.location.search + child.location.hash

    // The live frame keeps a single history entry. The parent carries the
    // demo routes so Back, Forward and the address bar work in fullscreen.
    const mirrorRoute = (pushEntry: boolean) => {
      const depth = history.state?.naivanoDemoDepth
      const path = framePath()
      if (!depth || path === location.pathname + location.search + location.hash) return
      if (pushEntry) history.pushState({ naivanoDemoDepth: depth + 1 }, '', path)
      else history.replaceState({ naivanoDemoDepth: depth }, '', path)
    }
    childHistory.pushState = (state, unused, url) => {
      replace.call(childHistory, state, unused, url)
      mirrorRoute(true)
    }
    childHistory.replaceState = (state, unused, url) => {
      replace.call(childHistory, state, unused, url)
      mirrorRoute(false)
    }
    syncFramePath.current = path => {
      if (framePath() === path) return
      replace.call(childHistory, childHistory.state, '', path)
      child.dispatchEvent(new PopStateEvent('popstate', { state: childHistory.state }))
    }

    if (history.state?.naivanoDemoDepth) {
      childDocument.documentElement.classList.remove('nevian-demo-embedded')
      syncFramePath.current(location.pathname + location.search)
    }

    cleanupFrame.current = () => {
      childHistory.pushState = push
      childHistory.replaceState = replace
      syncFramePath.current = null
      cleanupFrame.current = null
    }
  }

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (!history.state?.naivanoDemoDepth) return
    event.preventDefault()
    closeDemo()
  }

  function handlePreviewClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    launchDemo({ target: 'overview' })
  }

  return <section id="dashboard" className="dashboard-showcase" aria-labelledby="dashboard-title">
    <div className="dashboard-showcase-heading">
      <h1 id="dashboard-title">A look inside Naivano.</h1>
      <p>Explore tickets, devices and IT workflows in a sample workspace.</p>
    </div>
    <div className="dashboard-mobile-summary">
      <div className="dashboard-mobile-label"><img src="/assets/naivano-mark.png" alt="" width={28} height={28} /> Naivano demo workspace</div>
      <ul>
        <li><strong>Service desk</strong><span>Explore the ticket queue</span></li>
        <li><strong>Device inventory</strong><span>Check endpoint health</span></li>
        <li><strong>Naivano AI</strong><span>Ask about the sample workspace</span></li>
      </ul>
      <a href={demoPath}>Open the demo <span aria-hidden="true">↗</span></a>
    </div>
    <div ref={slotRef} className="dashboard-showcase-slot">
      <dialog
        ref={previewRef}
        className="dashboard-showcase-window"
        open
        role="region"
        aria-label="Dashboard preview"
        onCancel={event => { event.preventDefault(); closeDemo() }}
      >
        <div className="dashboard-showcase-toolbar">
          <span>Overview</span>
        </div>
        <nav className="demo-home-nav" aria-label="Demo navigation">
          <a href="/" className="demo-home-brand" onClick={handleHomeClick} aria-label="Naivano home">
            <img src="/assets/naivano-logo.webp" alt="" width={576} height={126} />
          </a>
          <span className="demo-home-mode">Sample data</span>
          <a href="/" className="demo-home-link" onClick={handleHomeClick}><span aria-hidden="true">←</span> Back to home</a>
        </nav>
        <iframe ref={iframeRef} onLoad={bindFrame} title="Naivano dashboard preview" src={demoPath} loading="lazy" tabIndex={-1} aria-hidden="true" inert />
        <a className="dashboard-preview-launch" href={demoPath} onClick={handlePreviewClick} aria-label="Open the full interactive dashboard" />
      </dialog>
    </div>
  </section>
}
