import { useCallback, useEffect, useRef, useState } from 'react'
import AchievementToast from './AchievementToast'

const MAX_VISIBLE = 2

function AchievementToasts({ queue, soundEnabled, screen, onQueueConsumed }) {
  const [slots, setSlots] = useState([])
  const shownIdsRef = useRef(new Set())
  const onQueueConsumedRef = useRef(onQueueConsumed)
  onQueueConsumedRef.current = onQueueConsumed

  useEffect(() => {
    setSlots([])
  }, [screen])

  useEffect(() => {
    if (!queue.length) return

    setSlots((prev) => {
      const room = MAX_VISIBLE - prev.length
      if (room <= 0) return prev

      const activeIds = new Set(prev.map((s) => s.id))
      const nextIds = queue
        .filter((id) => !activeIds.has(id) && !shownIdsRef.current.has(id))
        .slice(0, room)

      if (!nextIds.length) return prev

      nextIds.forEach((id) => shownIdsRef.current.add(id))
      onQueueConsumedRef.current(nextIds)

      const newSlots = nextIds.map((id) => ({
        id,
        key: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }))

      return [...prev, ...newSlots]
    })
  }, [queue, slots.length])

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
