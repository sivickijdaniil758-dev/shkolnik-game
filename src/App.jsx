import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import FinalScreen from './components/FinalScreen'
import DiaryScreen from './components/DiaryScreen'
import GradeTransitionScreen from './components/GradeTransitionScreen'
import NewSubjectNotice from './components/NewSubjectNotice'
import InGameMenu from './components/InGameMenu'
import AchievementToasts from './components/AchievementToasts'
import AchievementsScreen from './components/AchievementsScreen'
import CharacterSetupScreen from './components/CharacterSetupScreen'
import { getDefaultPortraitId, normalizePortraitId } from './data/characterPortraits'
import SaveSlotsScreen from './components/SaveSlotsScreen'
import { DEFAULT_ACHIEVEMENT_STATS } from './data/achievements'
import {
  DIFFICULTY_OPTIONS,
  FINAL_TEST_MAX_ATTEMPTS,
  MAX_ATTEMPTS,
  MAX_GRADE,
  getFinalTestQuestions,
  getGradeSubjects,
  getFinalMarkByMistakes,
  getMarkByMistakes,
  getQuestionsForSubject,
  getNewSubjectsForGrade,
} from './data/questions'
import { getAnswerRevealDelay } from './utils/answerFeedback'
import { pickHiddenWrongIndices } from './utils/hintHelpers'
import {
  collectAchievementChecks,
  mergeAchievementStats,
  unlockAchievements,
} from './utils/achievementChecks'
import { getTeacherPhrase } from './utils/teacherPhrases'
import {
  playCorrectSound,
  playFiveSound,
  playNextSound,
  playPageFlipSound,
  playWrongSound,
  resumeAudio,
} from './utils/sounds'
import SettingsScreen from './components/SettingsScreen'
import {
  buildInitialAttemptsBySubject,
  buildPlayStateFromSave,
  canContinueSlot,
  characterDraftFromSave,
  createFreshHintState,
  createInitialGameState,
  deleteSlot,
  getActiveSlot,
  loadStartupSave,
  mergeSavedIntoState,
  persistGameState,
  readAllSlotSummaries,
  readSlot,
  resolveContinueSlot,
  setActiveSlot,
} from './utils/progress'
import {
  setMenuMusicVolume,
  muteMenuMusic,
  unmuteMenuMusic,
  pauseMenuMusicForGameplay,
  resumeMenuMusicForMenuScreens,
  isMenuMusicScreen,
  stopSchoolMusic,
  resumeMusicContext,
} from './utils/music'

const SCREENS = {
  start: 'start',
  characterSetup: 'characterSetup',
  settings: 'settings',
  diary: 'diary',
  subjectQuiz: 'subjectQuiz',
  subjectResult: 'subjectResult',
  finalQuiz: 'finalQuiz',
  finalResult: 'finalResult',
  gradeTransition: 'gradeTransition',
  newSubjectIntro: 'newSubjectIntro',
  achievements: 'achievements',
  saveSlots: 'saveSlots',
}

function getInitialGameState() {
  return createInitialGameState({
    screen: SCREENS.start,
    returnScreen: SCREENS.subjectQuiz,
  })
}

function freshHintState() {
  return createFreshHintState()
}

function App() {
  const [gameState, setGameState] = useState(getInitialGameState)
  const [characterDraft, setCharacterDraft] = useState({
    name: '',
    gender: 'boy',
    portraitId: getDefaultPortraitId('boy'),
  })
  const [uiState, setUiState] = useState({
    wrongAnimation: false,
    finalWrongAnimation: false,
    correctFlash: false,
    finalCorrectFlash: false,
    teacherPhrase: '',
    achievementQueue: [],
  })

  const [slotSummaries, setSlotSummaries] = useState(() => readAllSlotSummaries())

  const answeringRef = useRef(false)
  const processedSubjectKey = useRef('')
  const processedFinalKey = useRef('')

  const subjects = useMemo(
    () => getGradeSubjects(gameState.currentGrade, { introOrder: true }),
    [gameState.currentGrade],
  )
  const currentSubject = subjects[gameState.currentSubjectIndex]
  const currentQuestions = useMemo(() => {
    if (!currentSubject) return []
    return getQuestionsForSubject(gameState.currentGrade, currentSubject)
  }, [currentSubject, gameState.currentGrade])
  const currentQuestion = currentQuestions[gameState.questionIndex]
  const finalQuestions = getFinalTestQuestions(gameState.currentGrade)
  const finalQuestion = finalQuestions[gameState.finalQuestionIndex]

  const playIfEnabled = useCallback(
    (fn) => {
      if (gameState.soundEnabled) {
        resumeAudio()
        fn()
      }
    },
    [gameState.soundEnabled],
  )

  const queueAchievements = useCallback((ids) => {
    if (!ids.length) return
    setUiState((prev) => {
      const pending = new Set(prev.achievementQueue)
      const fresh = ids.filter((id) => !pending.has(id))
      if (!fresh.length) return prev
      return {
        ...prev,
        achievementQueue: [...prev.achievementQueue, ...fresh],
      }
    })
    const today = new Date().toLocaleDateString('ru-RU')
    setGameState((prev) => {
      const achievementUnlockedAt = { ...prev.achievementUnlockedAt }
      ids.forEach((id) => {
        if (!achievementUnlockedAt[id]) achievementUnlockedAt[id] = today
      })
      return {
        ...prev,
        unlockedAchievements: [...new Set([...prev.unlockedAchievements, ...ids])],
        achievementUnlockedAt,
      }
    })
  }, [])

  const applyAchievementEvent = useCallback(
    (event, statPatch = null) => {
      setGameState((prev) => {
        const achievementStats = mergeAchievementStats(prev.achievementStats)
        if (statPatch) {
          Object.assign(achievementStats, statPatch)
        }
        const checks = collectAchievementChecks({ ...prev, achievementStats }, event)
        const newIds = unlockAchievements(prev.unlockedAchievements, checks)
        if (newIds.length) {
          queueAchievements(newIds)
        }
        return { ...prev, achievementStats }
      })
    },
    [queueAchievements],
  )

  const consumeAchievementToasts = useCallback((ids) => {
    if (!ids.length) return
    setUiState((prev) => ({
      ...prev,
      achievementQueue: prev.achievementQueue.filter((id) => !ids.includes(id)),
    }))
  }, [])

  useEffect(() => {
    const { activeSlot, saved } = loadStartupSave()
    setSlotSummaries(readAllSlotSummaries())
    if (!activeSlot || !saved) return

    try {
      setGameState((prev) =>
        mergeSavedIntoState(prev, saved, SCREENS.start, activeSlot),
      )
      const draft = characterDraftFromSave(saved)
      if (draft) setCharacterDraft(draft)
    } catch {
      deleteSlot(activeSlot)
      setSlotSummaries(readAllSlotSummaries())
    }
  }, [])

  useEffect(() => {
    const { screen, musicEnabled } = gameState
    stopSchoolMusic()

    if (!musicEnabled || !isMenuMusicScreen(screen)) {
      pauseMenuMusicForGameplay()
      return undefined
    }

    resumeMenuMusicForMenuScreens()
    return undefined
  }, [gameState.screen, gameState.musicEnabled])

  useEffect(() => {
    setMenuMusicVolume(gameState.musicVolume)
  }, [gameState.musicVolume])

  useEffect(() => {
    if (!gameState.musicEnabled) return undefined
    if (gameState.soundEnabled) {
      unmuteMenuMusic()
    } else {
      muteMenuMusic()
    }
    return undefined
  }, [gameState.soundEnabled, gameState.musicEnabled])

  useEffect(() => {
    document.title = `Школьник — ${gameState.currentGrade} класс`
  }, [gameState.currentGrade])

  useEffect(() => {
    persistGameState(gameState)
  }, [gameState])

  useEffect(() => {
    if (gameState.screen === SCREENS.start || gameState.screen === SCREENS.saveSlots) {
      setSlotSummaries(readAllSlotSummaries())
    }
  }, [gameState.screen])

  const upsertDiarySubject = (diary, grade, subjectData) => {
    const nextDiary = [...diary]
    const gradeIndex = nextDiary.findIndex((entry) => entry.grade === grade)
    const gradeEntry =
      gradeIndex >= 0
        ? { ...nextDiary[gradeIndex] }
        : { grade, subjects: [], finalTest: null, averageMark: 0 }
    const subjectsCopy = [...gradeEntry.subjects]
    const subjectIndex = subjectsCopy.findIndex((item) => item.subject === subjectData.subject)
    if (subjectIndex >= 0) subjectsCopy[subjectIndex] = subjectData
    else subjectsCopy.push(subjectData)
    gradeEntry.subjects = subjectsCopy
    const marks = subjectsCopy.map((item) => item.mark)
    gradeEntry.averageMark =
      marks.length > 0 ? marks.reduce((sum, mark) => sum + mark, 0) / marks.length : 0
    if (gradeIndex >= 0) nextDiary[gradeIndex] = gradeEntry
    else nextDiary.push(gradeEntry)
    return nextDiary
  }

  const upsertDiaryFinalInState = (diary, grade, finalData) => {
    const nextDiary = [...diary]
    const gradeIndex = nextDiary.findIndex((entry) => entry.grade === grade)
    if (gradeIndex < 0) return diary
    const gradeEntry = { ...nextDiary[gradeIndex] }
    gradeEntry.finalTest = finalData
    const marks = [...gradeEntry.subjects.map((item) => item.mark), finalData.mark]
    gradeEntry.averageMark = marks.reduce((sum, mark) => sum + mark, 0) / marks.length
    nextDiary[gradeIndex] = gradeEntry
    return nextDiary
  }

  useEffect(() => {
    if (gameState.screen !== SCREENS.subjectQuiz || gameState.selectedOption || answeringRef.current) return
    const timerId = window.setTimeout(() => {
      if (gameState.timer <= 1) answerSubjectQuestion(-1, true)
      else setGameState((prev) => ({ ...prev, timer: prev.timer - 1 }))
    }, 1000)
    return () => window.clearTimeout(timerId)
  }, [gameState.screen, gameState.timer, gameState.selectedOption])

  useEffect(() => {
    if (gameState.screen !== SCREENS.finalQuiz || gameState.finalSelectedOption || answeringRef.current) return
    const timerId = window.setTimeout(() => {
      if (gameState.finalTimer <= 1) answerFinalQuestion(-1, true)
      else setGameState((prev) => ({ ...prev, finalTimer: prev.finalTimer - 1 }))
    }, 1000)
    return () => window.clearTimeout(timerId)
  }, [gameState.screen, gameState.finalTimer, gameState.finalSelectedOption])

  useEffect(() => {
    const id = window.setInterval(() => {
      setGameState((prev) => {
        const achievementStats = mergeAchievementStats(prev.achievementStats)
        achievementStats.playTimeMs += 1000
        const checks = collectAchievementChecks(
          { ...prev, achievementStats },
          { type: 'meta' },
        )
        const newIds = unlockAchievements(prev.unlockedAchievements, checks)
        if (newIds.length) queueAchievements(newIds)
        return { ...prev, achievementStats }
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [queueAchievements])

  useEffect(() => {
    const result = gameState.lastSubjectResult
    if (!result) return
    const key = `${result.grade}-${result.subject}-${result.attempt}`
    if (processedSubjectKey.current === key) return
    processedSubjectKey.current = key

    setGameState((prev) => {
      const achievementStats = mergeAchievementStats(prev.achievementStats)
      if (result.mark === 2) {
        achievementStats.totalTwos += 1
        achievementStats.consecutiveTwos += 1
      } else {
        achievementStats.consecutiveTwos = 0
      }
      if (result.isRepeatingYear) {
        achievementStats.repeatYearCount += 1
      }
      const checks = collectAchievementChecks(
        { ...prev, achievementStats, diary: prev.diary },
        {
          type: 'subject_result',
          mark: result.mark,
          mistakes: result.mistakes,
          grade: result.grade,
          subject: result.subject,
          diary: prev.diary,
        },
      )
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return { ...prev, achievementStats }
    })
  }, [gameState.lastSubjectResult, queueAchievements])

  useEffect(() => {
    const result = gameState.lastFinalResult
    if (!result) return
    const key = `${result.grade}-${result.attempt}-${result.passed}`
    if (processedFinalKey.current === key) return
    processedFinalKey.current = key

    setGameState((prev) => {
      const achievementStats = mergeAchievementStats(prev.achievementStats)
      if (result.mark === 2) {
        achievementStats.totalTwos += 1
        achievementStats.consecutiveTwos += 1
      } else {
        achievementStats.consecutiveTwos = 0
      }
      const checks = collectAchievementChecks(
        { ...prev, achievementStats },
        {
          type: 'final_result',
          passed: result.passed,
          grade: result.grade,
          mark: result.mark,
        },
      )
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return { ...prev, achievementStats }
    })
  }, [gameState.lastFinalResult, queueAchievements])

  const startOrContinueGame = () => {
    const activeSlot = resolveContinueSlot(gameState)
    const saved = activeSlot ? readSlot(activeSlot) : null
    if (saved?.hasProgress) {
      loadSlotAndPlay(activeSlot, saved)
      return
    }
    openSaveSlots()
  }

  const openSaveSlots = () => {
    setSlotSummaries(readAllSlotSummaries())
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.saveSlots,
      menuOpen: false,
      returnScreen: SCREENS.start,
    }))
  }

  const resetUiForNewSession = () => {
    setUiState({
      wrongAnimation: false,
      finalWrongAnimation: false,
      correctFlash: false,
      finalCorrectFlash: false,
      teacherPhrase: '',
      achievementQueue: [],
    })
  }

  const loadSlotAndPlay = (slot, saved = readSlot(slot)) => {
    if (!saved?.hasProgress) return
    setActiveSlot(slot)
    const draft = characterDraftFromSave(saved)
    if (draft) setCharacterDraft(draft)
    setGameState((prev) =>
      buildPlayStateFromSave(
        prev,
        saved,
        slot,
        saved.returnScreen ?? SCREENS.subjectQuiz,
      ),
    )
  }

  const beginNewGameInSlot = (slot) => {
    setActiveSlot(slot)
    setCharacterDraft({
      name: '',
      gender: 'boy',
      portraitId: getDefaultPortraitId('boy'),
    })
    resetUiForNewSession()
    setGameState(
      createInitialGameState({
        screen: SCREENS.characterSetup,
        returnScreen: SCREENS.saveSlots,
        activeSaveSlot: slot,
      }),
    )
  }

  const handleSlotNewGame = (slot) => {
    beginNewGameInSlot(slot)
  }

  const handleSlotContinue = (slot) => {
    loadSlotAndPlay(slot)
  }

  const handleSlotRestart = (slot) => {
    if (
      !window.confirm(
        'Вы точно хотите удалить это личное дело и начать заново?',
      )
    ) {
      return
    }
    deleteSlot(slot)
    setSlotSummaries(readAllSlotSummaries())
    beginNewGameInSlot(slot)
  }

  const handleSlotDelete = (slot) => {
    if (!window.confirm('Удалить это сохранение? Другие слоты не будут затронуты.')) return
    deleteSlot(slot)
    setSlotSummaries(readAllSlotSummaries())
    if (gameState.activeSaveSlot === slot) {
      setGameState({ ...getInitialGameState(), screen: SCREENS.saveSlots })
      setCharacterDraft({
        name: '',
        gender: 'boy',
        portraitId: getDefaultPortraitId('boy'),
      })
      resetUiForNewSession()
    }
  }

  const completeCharacterSetup = () => {
    const name = characterDraft.name.trim()
    const slot = gameState.activeSaveSlot
    setGameState({
      ...createInitialGameState({
        screen: SCREENS.subjectQuiz,
        returnScreen: SCREENS.subjectQuiz,
        activeSaveSlot: slot,
      }),
      hasProgress: true,
      playerName: name,
      playerGender: characterDraft.gender,
      playerPortraitId: normalizePortraitId(
        characterDraft.gender,
        characterDraft.portraitId,
      ),
      timer: DIFFICULTY_OPTIONS.normal.seconds,
      finalTimer: DIFFICULTY_OPTIONS.normal.seconds,
    })
    if (slot) setActiveSlot(slot)
    window.setTimeout(() => applyAchievementEvent({ type: 'game_started' }), 0)
  }

  const openSettings = () => {
    setGameState((prev) => {
      const achievementStats = mergeAchievementStats(prev.achievementStats)
      achievementStats.settingsOpens += 1
      const checks = collectAchievementChecks(
        { ...prev, achievementStats },
        { type: 'meta' },
      )
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return {
        ...prev,
        achievementStats,
        screen: SCREENS.settings,
        returnScreen: prev.screen === SCREENS.settings ? prev.returnScreen : prev.screen,
        menuOpen: false,
      }
    })
  }

  const openAchievements = () => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.achievements,
      returnScreen: prev.screen === SCREENS.achievements ? prev.returnScreen : prev.screen,
      menuOpen: false,
    }))
  }

  const bumpSecretStat = (key) => {
    setGameState((prev) => {
      const achievementStats = mergeAchievementStats(prev.achievementStats)
      achievementStats[key] = (achievementStats[key] || 0) + 1
      const checks = collectAchievementChecks(
        { ...prev, achievementStats },
        { type: 'meta' },
      )
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return { ...prev, achievementStats }
    })
  }

  const closeSettings = () => {
    setGameState((prev) => ({
      ...prev,
      screen: prev.returnScreen ?? SCREENS.start,
    }))
  }

  const resetProgressFromSettings = () => {
    const slot = gameState.activeSaveSlot
    if (!slot) {
      if (!window.confirm('Сбросить весь прогресс?')) return
      setGameState({ ...getInitialGameState(), screen: SCREENS.start })
      setCharacterDraft({
        name: '',
        gender: 'boy',
        portraitId: getDefaultPortraitId('boy'),
      })
      return
    }
    if (!window.confirm('Сбросить прогресс в текущем сохранении?')) return
    deleteSlot(slot)
    setSlotSummaries(readAllSlotSummaries())
    stopSchoolMusic()
    setGameState({ ...getInitialGameState(), screen: SCREENS.start })
    setCharacterDraft({
      name: '',
      gender: 'boy',
      portraitId: getDefaultPortraitId('boy'),
    })
    resetUiForNewSession()
  }

  const toggleMusic = () => {
    resumeMusicContext()
    setGameState((prev) => ({ ...prev, musicEnabled: !prev.musicEnabled }))
  }

  const activeQuizQuestion =
    gameState.screen === SCREENS.finalQuiz ? finalQuestion : currentQuestion

  const useHintCopy = () => {
    if (!activeQuizQuestion || gameState.selectedOption || gameState.finalSelectedOption) return
    if (gameState.hintCopyLeft <= 0) return
    setGameState((prev) => ({
      ...prev,
      hintCopyLeft: prev.hintCopyLeft - 1,
      hintShowAnswer: true,
      hintHiddenIndices: [],
    }))
  }

  const useHintNeighbor = () => {
    if (!activeQuizQuestion || gameState.selectedOption || gameState.finalSelectedOption) return
    if (gameState.hintNeighborLeft <= 0) return
    const hidden = pickHiddenWrongIndices(
      activeQuizQuestion.correctIndex,
      activeQuizQuestion.options.length,
    )
    setGameState((prev) => ({
      ...prev,
      hintNeighborLeft: prev.hintNeighborLeft - 1,
      hintHiddenIndices: hidden,
      hintShowAnswer: false,
    }))
  }

  const restartGrade = () => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.subjectQuiz,
      hasProgress: true,
      currentSubjectIndex: 0,
      questionIndex: 0,
      mistakes: 0,
      timer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
      selectedOption: null,
      finalQuestionIndex: 0,
      finalMistakes: 0,
      finalTimer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
      finalSelectedOption: null,
      lastFinalResult: null,
      isRepeatingYear: false,
      attemptsByGradeSubject: {
        ...prev.attemptsByGradeSubject,
        [prev.currentGrade]: buildInitialAttemptsBySubject(prev.currentGrade),
      },
      finalAttemptsByGrade: { ...prev.finalAttemptsByGrade, [prev.currentGrade]: 1 },
      diary: prev.diary.filter((entry) => entry.grade !== prev.currentGrade),
      ...freshHintState(),
    }))
    setUiState((prev) => ({ ...prev, teacherPhrase: '' }))
  }

  const answerSubjectQuestion = (optionIndex, timedOut = false) => {
    if (!currentQuestion || gameState.selectedOption || answeringRef.current) return
    answeringRef.current = true

    const isCorrect = !timedOut && optionIndex === currentQuestion.correctIndex
    const phrase = getTeacherPhrase(isCorrect, timedOut)

    setUiState((prev) => ({
      ...prev,
      teacherPhrase: phrase,
      wrongAnimation: !isCorrect,
      correctFlash: isCorrect,
    }))

    if (isCorrect) playIfEnabled(playCorrectSound)
    else playIfEnabled(playWrongSound)

    setGameState((prev) => {
      const achievementStats = mergeAchievementStats(prev.achievementStats)
      if (isCorrect) {
        achievementStats.consecutiveCorrect += 1
      } else {
        achievementStats.consecutiveCorrect = 0
      }
      const checks = isCorrect
        ? collectAchievementChecks(
            { ...prev, achievementStats },
            { type: 'correct_answer' },
          )
        : []
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return {
        ...prev,
        achievementStats,
        selectedOption: timedOut ? null : { index: optionIndex, state: isCorrect ? 'correct' : 'wrong' },
        mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      }
    })

    if (!isCorrect) {
      window.setTimeout(
        () => setUiState((prev) => ({ ...prev, wrongAnimation: false })),
        getAnswerRevealDelay(false),
      )
    }

    const revealMs = getAnswerRevealDelay(isCorrect)

    window.setTimeout(() => {
      playIfEnabled(playNextSound)
      setGameState((prev) => {
        const subjectQs = getQuestionsForSubject(prev.currentGrade, currentSubject)
        const isLastQuestion = prev.questionIndex + 1 >= subjectQs.length
        if (!isLastQuestion) {
          playIfEnabled(playPageFlipSound)
          answeringRef.current = false
          return {
            ...prev,
            questionIndex: prev.questionIndex + 1,
            timer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
            selectedOption: null,
            hintHiddenIndices: [],
            hintShowAnswer: false,
          }
        }

        const mark = getMarkByMistakes(prev.mistakes)
        const attempt = prev.attemptsByGradeSubject[prev.currentGrade]?.[currentSubject] ?? 1
        answeringRef.current = false

        if (mark === 5) playIfEnabled(playFiveSound)

        const isRepeatingYear = mark === 2 && attempt >= MAX_ATTEMPTS
        const result = {
          grade: prev.currentGrade,
          subject: currentSubject,
          mistakes: prev.mistakes,
          mark,
          attempt,
          isRepeatingYear,
        }

        const nextDiary =
          mark > 2
            ? upsertDiarySubject(prev.diary, prev.currentGrade, {
                subject: currentSubject,
                mark,
                mistakes: prev.mistakes,
                passedAttempt: attempt,
              })
            : prev.diary

        return {
          ...prev,
          screen: SCREENS.subjectResult,
          selectedOption: null,
          diary: nextDiary,
          isRepeatingYear,
          lastSubjectResult: result,
          returnScreen: SCREENS.subjectQuiz,
        }
      })
      setUiState((prev) => ({
        ...prev,
        teacherPhrase: '',
        wrongAnimation: false,
        correctFlash: false,
      }))
    }, revealMs)
  }

  const retrySubject = () => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.subjectQuiz,
      questionIndex: 0,
      mistakes: 0,
      timer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
      selectedOption: null,
      attemptsByGradeSubject: {
        ...prev.attemptsByGradeSubject,
        [prev.currentGrade]: {
          ...(prev.attemptsByGradeSubject[prev.currentGrade] ??
            buildInitialAttemptsBySubject(prev.currentGrade)),
          [currentSubject]:
            (prev.attemptsByGradeSubject[prev.currentGrade]?.[currentSubject] ?? 1) + 1,
        },
      },
    }))
  }

  const continueAfterSubject = () => {
    const nextSubjectIndex = gameState.currentSubjectIndex + 1
    if (nextSubjectIndex < subjects.length) {
      setGameState((prev) => ({
        ...prev,
        screen: SCREENS.subjectQuiz,
        currentSubjectIndex: nextSubjectIndex,
        questionIndex: 0,
        mistakes: 0,
        timer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
        selectedOption: null,
      }))
      return
    }
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.finalQuiz,
      finalQuestionIndex: 0,
      finalMistakes: 0,
      finalTimer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
      finalSelectedOption: null,
    }))
  }

  const answerFinalQuestion = (optionIndex, timedOut = false) => {
    if (!finalQuestion || gameState.finalSelectedOption || answeringRef.current) return
    answeringRef.current = true

    const isCorrect = !timedOut && optionIndex === finalQuestion.correctIndex
    const phrase = getTeacherPhrase(isCorrect, timedOut)

    setUiState((prev) => ({
      ...prev,
      teacherPhrase: phrase,
      finalWrongAnimation: !isCorrect,
      finalCorrectFlash: isCorrect,
    }))

    if (isCorrect) playIfEnabled(playCorrectSound)
    else playIfEnabled(playWrongSound)

    setGameState((prev) => ({
      ...prev,
      finalSelectedOption: timedOut ? null : { index: optionIndex, state: isCorrect ? 'correct' : 'wrong' },
      finalMistakes: isCorrect ? prev.finalMistakes : prev.finalMistakes + 1,
    }))

    const revealMs = getAnswerRevealDelay(isCorrect)

    if (!isCorrect) {
      window.setTimeout(
        () => setUiState((prev) => ({ ...prev, finalWrongAnimation: false })),
        revealMs,
      )
    }

    window.setTimeout(() => {
      playIfEnabled(playNextSound)
      setGameState((prev) => {
        const finals = getFinalTestQuestions(prev.currentGrade)
        const isLastQuestion = prev.finalQuestionIndex + 1 >= finals.length
        if (!isLastQuestion) {
          playIfEnabled(playPageFlipSound)
          answeringRef.current = false
          return {
            ...prev,
            finalQuestionIndex: prev.finalQuestionIndex + 1,
            finalTimer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
            finalSelectedOption: null,
            hintHiddenIndices: [],
            hintShowAnswer: false,
          }
        }

        const mark = getFinalMarkByMistakes(prev.finalMistakes)
        const attempt = prev.finalAttemptsByGrade[prev.currentGrade] ?? 1
        const passed = mark > 2

        if (mark === 5) playIfEnabled(playFiveSound)
        answeringRef.current = false

        const finalResult = {
          grade: prev.currentGrade,
          mistakes: prev.finalMistakes,
          mark,
          attempt,
          passed,
        }

        const nextDiary = upsertDiaryFinalInState(prev.diary, prev.currentGrade, {
          mark,
          mistakes: prev.finalMistakes,
          attempt,
          passed,
        })

        return {
          ...prev,
          screen: SCREENS.finalResult,
          finalSelectedOption: null,
          diary: nextDiary,
          lastFinalResult: finalResult,
        }
      })
      setUiState((prev) => ({
        ...prev,
        teacherPhrase: '',
        finalCorrectFlash: false,
        finalWrongAnimation: false,
      }))
    }, revealMs)
  }

  const retryFinal = () => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.finalQuiz,
      finalQuestionIndex: 0,
      finalMistakes: 0,
      finalTimer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
      finalSelectedOption: null,
      finalAttemptsByGrade: {
        ...prev.finalAttemptsByGrade,
        [prev.currentGrade]: (prev.finalAttemptsByGrade[prev.currentGrade] ?? 1) + 1,
      },
    }))
  }

  const goToGradeTransition = () => {
    const nextGrade =
      gameState.currentGrade >= MAX_GRADE
        ? MAX_GRADE + 1
        : gameState.currentGrade + 1
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.gradeTransition,
      pendingNextGrade: nextGrade,
    }))
  }

  const handlePromotionContinue = () => {
    const nextGrade = gameState.pendingNextGrade
    if (!nextGrade) {
      finishGradeTransition()
      return
    }
    const newSubjects = getNewSubjectsForGrade(nextGrade)
    if (newSubjects.length > 0) {
      setGameState((prev) => ({
        ...prev,
        screen: SCREENS.newSubjectIntro,
        pendingNewSubjects: newSubjects,
        pendingNewSubjectIndex: 0,
      }))
      return
    }
    finishGradeTransition()
  }

  const dismissNewSubjectNotice = () => {
    const queue = gameState.pendingNewSubjects ?? []
    const index = gameState.pendingNewSubjectIndex ?? 0
    if (index + 1 < queue.length) {
      setGameState((prev) => ({
        ...prev,
        pendingNewSubjectIndex: index + 1,
      }))
      return
    }
    finishGradeTransition()
  }

  const finishGradeTransition = () => {
    setGameState((prev) => {
      const nextGrade = prev.pendingNextGrade ?? Math.min(prev.currentGrade + 1, MAX_GRADE)

      if (nextGrade > MAX_GRADE) {
        return {
          ...prev,
          screen: SCREENS.start,
          pendingNextGrade: null,
          pendingNewSubjects: [],
          pendingNewSubjectIndex: 0,
          menuOpen: false,
          returnScreen: SCREENS.start,
        }
      }

      const achievementStats = mergeAchievementStats(prev.achievementStats)
      const checks = collectAchievementChecks(
        { ...prev, achievementStats },
        { type: 'grade_reached', grade: nextGrade },
      )
      const newIds = unlockAchievements(prev.unlockedAchievements, checks)
      if (newIds.length) queueAchievements(newIds)
      return {
        ...prev,
        screen: SCREENS.subjectQuiz,
        hasProgress: true,
        currentGrade: nextGrade,
        pendingNextGrade: null,
        pendingNewSubjects: [],
        pendingNewSubjectIndex: 0,
        currentSubjectIndex: 0,
        questionIndex: 0,
        mistakes: 0,
        timer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
        selectedOption: null,
        finalQuestionIndex: 0,
        finalMistakes: 0,
        finalTimer: DIFFICULTY_OPTIONS[prev.difficulty].seconds,
        finalSelectedOption: null,
        attemptsByGradeSubject: {
          ...prev.attemptsByGradeSubject,
          [nextGrade]:
            prev.attemptsByGradeSubject[nextGrade] ?? buildInitialAttemptsBySubject(nextGrade),
        },
        finalAttemptsByGrade: {
          ...prev.finalAttemptsByGrade,
          [nextGrade]: prev.finalAttemptsByGrade[nextGrade] ?? 1,
        },
        returnScreen: SCREENS.subjectQuiz,
        ...freshHintState(),
      }
    })
  }

  const openDiary = (returnTo) => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.diary,
      returnScreen: returnTo ?? prev.screen,
      menuOpen: false,
    }))
  }

  const goToMainMenu = () => {
    setGameState((prev) => ({
      ...prev,
      screen: SCREENS.start,
      menuOpen: false,
      settingsOpen: false,
      returnScreen: prev.screen,
    }))
  }

  const toggleSound = () => {
    resumeAudio()
    setGameState((prev) => {
      const soundEnabled = !prev.soundEnabled
      if (soundEnabled) unmuteMenuMusic()
      else muteMenuMusic()
      return { ...prev, soundEnabled }
    })
  }

  const currentSubjectResult = gameState.lastSubjectResult
  const canRetry =
    (gameState.attemptsByGradeSubject[gameState.currentGrade]?.[currentSubject] ?? 1) < MAX_ATTEMPTS
  const finalAttempt = gameState.finalAttemptsByGrade[gameState.currentGrade] ?? 1
  const canRetryFinal = finalAttempt < FINAL_TEST_MAX_ATTEMPTS
  const isPlaying =
    gameState.screen === SCREENS.subjectQuiz ||
    gameState.screen === SCREENS.finalQuiz ||
    gameState.screen === SCREENS.subjectResult ||
    gameState.screen === SCREENS.finalResult

  const canContinueActiveSlot = useMemo(
    () => canContinueSlot(resolveContinueSlot(gameState)),
    [gameState.activeSaveSlot, slotSummaries],
  )

  return (
    <div className="app-bg">
      {gameState.screen === SCREENS.start ? (
        <StartScreen
          hasProgress={canContinueActiveSlot}
          soundEnabled={gameState.soundEnabled}
          onToggleSound={toggleSound}
          onStartGame={openSaveSlots}
          onContinue={startOrContinueGame}
          onOpenDiary={() => openDiary(SCREENS.start)}
          onOpenSettings={openSettings}
          onOpenAchievements={openAchievements}
          onSecretBell={() => bumpSecretStat('bellClicks')}
          onSecretPlane={() => bumpSecretStat('planeClicks')}
          onSecretBackpack={() => bumpSecretStat('backpackClicks')}
        />
      ) : null}

      {gameState.screen === SCREENS.saveSlots ? (
        <SaveSlotsScreen
          summaries={slotSummaries}
          soundEnabled={gameState.soundEnabled}
          onNewGame={handleSlotNewGame}
          onContinue={handleSlotContinue}
          onRestart={handleSlotRestart}
          onDelete={handleSlotDelete}
          onBack={() =>
            setGameState((prev) => ({
              ...prev,
              screen: SCREENS.start,
            }))
          }
        />
      ) : null}

      {gameState.screen === SCREENS.achievements ? (
        <AchievementsScreen
          unlockedAchievements={gameState.unlockedAchievements}
          achievementUnlockedAt={gameState.achievementUnlockedAt}
          playerName={gameState.playerName}
          onBack={() =>
            setGameState((prev) => ({
              ...prev,
              screen: prev.returnScreen ?? SCREENS.start,
            }))
          }
        />
      ) : null}

      {gameState.screen === SCREENS.characterSetup ? (
        <CharacterSetupScreen
          name={characterDraft.name}
          gender={characterDraft.gender}
          portraitId={characterDraft.portraitId}
          onNameChange={(name) => setCharacterDraft((d) => ({ ...d, name }))}
          onGenderChange={(gender) => setCharacterDraft((d) => ({ ...d, gender }))}
          onPortraitChange={(portraitId) => setCharacterDraft((d) => ({ ...d, portraitId }))}
          onSubmit={completeCharacterSetup}
          onBack={() =>
            setGameState((prev) => ({
              ...prev,
              screen: prev.returnScreen ?? SCREENS.start,
              activeSaveSlot: prev.hasProgress ? prev.activeSaveSlot : null,
            }))
          }
        />
      ) : null}

      {gameState.screen === SCREENS.settings ? (
        <SettingsScreen
          difficulty={gameState.difficulty}
          difficultyOptions={DIFFICULTY_OPTIONS}
          soundEnabled={gameState.soundEnabled}
          musicEnabled={gameState.musicEnabled}
          musicVolume={gameState.musicVolume}
          onDifficultyChange={(difficulty) =>
            setGameState((prev) => ({
              ...prev,
              difficulty,
              timer: DIFFICULTY_OPTIONS[difficulty].seconds,
              finalTimer: DIFFICULTY_OPTIONS[difficulty].seconds,
            }))
          }
          onToggleSound={toggleSound}
          onToggleMusic={toggleMusic}
          onMusicVolumeChange={(musicVolume) =>
            setGameState((prev) => ({ ...prev, musicVolume }))
          }
          onResetProgress={resetProgressFromSettings}
          onMainMenu={
            gameState.returnScreen &&
            gameState.returnScreen !== SCREENS.start &&
            gameState.returnScreen !== SCREENS.achievements
              ? goToMainMenu
              : closeSettings
          }
          onClose={closeSettings}
        />
      ) : null}

      {gameState.screen === SCREENS.diary ? (
        <DiaryScreen
          diary={gameState.diary}
          playerName={gameState.playerName}
          playerPortraitId={gameState.playerPortraitId}
          playerGender={gameState.playerGender}
          currentGrade={gameState.currentGrade}
          unlockedAchievements={gameState.unlockedAchievements}
          achievementStats={gameState.achievementStats}
          achievementUnlockedAt={gameState.achievementUnlockedAt}
          soundEnabled={gameState.soundEnabled}
          onDiaryPageView={(gradeNum) => {
            setGameState((prev) => {
              const achievementStats = mergeAchievementStats(prev.achievementStats)
              achievementStats.diaryMaxGradeViewed = Math.max(
                achievementStats.diaryMaxGradeViewed,
                gradeNum,
              )
              const checks = collectAchievementChecks(
                { ...prev, achievementStats },
                { type: 'meta' },
              )
              const newIds = unlockAchievements(prev.unlockedAchievements, checks)
              if (newIds.length) queueAchievements(newIds)
              return { ...prev, achievementStats }
            })
          }}
          onBack={() =>
            setGameState((prev) => ({
              ...prev,
              screen: prev.returnScreen ?? SCREENS.start,
            }))
          }
        />
      ) : null}

      {gameState.screen === SCREENS.gradeTransition && gameState.pendingNextGrade ? (
        <GradeTransitionScreen
          fromGrade={gameState.pendingNextGrade - 1}
          toGrade={gameState.pendingNextGrade}
          playerName={gameState.playerName}
          gradeRecord={gameState.diary.find(
            (entry) => entry.grade === gameState.pendingNextGrade - 1,
          )}
          soundEnabled={gameState.soundEnabled}
          skipAnimation={(gameState.promotionAnimationsSeen ?? []).includes(
            gameState.pendingNextGrade - 1,
          )}
          onAnimated={(grade) =>
            setGameState((prev) => ({
              ...prev,
              promotionAnimationsSeen: [
                ...new Set([...(prev.promotionAnimationsSeen ?? []), grade]),
              ],
            }))
          }
          onContinue={handlePromotionContinue}
        />
      ) : null}

      {gameState.screen === SCREENS.newSubjectIntro &&
      gameState.pendingNewSubjects?.length > 0 ? (
        <NewSubjectNotice
          subject={gameState.pendingNewSubjects[gameState.pendingNewSubjectIndex ?? 0]}
          grade={gameState.pendingNextGrade}
          soundEnabled={gameState.soundEnabled}
          skipAnimation={(gameState.newSubjectAnimationsSeen ?? []).includes(
            `${gameState.pendingNextGrade}-${gameState.pendingNewSubjects[gameState.pendingNewSubjectIndex ?? 0]}`,
          )}
          onAnimated={(key) =>
            setGameState((prev) => ({
              ...prev,
              newSubjectAnimationsSeen: [
                ...new Set([...(prev.newSubjectAnimationsSeen ?? []), key]),
              ],
            }))
          }
          onContinue={dismissNewSubjectNotice}
        />
      ) : null}

      {gameState.screen === SCREENS.subjectQuiz && currentQuestion ? (
        <GameScreen
          grade={gameState.currentGrade}
          subject={currentSubject}
          questionIndex={gameState.questionIndex}
          mistakes={gameState.mistakes}
          timer={gameState.timer}
          playerName={gameState.playerName}
          playerPortraitId={gameState.playerPortraitId}
          question={currentQuestion}
          selectedOption={gameState.selectedOption}
          isWrongAnimation={uiState.wrongAnimation}
          isCorrectFlash={uiState.correctFlash}
          teacherPhrase={uiState.teacherPhrase}
          hintCopyLeft={gameState.hintCopyLeft}
          hintNeighborLeft={gameState.hintNeighborLeft}
          hintHiddenIndices={gameState.hintHiddenIndices}
          hintShowAnswer={gameState.hintShowAnswer}
          onHintCopy={useHintCopy}
          onHintNeighbor={useHintNeighbor}
          onOpenSettings={openSettings}
          onAnswer={answerSubjectQuestion}
        />
      ) : null}

      {gameState.screen === SCREENS.subjectResult && currentSubjectResult ? (
        <ResultScreen
          grade={gameState.currentGrade}
          subject={currentSubjectResult.subject}
          mistakes={currentSubjectResult.mistakes}
          mark={currentSubjectResult.mark}
          attempt={currentSubjectResult.attempt}
          maxAttempts={MAX_ATTEMPTS}
          onContinue={continueAfterSubject}
          onRetry={retrySubject}
          canRetry={canRetry}
          showRepeatYear={gameState.isRepeatingYear}
          onRestartClass={restartGrade}
        />
      ) : null}

      {gameState.screen === SCREENS.finalQuiz && finalQuestion ? (
        <GameScreen
          grade={gameState.currentGrade}
          subject="Финальный тест"
          questionIndex={gameState.finalQuestionIndex}
          mistakes={gameState.finalMistakes}
          timer={gameState.finalTimer}
          playerName={gameState.playerName}
          playerPortraitId={gameState.playerPortraitId}
          question={finalQuestion}
          selectedOption={gameState.finalSelectedOption}
          isWrongAnimation={uiState.finalWrongAnimation}
          isCorrectFlash={uiState.finalCorrectFlash}
          teacherPhrase={uiState.teacherPhrase}
          hintCopyLeft={gameState.hintCopyLeft}
          hintNeighborLeft={gameState.hintNeighborLeft}
          hintHiddenIndices={gameState.hintHiddenIndices}
          hintShowAnswer={gameState.hintShowAnswer}
          onHintCopy={useHintCopy}
          onHintNeighbor={useHintNeighbor}
          onOpenSettings={openSettings}
          onAnswer={answerFinalQuestion}
        />
      ) : null}

      {gameState.screen === SCREENS.finalResult && gameState.lastFinalResult ? (
        <FinalScreen
          grade={gameState.currentGrade}
          passed={gameState.lastFinalResult.passed}
          mistakes={gameState.lastFinalResult.mistakes}
          totalQuestions={finalQuestions.length}
          mark={gameState.lastFinalResult.mark}
          attempt={gameState.lastFinalResult.attempt}
          maxAttempts={FINAL_TEST_MAX_ATTEMPTS}
          canRetry={canRetryFinal}
          onRetry={retryFinal}
          onRestartClass={restartGrade}
          onContinueToNextGrade={goToGradeTransition}
        />
      ) : null}

      <InGameMenu
        open={gameState.menuOpen && isPlaying}
        onClose={() => setGameState((prev) => ({ ...prev, menuOpen: false, settingsOpen: false }))}
        onContinue={() => setGameState((prev) => ({ ...prev, menuOpen: false }))}
        onDiary={() => openDiary(gameState.screen)}
        onSettings={openSettings}
        onMainMenu={goToMainMenu}
      />

      <AchievementToasts
        queue={uiState.achievementQueue}
        soundEnabled={gameState.soundEnabled}
        screen={gameState.screen}
        onQueueConsumed={consumeAchievementToasts}
      />
    </div>
  )
}

export default App
