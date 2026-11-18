import type { CSSProperties, ReactNode } from 'react'

type IconName = 'arrow' | 'arrow-up' | 'chevron' | 'check' | 'plus' | 'close' | 'copy' | 'menu' | 'pin' | 'phone' | 'chat' | 'globe' | 'shield' | 'apple' | 'play' | 'pause' | 'clock' | 'user' | 'github'

export function Icon({ name = 'arrow', className = '', style }: { name?: IconName; className?: string; style?: CSSProperties }) {
  const paths: Partial<Record<IconName, ReactNode>> = {
    github: <path fill="currentColor" stroke="none" d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.63 1.22 3.27.93.1-.72.39-1.22.72-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.63 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.21.65.78.54A11.25 11.25 0 0 0 12 .75Z" />,
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    'arrow-up': <><path d="M6 18 18 6M6 6h12v12" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    menu: <path d="M4 8h16M4 16h16" />,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M10 5h4M11 19h2" /></>,
    chat: <><path d="M20 11.5a8 8 0 0 1-8 8H4l1.5-4A8 8 0 1 1 20 11.5Z" /><path d="M8 10h8M8 14h5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
    apple: <path fill="currentColor" stroke="none" d="M16.5 3c-.1 1.3-.7 2.5-1.5 3.3-.8.9-2.1 1.5-3.3 1.4-.2-1.2.4-2.5 1.2-3.3.9-.9 2.3-1.6 3.6-1.4ZM20 17.3c-.5 1.2-.7 1.7-1.3 2.7-.9 1.3-2.1 2.8-3.6 2.8-1.3 0-1.6-.8-3.3-.8-1.6 0-2 .8-3.3.8-1.4 0-2.6-1.4-3.5-2.8C2.5 16.3 2 11.7 3.6 9.3c1.2-1.7 3-2.1 4.7-2.1 1.3 0 2.4.8 3.4.8.9 0 2.5-.9 4.2-.8 1.4.1 2.8.8 3.7 1.9-3.3 1.9-2.8 6.6.4 8.2Z" />,
    play: <><path fill="currentColor" stroke="none" d="M5 3.5v17l11-8.5L5 3.5Z" /><path d="m7 3 14 9L7 21" strokeWidth="1.5" /></>,
    pause: <path d="M9 5v14M15 5v14" />,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={`icon ${className}`} style={style} aria-hidden="true">{paths[name]}</svg>
}
