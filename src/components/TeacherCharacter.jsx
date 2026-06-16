/** Учительница у доски — часть живого класса */
function TeacherCharacter({ mood = 'neutral' }) {
  return (
    <div className={`teacher-character teacher-${mood}`} aria-hidden="true">
      <div className="teacher-shadow" />
      <div className="teacher-body">
        <div className="teacher-head">
          <div className="teacher-hair" />
          <div className="teacher-face">
            <div className="teacher-glasses" />
            <div className="teacher-eyes">
              <span className="teacher-eye teacher-eye-left" />
              <span className="teacher-eye teacher-eye-right" />
            </div>
            <div className="teacher-mouth" />
          </div>
        </div>
        <div className="teacher-dress">
          <div className="teacher-blouse" />
          <div className="teacher-skirt" />
        </div>
        <div className="teacher-arm teacher-arm-board">
          <div className="teacher-hand" />
          {mood === 'writing' ? <div className="teacher-chalk-stick" /> : null}
        </div>
      </div>
      {mood === 'strict' ? <div className="teacher-aura strict-aura" /> : null}
      {mood === 'pleased' ? <div className="teacher-aura pleased-aura" /> : null}
    </div>
  )
}

export default TeacherCharacter
