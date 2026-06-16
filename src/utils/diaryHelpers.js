import { ACHIEVEMENTS } from '../data/achievements'
import { MAX_GRADE } from '../data/questions'

export const DIARY_PAGE_COVER = 0
export const DIARY_PAGE_DOSSIER = 1
export const DIARY_FIRST_GRADE_PAGE = 2
export const DIARY_PAGE_ACHIEVEMENTS = MAX_GRADE + 2
export const DIARY_TOTAL_PAGES = MAX_GRADE + 3

/** @deprecated используйте DIARY_PAGE_COVER */
export const DIARY_PAGE_TITLE = DIARY_PAGE_COVER

export function gradeToPageIndex(grade) {
  return Math.max(DIARY_FIRST_GRADE_PAGE, Math.min(DIARY_PAGE_ACHIEVEMENTS - 1, grade + 1))
}

export function pageIndexToGrade(pageIndex) {
  if (pageIndex >= DIARY_FIRST_GRADE_PAGE && pageIndex <= MAX_GRADE + 1) {
    return pageIndex - 1
  }
  return null
}

export function getPageKind(pageIndex) {
  if (pageIndex === DIARY_PAGE_COVER) return 'cover'
  if (pageIndex === DIARY_PAGE_DOSSIER) return 'dossier'
  if (pageIndex === DIARY_PAGE_ACHIEVEMENTS) return 'achievements'
  return 'grade'
}

export function getPageLabel(pageIndex) {
  const kind = getPageKind(pageIndex)
  if (kind === 'cover') return 'Обложка'
  if (kind === 'dossier') return 'Личное дело'
  if (kind === 'achievements') return 'Достижения'
  const grade = pageIndexToGrade(pageIndex)
  return grade ? `${grade} класс` : '—'
}

export function parseStudentName(fullName) {
  const trimmed = (fullName || '').trim()
  if (!trimmed) return { surname: '——', firstName: '——' }
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return { surname: parts[0], firstName: parts.slice(1).join(' ') }
  }
  return { surname: '——', firstName: trimmed }
}

export function schoolYearForGrade(grade) {
  const start = 2003 + grade
  const end = start + 1
  return `${start}–${end}`
}

export function admissionDateForGrade(currentGrade) {
  const year = 2003 + Math.max(1, currentGrade)
  return `01.09.${year}`
}

const MARK_TILTS = [-7, 4, -3, 6, -5, 2, -4, 5]

export function getMarkTilt(seed) {
  return MARK_TILTS[Math.abs(seed) % MARK_TILTS.length]
}

export function formatPlayTime(ms) {
  const totalMin = Math.floor((ms || 0) / 60000)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours > 0) return `${hours} ч ${mins} мин`
  if (mins > 0) return `${mins} мин`
  return 'только начал'
}

export function genderLabel(gender) {
  if (gender === 'girl') return 'девочка'
  if (gender === 'boy') return 'мальчик'
  return '—'
}

export function computeGradeStats(entry) {
  const empty = {
    averageMark: null,
    fives: 0,
    fours: 0,
    threes: 0,
    twos: 0,
    mistakes: 0,
    passedSubjects: [],
    markRows: [],
    hasData: false,
  }
  if (!entry) return empty

  const markRows = [...(entry.subjects || [])]
  if (entry.finalTest) {
    markRows.push({
      subject: 'Итоговая контрольная',
      mark: entry.finalTest.mark,
      mistakes: entry.finalTest.mistakes ?? 0,
    })
  }
  if (!markRows.length) return empty

  let fives = 0
  let fours = 0
  let threes = 0
  let twos = 0
  let mistakes = 0
  for (const row of markRows) {
    if (row.mark === 5) fives += 1
    else if (row.mark === 4) fours += 1
    else if (row.mark === 3) threes += 1
    else if (row.mark === 2) twos += 1
    mistakes += row.mistakes ?? 0
  }

  return {
    averageMark: entry.averageMark ?? null,
    fives,
    fours,
    threes,
    twos,
    mistakes,
    passedSubjects: (entry.subjects || []).map((s) => s.subject),
    markRows,
    hasData: true,
  }
}

export function getFavoriteSubject(diary) {
  const scores = {}
  for (const entry of diary) {
    for (const s of entry.subjects || []) {
      if (!scores[s.subject]) scores[s.subject] = { sum: 0, count: 0, fives: 0 }
      scores[s.subject].sum += s.mark
      scores[s.subject].count += 1
      if (s.mark === 5) scores[s.subject].fives += 1
    }
  }
  let best = null
  let bestScore = -1
  for (const [subject, data] of Object.entries(scores)) {
    const score = data.fives * 10 + data.sum / data.count
    if (score > bestScore) {
      bestScore = score
      best = subject
    }
  }
  return best ?? 'ещё не выбран'
}

export function getAchievementGradeHint(id) {
  if (id === 'first_grader') return 1
  if (id === 'grade_4_graduate') return 4
  if (id === 'grade_10_senior') return 10
  if (id === 'grade_11_graduate') return 11
  const m = id.match(/^grade_(\d+)$/)
  if (m) return Number(m[1])
  return null
}

export function getAchievementsForGradeYear(grade, entry, unlockedIds) {
  const ids = new Set()
  for (const id of unlockedIds) {
    if (getAchievementGradeHint(id) === grade) ids.add(id)
  }
  if (entry) {
    const subjects = entry.subjects || []
    if (unlockedIds.includes('math_genius') && subjects.some((s) => s.subject === 'Математика' && s.mark === 5)) {
      ids.add('math_genius')
    }
    if (unlockedIds.includes('russian_perfect') && subjects.some((s) => s.subject === 'Русский язык' && s.mark === 5)) {
      ids.add('russian_perfect')
    }
    if (unlockedIds.includes('perfect_grade') && subjects.length > 0 && subjects.every((s) => s.mark === 5)) {
      ids.add('perfect_grade')
    }
    if (unlockedIds.includes('excellent') && subjects.length > 0 && subjects.every((s) => s.mark >= 3)) {
      const finalOk = !entry.finalTest || entry.finalTest.mark >= 3
      if (finalOk) ids.add('excellent')
    }
    if (unlockedIds.includes('no_mistakes') && subjects.some((s) => s.mistakes === 0 && s.mark >= 4)) {
      ids.add('no_mistakes')
    }
  }
  return [...ids].filter((id) => ACHIEVEMENTS[id])
}

export function getGramotasForGrade(entry, achievementIds) {
  return achievementIds.filter((id) => {
    const t = ACHIEVEMENTS[id]?.rewardType
    return t === 'diploma' || t === 'diploma_gold' || t === 'praise' || t === 'thanks'
  })
}

export function getAchievementSticker(id) {
  const a = ACHIEVEMENTS[id]
  if (!a) return null
  return a
}
