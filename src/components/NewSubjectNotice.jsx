import { useState } from 'react'
import DocumentStamp from './DocumentStamp'
import { NEW_SUBJECT_SCHEDULE_LINE, getNewSubjectDescription } from '../data/subjects'
import { playPageFlipSound } from '../utils/sounds'

function NewSubjectNotice({
  subject,
  grade,
  soundEnabled,
  skipAnimation = false,
  onAnimated,
  onContinue,
}) {
  const description = getNewSubjectDescription(subject)
  const [phase, setPhase] = useState(skipAnimation ? 'done' : 'enter')

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
          className="new-subject-stamp-label new-subject-stamp-label--visible"
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
          <DocumentStamp complete={skipAnimation} soundEnabled={soundEnabled} label="ВКЛЮЧЕНО В РАСПИСАНИЕ"
            onComplete={() => {
              setPhase('done')
              onAnimated?.(`${grade}-${subject}`)
            }} />
        </div>

        <button type="button" className="promotion-start-btn new-subject-btn" disabled={phase !== 'done'} onClick={() => {
          if (soundEnabled) playPageFlipSound()
          onContinue()
        }}>
          {phase === 'done' ? 'Продолжить' : 'Ставим печать…'}
        </button>
      </article>
    </div>
  )
}

export default NewSubjectNotice
