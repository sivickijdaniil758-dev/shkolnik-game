import { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import { playAchievementToastSound, resumeAudio } from '../utils/sounds'

const TOAST_VISIBLE_MS = 3000
const TOAST_FADE_MS = 400

function AchievementToast({ achievementId, soundEnabled, onDone }) {
  const achievement = ACHIEVEMENTS[achievementId]
  const [phase, setPhase] = useState('enter')
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!soundEnabled) return
    resumeAudio()
    playAchievementToastSound()
  }, [soundEnabled, achievementId])

  useEffect(() => {
    const hideTimer = window.setTimeout(() => setPhase('leave'), TOAST_VISIBLE_MS)
    const doneTimer = window.setTimeout(
      () => onDoneRef.current?.(),
      TOAST_VISIBLE_MS + TOAST_FADE_MS,
    )
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(doneTimer)
    }
  }, [achievementId])

  if (!achievement) return null

  return (
    <div
      className={`achievement-toast achievement-toast--${phase}`}
      role="status"
      aria-live="polite"
    >
      <span className="achievement-toast-stamp" aria-hidden="true">
        зачтено
      </span>
      <p className="achievement-toast-kicker">⭐ Достижение открыто</p>
      <p className="achievement-toast-title">{achievement.title}</p>
      <p className="achievement-toast-desc">{achievement.description}</p>
    </div>
  )
}

export default AchievementToast
