import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useSmoothScroll() {
  const scroller = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.15,
      wheelMultiplier: 1.1,
      syncTouch: false,
      anchors: false,
      prevent: node => node.tagName === 'DIALOG',
    })
    scroller.current = lenis

    let anchorFrame = 0
    const cancelAnchor = () => {
      cancelAnimationFrame(anchorFrame)
      anchorFrame = 0
    }
    const followAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!link || link.download || (link.target && link.target !== '_self')) return
      const url = new URL(link.href, location.href)
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return
      let id: string
      try { id = decodeURIComponent(url.hash.slice(1)) } catch { return }
      const target = document.getElementById(id)
      if (!target) return
      event.preventDefault()
      cancelAnchor()
      if (location.hash !== url.hash) history.pushState(history.state, '', url.hash)

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const started = performance.now()
      let previous = started
      let settledAt = 0
      const tick = (now: number) => {
        if (!target.isConnected) { cancelAnchor(); return }
        const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
        // Re-read the destination while scroll-triggered sections change height.
        const destination = Math.max(0, Math.min(
          target.getBoundingClientRect().top + window.scrollY - padding - margin,
          document.documentElement.scrollHeight - window.innerHeight,
        ))
        const distance = destination - window.scrollY
        const progress = reducedMotion ? 1 : 1 - Math.exp(-Math.min(now - previous, 64) / 85)
        const next = Math.abs(distance) < .75 ? destination : window.scrollY + distance * progress
        lenis.scrollTo(next, { immediate: true, force: true })
        previous = now
        if (Math.abs(distance) < 1) settledAt ||= now
        else settledAt = 0
        if ((settledAt && now - settledAt > 160) || now - started > 3000) {
          cancelAnchor()
          return
        }
        anchorFrame = requestAnimationFrame(tick)
      }
      anchorFrame = requestAnimationFrame(tick)
    }
    document.addEventListener('click', followAnchor)
    window.addEventListener('wheel', cancelAnchor, { passive: true })
    window.addEventListener('touchstart', cancelAnchor, { passive: true })
    window.addEventListener('popstate', cancelAnchor)

    // Respect the existing modal scroll lock, including any remaining wheel inertia.
    const syncLock = () => {
      if (document.body.style.overflow === 'hidden') lenis.stop()
      else if (lenis.isStopped) lenis.start()
    }
    const observer = new MutationObserver(syncLock)
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    syncLock()

    return () => {
      observer.disconnect()
      cancelAnchor()
      document.removeEventListener('click', followAnchor)
      window.removeEventListener('wheel', cancelAnchor)
      window.removeEventListener('touchstart', cancelAnchor)
      window.removeEventListener('popstate', cancelAnchor)
      lenis.destroy()
      scroller.current = null
    }
  }, [])

  return scroller
}
