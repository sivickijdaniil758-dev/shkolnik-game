function DossierDirectorSignature({ phase }) {
  const signing = phase === 'signing'
  const signed = phase === 'stamping' || phase === 'closing'

  return (
    <div
      className={`dossier-sign-block ${signing ? 'dossier-sign-block--signing' : ''} ${signed ? 'dossier-sign-block--signed' : ''}`}
    >
      <p className="dossier-sign-line dossier-hand">
        Подпись директора:{' '}
        <span className="dossier-sign-area">
          {signing || signed ? (
            <span className="dossier-signature-wrap">
              {signing ? <span className="dossier-pen-cursor" aria-hidden="true" /> : null}
              <svg
                className="dossier-signature-svg"
                viewBox="0 0 220 40"
                aria-hidden="true"
                role="presentation"
              >
                <path
                  className={`dossier-signature-path ${signing ? 'dossier-signature-path--draw' : ''}`}
                  d="M4,26 C10,14 18,30 28,20 S42,8 54,22 M58,18 L58,12 M66,24 C74,10 88,28 102,18 M108,16 C118,8 128,26 142,20 M148,18 L162,26 M168,14 C176,10 184,24 196,18 M200,20 L212,16"
                />
              </svg>
            </span>
          ) : (
            <span className="dossier-sign-placeholder dossier-type">________________</span>
          )}
        </span>
      </p>
      <div className="dossier-faint-stamp" aria-hidden="true">
        <span>М.П.</span>
      </div>
    </div>
  )
}

export default DossierDirectorSignature
