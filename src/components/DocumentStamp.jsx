import { useEffect, useEffectEvent, useState } from 'react'
import { playStampSound } from '../utils/sounds'
import './DocumentStamp.css'

// One timeline drives the rubber stamp, ink imprint and impact sound.
const IMPACT_MS = 280
const READ_MS = 1000

export default function DocumentStamp({ active = true, complete = false, soundEnabled = false,
  label = 'УТВЕРЖДЕНО', onComplete }) {
  const [printed, setPrinted] = useState(complete)
  const impact = useEffectEvent(() => {
    setPrinted(true)
    if (soundEnabled) playStampSound()
  })
  const finish = useEffectEvent(() => onComplete?.())

  useEffect(() => {
    if (!active || complete) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduced ? 0 : IMPACT_MS
    const hit = window.setTimeout(impact, delay)
    const done = window.setTimeout(finish, delay + READ_MS)
    return () => {
      window.clearTimeout(hit)
      window.clearTimeout(done)
    }
  }, [active, complete])

  return (
    <div className="document-stamp" style={{ '--stamp-impact': `${IMPACT_MS}ms` }}>
      {!active && !complete ? <p className="document-stamp-placeholder">Место для печати</p> : null}
      {active && !printed && !complete ? (
        <span className="document-stamp-tool" aria-hidden="true"><i /><b /></span>
      ) : null}
      {printed || complete ? (
        <div className={`document-stamp-ink ${complete ? 'document-stamp-ink--static' : ''}`} role="status">
          <span className="document-stamp-label">{label}</span>
          <strong>Зарина Шакирджановна</strong>
          <span className="document-stamp-role">Директор школы № 1</span>
        </div>
      ) : null}
    </div>
  )
}
