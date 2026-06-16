import { useEffect, useMemo, useState } from 'react'
import ClassTeacherSignature from './ClassTeacherSignature'
import { NEW_SUBJECT_SCHEDULE_LINE, getNewSubjectDescription } from '../data/subjects'
import { pickClassTeacher } from '../utils/classTeachers'
import { playPenOnPaperSound, playSchoolBellSound, resumeAudio } from '../utils/sounds'

const INITIAL_DELAY_MS = 700
const SIGN_DURATION_MS = 1000
const STAMP_DELAY_MS = 450

function NewSubjectNotice({
  subject,
  grade,
  soundEnabled,
  skipAnimation = false,
  onAnimated,
  onContinue,
}) {
  const description = getNewSubjectDescription(subject)
  const teacher = useMemo(() => pickClassTeacher(subject), [subject])
  const [phase, setPhase] = useState(skipAnimation ? 'done' : 'enter')
  const [stampVisible, setStampVisible] = useState(skipAnimation)

  const signing = phase === 'signing'
  const signed = phase === 'signed' || phase === 'done'

  useEffect(() => {
    if (soundEnabled) {
      resumeAudio()
      playSchoolBellSound()
    }
  }, [subject, soundEnabled])

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
        setStampVisible(true)
        setPhase('done')
        onAnimated?.(`${grade}-${subject}`)
      }, INITIAL_DELAY_MS + SIGN_DURATION_MS + STAMP_DELAY_MS),
    )

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [skipAnimation, soundEnabled, onAnimated])

  return (
    <div className="new-subject-scene">
      <div className="promotion-vignette" aria-hidden="true" />
      <div className="new-subject-desk" aria-hidden="true">
        <div className="dossier-desk-surface promotion-desk-blur" />
        <span className="promotion-prop promotion-prop-notebook promotion-prop-blur" />
        <span className="dossier-prop dossier-prop-pen promotion-prop-blur" />
      </div>

      <article className="new-subject-sheet new-subject-sheet--ring">
        <div className="promotion-sheet-texture" aria-hidden="true" />
        <div className="promotion-sheet-margin" aria-hidden="true" />

        <div
          className={`new-subject-stamp-label ${stampVisible ? 'new-subject-stamp-label--visible' : ''}`}
          aria-hidden="true"
        >
          <span>Новый</span>
          <span>предмет</span>
        </div>

        <p className="new-subject-kicker promotion-type">Объявление в журнале</p>
        <h2 className="new-subject-title promotion-hand">{subject}</h2>

        <p className="new-subject-lead promotion-type">{NEW_SUBJECT_SCHEDULE_LINE}</p>
        <p className="new-subject-desc promotion-hand">{description}</p>

        <div className="new-subject-sign-block">
          <p className="new-subject-sign promotion-type">Классный руководитель</p>
          <ClassTeacherSignature signing={signing} signed={signed} teacher={teacher} />
          <p className="new-subject-sign-caption promotion-type">/ {teacher.name} /</p>
        </div>

        <button type="button" className="promotion-start-btn new-subject-btn" onClick={onContinue}>
          Продолжить
        </button>
      </article>
    </div>
  )
}

export default NewSubjectNotice
