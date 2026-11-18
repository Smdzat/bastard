import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import history from '../data/progress.json'
import { Icon } from '../components/Icon'
import './progress-page.css'

const zone = 'Europe/Berlin'
const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: zone, day: 'numeric', month: 'long', year: 'numeric' })
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit' })
const monthFormat = new Intl.DateTimeFormat('en', { timeZone: 'UTC', month: 'short' })
const total = Object.values(history.daily).reduce((sum, value) => sum + value, 0)
const end = new Date(history.end + 'T00:00:00Z')
const first = new Date(history.start + 'T00:00:00Z')
first.setUTCDate(first.getUTCDate() - (first.getUTCDay() + 6) % 7)
const days = Array.from({ length: Math.floor((+end - +first) / 86400000) + 1 }, (_, index) => {
  const date = new Date(+first + index * 86400000)
  const key = date.toISOString().slice(0, 10)
  const count = (history.daily as Record<string, number>)[key] || 0
  return { key, date, count, level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 7 ? 3 : 4 }
})
const months = days.filter((day, index) => index % 7 === 0 && (index === 0 || day.date.getUTCMonth() !== days[index - 7].date.getUTCMonth()))
const groups = new Map<string, typeof history.activities>()
for (const activity of history.activities) {
  const day = dayFormat.format(new Date(activity.at))
  const entries = groups.get(day) || []
  entries.push(activity)
  groups.set(day, entries)
}

function PrivateRepositoryNotice({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  return <span className="progress-private" ref={ref}
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
    onFocus={() => setOpen(true)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false) } }}>
    <button type="button" className={className} aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}>{children}</button>
    {open && <span id={id} className="progress-private-popup" role="note">
      <strong>Private repository</strong>
      <span>For development questions, please contact</span>
      <a href="mailto:artin@naivano.com">artin@naivano.com</a>
    </span>}
  </span>
}

export function ProgressPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const activeDay = days.find(day => day.key === selectedDay)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Progress check — Naivano'
    const calendar = calendarRef.current
    if (calendar) calendar.scrollLeft = calendar.scrollWidth
    return () => { document.title = previousTitle }
  }, [])

  return <div className="progress-page">
    <a className="progress-back" href="/"><Icon name="arrow" /> Back to home</a>
    <header className="progress-heading">
      <p className="section-label"><span aria-hidden="true" /> Building Naivano</p>
      <h1>Progress, day by day.</h1>
      <p>A look at the improvements, fixes and releases behind Naivano.</p>
    </header>

    <section className="progress-activity" aria-labelledby="activity-title">
      <div className="progress-activity-heading">
        <div><h2 id="activity-title">Development activity</h2><p>{total} commits over the past twelve months</p></div>
        <span className="progress-updated">Updated {dayFormat.format(new Date(history.updatedAt))}</span>
      </div>
      <div className="progress-heatmap-scroll" ref={calendarRef} tabIndex={0} role="region" aria-label="Development activity calendar. Scroll horizontally on small screens.">
        <div className="progress-heatmap">
          <div className="progress-months" aria-hidden="true">{months.map(day => (
            <span key={day.key} style={{ gridColumn: Math.floor(days.indexOf(day) / 7) + 1 }}>{monthFormat.format(day.date)}</span>
          ))}</div>
          <div className="progress-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div className="progress-grid">
            {days.map(({ key, date, count, level }) => (
              <button
                className="progress-cell"
                type="button"
                key={key}
                data-level={key < history.start ? 0 : level}
                aria-pressed={key === selectedDay}
                aria-label={`${count} ${count === 1 ? 'commit' : 'commits'} on ${dayFormat.format(date)}`}
                title={`${key} · ${count} ${count === 1 ? 'commit' : 'commits'}`}
                onClick={() => setSelectedDay(key)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="progress-heatmap-footer">
        <p role="status">{activeDay ? `${dayFormat.format(activeDay.date)} · ${activeDay.count} ${activeDay.count === 1 ? 'commit' : 'commits'}` : 'Select a day to see its commit count.'}</p>
        <div className="progress-legend" aria-label="Activity intensity from less to more"><span>Less</span>{[0, 1, 2, 3, 4].map(level => <i key={level} data-level={level} />)}<span>More</span></div>
      </div>
    </section>

    <section className="progress-history" aria-labelledby="history-title">
      <div className="progress-history-heading"><h2 id="history-title">Activity history</h2><p>Latest {history.commitLimit} commits and recorded pushes · Times in Europe/Berlin</p></div>
      <p className="progress-source-note">Latest commit {dayFormat.format(new Date(history.latestCommitAt))} · Public summaries of Naivano development updates.</p>
      {[...groups].map(([day, activities]) => (
        <div className="progress-day" key={day}>
          <h3>{day}</h3>
          <ol>{activities.map(activity => (
            <li key={activity.type + activity.hash + activity.at}>
              <span className={`progress-marker is-${activity.type}`} aria-hidden="true"><Icon name={activity.type === 'push' ? 'arrow-up' : 'check'} /></span>
              <div className="progress-entry">
                <div className="progress-entry-meta"><span className="progress-kind">{activity.type === 'push' ? 'Push' : 'Commit'}</span><time dateTime={activity.at}>{timeFormat.format(new Date(activity.at))}</time></div>
                <h4>{activity.title}</h4>
                {activity.type === 'commit' && <>
                  {activity.description && <p className="progress-description">{activity.description}</p>}
                  <p className="progress-change-summary">{activity.filesChanged} {activity.filesChanged === 1 ? 'file' : 'files'} changed <span className="progress-added">+{activity.added.toLocaleString('en-GB')}</span> <span className="progress-removed">−{activity.removed.toLocaleString('en-GB')}</span></p>
                </>}
                {activity.type === 'push' && <ul className="progress-push-commits" aria-label="Commits in this push">{activity.commits.map(commit => <li key={commit.hash}>
                  <PrivateRepositoryNotice className="progress-push-commit"><code>{commit.hash}</code><span>{commit.message}</span></PrivateRepositoryNotice>
                </li>)}</ul>}
                <div className="progress-entry-footer"><PrivateRepositoryNotice className="progress-hash">{activity.type === 'push' ? 'Push head' : 'Commit'} <code>{activity.hash}</code> <svg className="progress-private-lock" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="3.5" y="7" width="9" height="7" rx="1.5" /><path d="M5.5 7V4a2.5 2.5 0 0 1 5 0v3" /></svg></PrivateRepositoryNotice><span className="progress-author">{activity.author}</span></div>
              </div>
            </li>
          ))}</ol>
        </div>
      ))}
    </section>
  </div>
}
