function StudentAvatar({ mood, gender = 'boy' }) {
  return (
    <div className={`student-character student-${mood} student-gender-${gender}`}>
      <div className="student-seat-shadow" />
      <div className="student-body-wrap">
        {mood === 'panic' ? (
          <>
            <span className="sweat-drop sweat-left">💧</span>
            <span className="sweat-drop sweat-right">💧</span>
          </>
        ) : null}
        {mood === 'happy' ? <span className="emotion-spark spark-1">✨</span> : null}

        <div className="student-head-group">
          <div className="student-hair-back" />
          <div className="student-face">
            <div className="student-cheek student-cheek-left" />
            <div className="student-cheek student-cheek-right" />
            <div className="student-eyes">
              <span className="eye eye-left">
                <span className="eye-shine" />
              </span>
              <span className="eye eye-right">
                <span className="eye-shine" />
              </span>
            </div>
            <div className="student-eyebrows">
              <span className="brow brow-left" />
              <span className="brow brow-right" />
            </div>
            <div className="student-mouth" />
          </div>
          <div className="student-hair-front" />
        </div>

        <div className="student-torso-group">
          <div className="student-neck" />
          <div className="student-uniform">
            <div className="uniform-collar" />
            <div className="uniform-body" />
            <div className="uniform-badge">1</div>
          </div>
          <div className="student-arms">
            <div className="arm arm-left">
              <div className="hand hand-left" />
            </div>
            <div className="arm arm-right">
              <div className="hand hand-right" />
            </div>
          </div>
        </div>
      </div>

      <div className="student-desk-mini">
        <div className="desk-mini-top" />
      </div>
    </div>
  )
}

export default StudentAvatar
