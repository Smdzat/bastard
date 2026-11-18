import { useEffect, useRef } from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

export function Logo() {
  return <img className="wordmark" src="/assets/naivano-logo.webp" alt="Naivano" width={576} height={126} />
}

export function ActionLink({ children, href = '/#dashboard', secondary = false, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { secondary?: boolean }) {
  return <a href={href} className={`action-link ${secondary ? 'action-link-secondary' : ''} ${className}`} {...props}><span>{children}</span><span className="action-arrow"><Icon name="arrow-up" /></span></a>
}

export function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`section-label ${light ? 'section-label-light' : ''}`}><span aria-hidden="true" />{children}</p>
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.dataset.state = 'waiting'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.dataset.state = 'visible'
        observer.unobserve(el)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' })
    observer.observe(el)
    return () => { observer.disconnect(); delete el.dataset.state }
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}
