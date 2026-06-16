function ClassTeacherSignature({ signing, signed, teacher }) {
  const showSignature = signing || signed

  return (
    <div className="school-sign-area">
      <span className="school-sign-rule" aria-hidden="true" />
      {showSignature ? (
        <span className="school-signature-wrap">
          {signing ? <span className="school-pen-cursor" aria-hidden="true" /> : null}
          <svg
            className="school-signature-svg"
            viewBox="0 0 214 34"
            aria-hidden="true"
            role="presentation"
          >
            <path
              className={`school-signature-path ${signing ? 'school-signature-path--draw' : ''}`}
              d={teacher.path}
            />
          </svg>
        </span>
      ) : (
        <span className="school-sign-placeholder promotion-type">________________</span>
      )}
    </div>
  )
}

export default ClassTeacherSignature
