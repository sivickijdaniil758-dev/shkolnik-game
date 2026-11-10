import { useCallback, useEffect, useRef, useState } from 'react'
import AchievementToast from './AchievementToast'

const MAX_VISIBLE = 2

function AchievementToasts({ queue, soundEnabled, onQueueConsumed }) {
  const [slots, setSlots] = useState([])
  const shownIdsRef = useRef(new Set())

  useEffect(() => {
    if (!queue.length) return
    const room = MAX_VISIBLE - slots.length
    if (room <= 0) return

    const activeIds = new Set(slots.map((slot) => slot.id))
    const nextIds = queue
      .filter((id) => !activeIds.has(id) && !shownIdsRef.current.has(id))
      .slice(0, room)
    if (!nextIds.length) return

    nextIds.forEach((id) => shownIdsRef.current.add(id))
    setSlots((prev) => [
      ...prev,
      ...nextIds.map((id) => ({
        id,
        key: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
    ])
    onQueueConsumed(nextIds)
  }, [queue, slots, onQueueConsumed])

  const handleDone = useCallback((key) => {
    setSlots((prev) => prev.filter((s) => s.key !== key))
  }, [])

  if (!slots.length) return null

  return (
    <div className="achievement-toasts" aria-label="Новые достижения">
      {slots.map((slot) => (
        <AchievementToast
          key={slot.key}
          achievementId={slot.id}
          soundEnabled={soundEnabled}
          onDone={() => handleDone(slot.key)}
        />
      ))}
    </div>
  )
}

export default AchievementToasts
