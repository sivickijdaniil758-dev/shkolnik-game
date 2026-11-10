import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import DocumentStamp from './DocumentStamp'
import { parseStudentName } from '../utils/diaryHelpers'
import { playPageFlipSound } from '../utils/sounds'

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
  const { surname, firstName } = useMemo(() => parseStudentName(playerName), [playerName])

  const subjects = gradeRecord?.subjects ?? []
  const finalTest = gradeRecord?.finalTest
  const averageMark = gradeRecord?.averageMark
  const hasGrades = subjects.length > 0

  const finishClosing = useEffectEvent(() => onContinue())
  useEffect(() => {
    if (phase !== 'closing') return undefined
    const timer = window.setTimeout(finishClosing, 350)
    return () => window.clearTimeout(timer)
  }, [phase])

  const handleContinue = () => {
    if (phase !== 'stamped') return
    if (soundEnabled) {
      playPageFlipSound()
    }
    setPhase('closing')
  }

  const stampLines =
    toGrade > 11
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
              {toGrade > 11 ? (
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
              <DocumentStamp complete={skipAnimation} soundEnabled={soundEnabled}
                label={stampLines.join(' ')} onComplete={() => {
                  setPhase('stamped')
                  onAnimated?.(fromGrade)
                }} />
              <p className="promotion-date promotion-type">«31» мая {2004 + fromGrade} г.</p>
            </div>
          </footer>

        </article>

        <button
          type="button"
          className="promotion-start-btn"
          onClick={handleContinue}
          disabled={phase !== 'stamped'}
        >
          {phase === 'enter' ? 'Ставим печать…' : toGrade > 11 ? 'Завершить учебный год' : `Начать ${toGrade} класс`}
        </button>
      </div>
    </div>
  )
}

export default GradeTransitionScreen
