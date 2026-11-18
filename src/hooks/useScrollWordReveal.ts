import { useEffect, useRef } from 'react'

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smoothstep = (value: number) => value * value * (3 - 2 * value)

/** Scroll position drives the reveal in both directions; React stays out of the frame loop. */
export function useScrollWordReveal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = ref.current
    if (!section) return
    const heading = section.querySelector<HTMLElement>('[data-reveal-heading]')
    const words = [...section.querySelectorAll<HTMLElement>('[data-reveal-word]')]
    if (!heading || !words.length) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let disposed = false
    let dirty = true
    let current = 0
    let target = 0
    let previousTime = 0

    const paint = (progress: number) => {
      const overlap = 0.24
      words.forEach((word, index) => {
        const start = index / Math.max(1, words.length - 1) * (1 - overlap)
        const local = smoothstep(clamp((progress - start) / overlap))
        word.style.setProperty('--word-progress', local.toFixed(4))
      })
    }

    const tick = (time: number) => {
      frame = 0
      if (disposed) return
      if (motion.matches) { current = 1; paint(1); return }

      if (dirty) {
        const height = window.innerHeight
        target = clamp((height * 0.88 - heading.getBoundingClientRect().top) / (height * 0.72))
        dirty = false
      }

      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
      previousTime = time
      current += (target - current) * (1 - Math.exp(-elapsed / 85))
      if (Math.abs(target - current) < 0.0002) current = target
      paint(current)

      if (current !== target) frame = requestAnimationFrame(tick)
      else previousTime = 0
    }

    const schedule = () => {
      if (disposed) return
      dirty = true
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        section.dataset.inView = String(entry.isIntersecting)
        schedule()
      }, { rootMargin: '60px 0px' })
      : null

    observer?.observe(section)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    void document.fonts.ready.then(schedule)
    schedule()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [])

  return ref
}
