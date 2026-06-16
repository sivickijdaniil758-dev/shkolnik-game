import { DEFAULT_ACHIEVEMENT_STATS } from '../data/achievements'
import { getDefaultPortraitId, normalizePortraitId } from '../data/characterPortraits'
import { DIFFICULTY_OPTIONS, getGradeSubjects } from '../data/questions'
import { HINTS_PER_CLASS } from './hintHelpers'
import { getMenuMusicVolume, readMenuMusicEnabled } from './music'
import {
  deleteSlot,
  getActiveSlot,
  migrateLegacySave,
  readAllSlotSummaries,
  readSlot,
  setActiveSlot,
  writeSlot,
} from './saveSlots'

export {
  deleteSlot,
  getActiveSlot,
  migrateLegacySave,
  readAllSlotSummaries,
  readSlot,
  setActiveSlot,
  writeSlot,
} from './saveSlots'

/** Прогресс прохождения года: предметы + финальный тест */
export function getYearProgress(grade, subjects, diaryEntry, screen, currentSubjectIndex) {
  const totalSteps = subjects.length + 1
  const passedSubjects = diaryEntry?.subjects?.length ?? 0
  const finalDone = Boolean(diaryEntry?.finalTest?.passed)

  let completed = passedSubjects
  if (finalDone) completed = totalSteps
  else if (screen === 'finalQuiz' || screen === 'finalResult') completed = subjects.length

  const inProgressBonus =
    screen === 'subjectQuiz' && currentSubjectIndex > passedSubjects ? 0.35 : 0

  const percent = Math.min(100, Math.round(((completed + inProgressBonus) / totalSteps) * 100))

  return {
    totalSteps,
    completedSubjects: passedSubjects,
    remainingSubjects: Math.max(0, subjects.length - passedSubjects),
    percent,
    label: `${passedSubjects}/${subjects.length} предметов`,
  }
}

export function createFreshHintState() {
  return {
    hintCopyLeft: HINTS_PER_CLASS.copy,
    hintNeighborLeft: HINTS_PER_CLASS.neighbor,
    hintHiddenIndices: [],
    hintShowAnswer: false,
  }
}

export function buildInitialAttemptsBySubject(grade) {
  return getGradeSubjects(grade).reduce((acc, subject) => {
    acc[subject] = 1
    return acc
  }, {})
}

export function createInitialGameState({
  screen = 'start',
  returnScreen = 'subjectQuiz',
  activeSaveSlot = null,
} = {}) {
  return {
    screen,
    difficulty: 'normal',
    soundEnabled: readMenuMusicEnabled(true),
    musicEnabled: true,
    musicVolume: getMenuMusicVolume(),
    playerName: '',
    playerGender: 'boy',
    playerPortraitId: getDefaultPortraitId('boy'),
    hasProgress: false,
    currentGrade: 1,
    currentSubjectIndex: 0,
    questionIndex: 0,
    mistakes: 0,
    timer: DIFFICULTY_OPTIONS.normal.seconds,
    attemptsByGradeSubject: { 1: buildInitialAttemptsBySubject(1) },
    selectedOption: null,
    lastSubjectResult: null,
    finalQuestionIndex: 0,
    finalMistakes: 0,
    finalTimer: DIFFICULTY_OPTIONS.normal.seconds,
    finalAttemptsByGrade: { 1: 1 },
    finalSelectedOption: null,
    lastFinalResult: null,
    isRepeatingYear: false,
    diary: [],
    unlockedAchievements: [],
    achievementUnlockedAt: {},
    achievementStats: { ...DEFAULT_ACHIEVEMENT_STATS },
    pendingNextGrade: null,
    pendingNewSubjects: [],
    pendingNewSubjectIndex: 0,
    promotionAnimationsSeen: [],
    newSubjectAnimationsSeen: [],
    returnScreen,
    menuOpen: false,
    settingsOpen: false,
    activeSaveSlot,
    ...createFreshHintState(),
  }
}

/** Поля, которые не пишутся в localStorage */
export function pickPersistedState(state) {
  const {
    menuOpen: _menuOpen,
    settingsOpen: _settingsOpen,
    pendingNextGrade: _pendingNextGrade,
    pendingNewSubjects: _pendingNewSubjects,
    pendingNewSubjectIndex: _pendingNewSubjectIndex,
    returnScreen: _returnScreen,
    selectedOption: _selectedOption,
    finalSelectedOption: _finalSelectedOption,
    lastSubjectResult: _lastSubjectResult,
    lastFinalResult: _lastFinalResult,
    activeSaveSlot: _activeSaveSlot,
    ...persisted
  } = state
  return persisted
}

export function buildSlotSavePayload(gameState) {
  return {
    ...pickPersistedState(gameState),
    lastPlayedAt: new Date().toISOString(),
  }
}

export function persistGameState(gameState) {
  const { activeSaveSlot, hasProgress } = gameState
  if (!activeSaveSlot || !hasProgress) return false
  writeSlot(activeSaveSlot, buildSlotSavePayload(gameState))
  setActiveSlot(activeSaveSlot)
  return true
}

export function mergeSavedIntoState(prev, parsed, screen = 'start', activeSaveSlot = null) {
  return {
    ...prev,
    ...parsed,
    screen,
    activeSaveSlot: activeSaveSlot ?? prev.activeSaveSlot ?? null,
    menuOpen: false,
    settingsOpen: false,
    pendingNextGrade: null,
    pendingNewSubjects: [],
    pendingNewSubjectIndex: 0,
    soundEnabled: parsed.soundEnabled ?? readMenuMusicEnabled(true),
    musicEnabled: parsed.musicEnabled ?? true,
    musicVolume: parsed.musicVolume ?? getMenuMusicVolume(),
    playerName: parsed.playerName ?? '',
    playerGender: parsed.playerGender ?? 'boy',
    playerPortraitId: normalizePortraitId(
      parsed.playerGender ?? 'boy',
      parsed.playerPortraitId,
    ),
    unlockedAchievements: parsed.unlockedAchievements ?? [],
    achievementUnlockedAt: parsed.achievementUnlockedAt ?? {},
    achievementStats: {
      ...DEFAULT_ACHIEVEMENT_STATS,
      ...parsed.achievementStats,
    },
    hintCopyLeft: parsed.hintCopyLeft ?? HINTS_PER_CLASS.copy,
    hintNeighborLeft: parsed.hintNeighborLeft ?? HINTS_PER_CLASS.neighbor,
    hintHiddenIndices: [],
    hintShowAnswer: false,
    selectedOption: null,
    finalSelectedOption: null,
    lastSubjectResult: null,
    lastFinalResult: null,
    hasProgress: Boolean(parsed.hasProgress),
  }
}

export function characterDraftFromSave(parsed) {
  if (!parsed?.playerName) return null
  const gender = parsed.playerGender ?? 'boy'
  return {
    name: parsed.playerName,
    gender,
    portraitId: normalizePortraitId(gender, parsed.playerPortraitId),
  }
}

export function resolveContinueSlot(gameState) {
  return gameState.activeSaveSlot ?? getActiveSlot()
}

export function canContinueSlot(slot) {
  if (!slot) return false
  return Boolean(readSlot(slot)?.hasProgress)
}

export function loadStartupSave() {
  migrateLegacySave()
  const activeSlot = getActiveSlot()
  if (!activeSlot) {
    return { activeSlot: null, saved: null }
  }
  const saved = readSlot(activeSlot)
  if (!saved) {
    return { activeSlot: null, saved: null }
  }
  return { activeSlot, saved }
}

export function buildPlayStateFromSave(prev, saved, slot, screen) {
  const difficulty = saved.difficulty ?? prev.difficulty ?? 'normal'
  return {
    ...mergeSavedIntoState(prev, saved, screen, slot),
    hasProgress: true,
    menuOpen: false,
    timer: DIFFICULTY_OPTIONS[difficulty].seconds,
    finalTimer: DIFFICULTY_OPTIONS[difficulty].seconds,
  }
}
