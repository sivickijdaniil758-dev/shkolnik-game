import { getSubjectIcon } from '../utils/chalkSubjectHelpers'

/** Название предмета сверху по центру экрана урока */
function ChalkSubject({ subject }) {
  if (!subject) return null

  const icon = getSubjectIcon(subject)

  return (
    <div className="chalk-subject-overlay" role="status" aria-label={`Урок: ${subject}`}>
      <div className="chalk-subject-badge">
        <span className="chalk-subject-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="chalk-subject-text">{subject}</span>
      </div>
    </div>
  )
}

export default ChalkSubject
