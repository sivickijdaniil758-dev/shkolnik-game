/** Слоты сохранения (3 на устройство) */

export const SLOT_COUNT = 3

export const SLOT_KEYS = {
  1: 'schoolboy-save-slot-1',
  2: 'schoolboy-save-slot-2',
  3: 'schoolboy-save-slot-3',
}

export const ACTIVE_SLOT_KEY = 'schoolboy-active-save-slot'

const LEGACY_PROGRESS_KEYS = [
  'schoolboy-progress-v3',
  'schoolboy-progress-v2',
  'schoolboy-progress-v1',
]

export function getActiveSlot() {
  try {
    const raw = localStorage.getItem(ACTIVE_SLOT_KEY)
    const slot = Number(raw)
    if (slot >= 1 && slot <= SLOT_COUNT) return slot
  } catch {
    /* ignore */
  }
  return null
}

export function setActiveSlot(slot) {
  try {
    if (slot >= 1 && slot <= SLOT_COUNT) {
      localStorage.setItem(ACTIVE_SLOT_KEY, String(slot))
    } else {
      localStorage.removeItem(ACTIVE_SLOT_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function readSlot(slot) {
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot])
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeSlot(slot, data) {
  try {
    localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function deleteSlot(slot) {
  try {
    localStorage.removeItem(SLOT_KEYS[slot])
  } catch {
    /* ignore */
  }
  const active = getActiveSlot()
  if (active === slot) {
    setActiveSlot(null)
  }
}

export function hasAnySlotData() {
  for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
    const data = readSlot(slot)
    if (data?.hasProgress) return true
  }
  return false
}

export function computeOverallAverageMark(diary) {
  if (!Array.isArray(diary) || !diary.length) return null
  const withMarks = diary.filter(
    (entry) => entry.subjects?.length > 0 || entry.finalTest,
  )
  if (!withMarks.length) return null
  const sum = withMarks.reduce((acc, entry) => acc + (entry.averageMark || 0), 0)
  return sum / withMarks.length
}

export function formatLastPlayed(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function buildSlotSummary(slot, data) {
  if (!data?.hasProgress) {
    return { slot, empty: true }
  }
  return {
    slot,
    empty: false,
    playerName: data.playerName || 'Без имени',
    playerGender: data.playerGender ?? 'boy',
    playerPortraitId: data.playerPortraitId,
    currentGrade: data.currentGrade ?? 1,
    achievementCount: (data.unlockedAchievements || []).length,
    averageMark: computeOverallAverageMark(data.diary),
    lastPlayedAt: data.lastPlayedAt ?? null,
    lastPlayedLabel: formatLastPlayed(data.lastPlayedAt),
  }
}

export function readAllSlotSummaries() {
  const summaries = []
  for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
    summaries.push(buildSlotSummary(slot, readSlot(slot)))
  }
  return summaries
}

/** Перенос одиночного сохранения v1–v3 в слот 1 */
export function migrateLegacySave() {
  for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
    if (readSlot(slot)?.hasProgress) return false
  }

  for (const key of LEGACY_PROGRESS_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (!parsed?.hasProgress && !parsed?.playerName) {
        localStorage.removeItem(key)
        continue
      }
      writeSlot(1, {
        ...parsed,
        hasProgress: Boolean(parsed.hasProgress ?? parsed.playerName),
        lastPlayedAt: parsed.lastPlayedAt ?? new Date().toISOString(),
      })
      setActiveSlot(1)
      LEGACY_PROGRESS_KEYS.forEach((legacyKey) => localStorage.removeItem(legacyKey))
      return true
    } catch {
      localStorage.removeItem(key)
    }
  }
  return false
}

export function clearLegacyProgressKeys() {
  LEGACY_PROGRESS_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  })
}
