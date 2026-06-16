import { useEffect, useMemo, useState } from 'react'
import PromotionDirectorSignature from './PromotionDirectorSignature'
import { parseStudentName } from '../utils/diaryHelpers'
import { playPageFlipSound, playPenOnPaperSound, playStampSound, resumeAudio } from '../utils/sounds'

const INITIAL_DELAY_MS = 700
const SIGN_DURATION_MS = 1000
const STAMP_DELAY_MS = 500

function schoolYearLabel(grade) {
  const start = 2003 + grade
  const end = start + 1
  return `${start}/${String(end).slice(-2)} уч. г.`
}

function formatAverage(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return Number(value).toFixed(2)
}

function PromotionMark({ mark, seed = 0 }) {
  const tilt = ((seed * 7) % 11) - 5
  return (
    <span className="promotion-mark" style={{ transform: `rotate(${tilt}deg)` }}>
      {mark}
    </span>
  )
}

function GradeTransitionScreen({
  fromGrade,
  toGrade,
  playerName,
  gradeRecord,
  soundEnabled,
  skipAnimation = false,
  onAnimated,
  onContinue,
}) {
  const [phase, setPhase] = useState(skipAnimation ? 'stamped' : 'enter')
  const [stampVisible, setStampVisible] = useState(skipAnimation)
  const { surname, firstName } = useMemo(() => parseStudentName(playerName), [playerName])

  const subjects = gradeRecord?.subjects ?? []
  const finalTest = gradeRecord?.finalTest
  const averageMark = gradeRecord?.averageMark
  const hasGrades = subjects.length > 0

  const signing = phase === 'signing'
  const signed = phase === 'signed' || phase === 'stamped'

  useEffect(() => {
    if (skipAnimation) return undefined

    const timers = []

    timers.push(
      window.setTimeout(() => {
        if (soundEnabled) {
          resumeAudio()
          playPenOnPaperSound()
        }
        setPhase('signing')
      }, INITIAL_DELAY_MS),
    )

    timers.push(
      window.setTimeout(() => {
        setPhase('signed')
      }, INITIAL_DELAY_MS + SIGN_DURATION_MS),
    )

    timers.push(
      window.setTimeout(() => {
        if (soundEnabled) {
          resumeAudio()
          playStampSound()
        }
        setStampVisible(true)
        setPhase('stamped')
        onAnimated?.(fromGrade)
      }, INITIAL_DELAY_MS + SIGN_DURATION_MS + STAMP_DELAY_MS),
    )

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [skipAnimation, soundEnabled, fromGrade, onAnimated])

  const handleContinue = () => {
    if (phase === 'closing') return
    if (soundEnabled) {
      resumeAudio()
      playPageFlipSound()
    }
    setPhase('closing')
    window.setTimeout(onContinue, 520)
  }

  const stampLines =
    toGrade >= 11
      ? ['ВЫПУСК', 'ОКОНЧЕН']
      : ['ПЕРЕВЕДЁН', `В ${toGrade} КЛАСС`]

  return (
    <div className={`promotion-scene promotion-scene--${phase}`}>
      <div className="promotion-vignette" aria-hidden="true" />

      <div className="promotion-ambient dossier-ambient" aria-hidden="true">
        <div className="dossier-desk-surface promotion-desk-blur" />
        <div className="dossier-desk-glow" />
        <span className="dossier-prop dossier-prop-pen promotion-prop-blur" />
        <span className="dossier-prop dossier-prop-journal promotion-prop-blur" />
        <span className="dossier-prop dossier-prop-ink promotion-prop-blur" />
        <span className="promotion-prop promotion-prop-notebook promotion-prop-blur" />
        <span className="promotion-prop promotion-prop-notebook-b promotion-prop-blur" />
        <span className="promotion-prop promotion-prop-diary promotion-prop-blur" />
      </div>

      <div className="promotion-doc-wrap">
        <article className="promotion-sheet promotion-sheet--drop">
          <div className="promotion-sheet-texture" aria-hidden="true" />
          <div className="promotion-sheet-margin" aria-hidden="true" />

          <header className="promotion-header">
            <p className="promotion-org promotion-type">Муниципальное образовательное учреждение</p>
            <p className="promotion-org promotion-type promotion-org-school">
              «Средняя общеобразовательная школа № 1»
            </p>
            <h1 className="promotion-doc-title promotion-type">Табель успеваемости</h1>
            <p className="promotion-doc-sub promotion-type">Выписка о переводе в следующий класс</p>
          </header>

          <div className="promotion-meta promotion-type">
            <p>
              Ученик: <span className="promotion-hand">{surname} {firstName}</span>
            </p>
            <p>
              Класс: <span className="promotion-hand">{fromGrade}-А</span> ·{' '}
              {schoolYearLabel(fromGrade)}
            </p>
          </div>

          <section className="promotion-message">
            <p className="promotion-line promotion-type promotion-line-1">Учебный год завершён</p>
            <p className="promotion-line promotion-hand promotion-line-2">Поздравляем!</p>
            <p className="promotion-line promotion-type promotion-line-3">
              {toGrade >= 11 ? (
                <>Вы успешно завершили <strong>{fromGrade} класс</strong></>
              ) : (
                <>
                  Вы успешно переведены во{' '}
                  <strong className="promotion-grade-num">{toGrade} класс</strong>
                </>
              )}
            </p>
          </section>

          {hasGrades ? (
            <div className="promotion-grades-block">
              <p className="promotion-grades-caption promotion-type">Итоговые отметки</p>
              <table className="promotion-table">
                <thead>
                  <tr>
                    <th className="promotion-type">№</th>
                    <th className="promotion-type">Предмет</th>
                    <th className="promotion-type">Оценка</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((row, i) => (
                    <tr key={row.subject}>
                      <td className="promotion-type">{i + 1}</td>
                      <td className="promotion-hand promotion-subject">{row.subject}</td>
                      <td>
                        <PromotionMark mark={row.mark} seed={i + row.mark} />
                      </td>
                    </tr>
                  ))}
                  {finalTest ? (
                    <tr className="promotion-table-final">
                      <td className="promotion-type">{subjects.length + 1}</td>
                      <td className="promotion-hand">Итоговая контрольная</td>
                      <td>
                        <PromotionMark mark={finalTest.mark} seed={99} />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>

              {averageMark != null && averageMark > 0 ? (
                <p className="promotion-avg promotion-hand">
                  Средний балл:{' '}
                  <PromotionMark mark={Math.round(averageMark)} seed={fromGrade * 3} />
                  <span className="promotion-avg-num"> ({formatAverage(averageMark)})</span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="promotion-no-grades promotion-hand">Отметки за год зафиксированы в журнале.</p>
          )}

          <footer className="promotion-footer">
            <div className="promotion-signature">
              <p className="promotion-type">Директор школы</p>
              <PromotionDirectorSignature signing={signing} signed={signed} />
              <p className="promotion-sign-caption promotion-type">/ Сидорова Л.И. /</p>
              <p className="promotion-date promotion-type">«31» мая {2004 + fromGrade} г.</p>
            </div>
          </footer>

          {stampVisible ? (
            <div className="promotion-stamp" aria-hidden="true">
              <div className="promotion-stamp-ring">
                <span className="promotion-stamp-line">{stampLines[0]}</span>
                <span className="promotion-stamp-line">{stampLines[1]}</span>
              </div>
            </div>
          ) : null}
        </article>

        <button
          type="button"
          className="promotion-start-btn"
          onClick={handleContinue}
          disabled={phase === 'closing'}
        >
          {toGrade >= 11 ? 'Завершить учебный год' : `Начать ${toGrade} класс`}
        </button>
      </div>
    </div>
  )
}

export default GradeTransitionScreen
