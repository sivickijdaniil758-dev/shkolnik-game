import { ACHIEVEMENTS, ACHIEVEMENT_IDS, DEFAULT_ACHIEVEMENT_STATS } from '../data/achievements'
import { getGradeSubjects } from '../data/grades'
import { MAX_GRADE } from '../data/questions'

export function mergeAchievementStats(stats) {
  return { ...DEFAULT_ACHIEVEMENT_STATS, ...stats }
}

export function unlockAchievements(unlocked, checks) {
  const newlyUnlocked = []
  for (const id of checks) {
    if (!unlocked.includes(id) && ACHIEVEMENTS[id]) {
      newlyUnlocked.push(id)
    }
  }
  return newlyUnlocked
}

export function getSubjectAchievementChecks({
  mark,
  mistakes,
  grade,
  subject,
  diary,
  unlocked,
}) {
  const checks = []
  if (mark === 5 && !unlocked.includes('first_five')) checks.push('first_five')
  if (mistakes === 0) checks.push('no_mistakes')
  if (
    (subject === 'Математика' || subject === 'Алгебра и геометрия') &&
    mark === 5
  ) {
    checks.push('math_genius')
  }
  if (subject === 'Русский язык' && mark === 5) checks.push('russian_perfect')

  const entry = diary.find((d) => d.grade === grade)
  const subjects = getGradeSubjects(grade)
  if (entry && entry.subjects.length >= subjects.length) {
    const allGood = entry.subjects.every((s) => s.mark >= 4)
    if (allGood) checks.push('excellent')
    const allFive = entry.subjects.every((s) => s.mark === 5)
    if (allFive && entry.finalTest?.mark === 5) checks.push('perfect_grade')
  }
  return checks
}

export function getFinalAchievementChecks({ passed, grade, mark, unlocked }) {
  const checks = []
  if (passed) {
    checks.push('exam_passed')
    if (grade === 1 && !unlocked.includes('grade_2')) checks.push('grade_2')
    if (grade === 4) checks.push('grade_4_graduate')
    if (grade === 11) checks.push('grade_11_graduate')
  }
  if (mark === 2) checks.push('not_ready')
  return checks
}

export function getGradeReachedChecks(grade) {
  const checks = []
  if (grade >= 10) checks.push('grade_10_senior')
  return checks
}

export function getTwoStreakChecks(stats, mark) {
  const checks = []
  const s = mergeAchievementStats(stats)
  if (mark === 2) {
    if (s.consecutiveTwos >= 3) checks.push('parents_school')
    if (s.totalTwos >= 20) checks.push('two_collector')
  }
  return checks
}

export function getCorrectStreakChecks(stats) {
  const s = mergeAchievementStats(stats)
  if (s.consecutiveCorrect >= 5) return ['lucky_guess']
  return []
}

export function getMetaAchievementChecks(stats, unlocked) {
  const s = mergeAchievementStats(stats)
  const checks = []
  if (s.settingsOpens >= 100) checks.push('settings_hooligan')
  if (s.bellClicks >= 20) checks.push('bell_for_teacher')
  if (s.planeClicks >= 1) checks.push('paper_pilot')
  if (s.backpackClicks >= 1) checks.push('backpack_rummage')
  if (s.diaryMaxGradeViewed >= 11) checks.push('explorer')
  if (s.playTimeMs >= 5 * 60 * 60 * 1000) checks.push('school_lover')
  if (s.repeatYearCount >= 3) checks.push('eternal_repeater')

  const allExceptLegend = ACHIEVEMENT_IDS.filter((id) => id !== 'school_legend')
  if (allExceptLegend.every((id) => unlocked.includes(id))) {
    checks.push('school_legend')
  }
  return checks
}

export function collectAchievementChecks(state, event = {}) {
  const unlocked = state.unlockedAchievements ?? []
  const stats = mergeAchievementStats(state.achievementStats)
  let checks = []

  if (event.type === 'game_started') checks.push('first_grader')
  if (event.type === 'grade_reached') checks.push(...getGradeReachedChecks(event.grade))
  if (event.type === 'subject_result') {
    checks.push(
      ...getSubjectAchievementChecks({
        mark: event.mark,
        mistakes: event.mistakes,
        grade: event.grade,
        subject: event.subject,
        diary: event.diary ?? state.diary,
        unlocked,
      }),
    )
    checks.push(...getTwoStreakChecks(stats, event.mark))
  }
  if (event.type === 'final_result') {
    checks.push(
      ...getFinalAchievementChecks({
        passed: event.passed,
        grade: event.grade,
        mark: event.mark,
        unlocked,
      }),
    )
    checks.push(...getTwoStreakChecks(stats, event.mark))
  }
  if (event.type === 'correct_answer') {
    checks.push(...getCorrectStreakChecks(stats))
  }
  if (event.type === 'repeat_year') checks.push(...(stats.repeatYearCount >= 3 ? ['eternal_repeater'] : []))
  if (event.type === 'meta') checks.push(...getMetaAchievementChecks(stats, unlocked))

  return checks
}
