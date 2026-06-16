const DIRECTOR_SIGNATURE_PATH =
  'M6,22 C12,10 20,28 30,18 S44,8 52,20 M56,18 L56,12 M64,24 C72,12 84,30 96,20 M102,16 C112,8 124,26 138,18 M144,16 L158,24 M164,12 C172,8 182,22 194,16 M198,18 L208,14'

function PromotionDirectorSignature({ signing, signed }) {
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
              d={DIRECTOR_SIGNATURE_PATH}
            />
          </svg>
        </span>
      ) : (
        <span className="school-sign-placeholder promotion-type">________________</span>
      )}
    </div>
  )
}

export default PromotionDirectorSignature
