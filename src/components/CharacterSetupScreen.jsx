import { useEffect, useMemo, useState } from 'react'
import { normalizePortraitId } from '../data/characterPortraits'
import { playPageFlipSound, playStampSound, resumeAudio } from '../utils/sounds'
import DossierDirectorSignature from './DossierDirectorSignature'
import DossierStudentPhoto from './DossierStudentPhoto'

function randomCaseNumber() {
  return String(Math.floor(10000 + Math.random() * 89999))
}

const SIGN_DURATION_MS = 1050
const STAMP_DURATION_MS = 700
const CLOSE_DELAY_MS = 800

function CharacterSetupScreen({
  name,
  gender,
  portraitId,
  onNameChange,
  onGenderChange,
  onPortraitChange,
  onSubmit,
  onBack,
}) {
  const [phase, setPhase] = useState('enter')
  const [stampVisible, setStampVisible] = useState(false)
  const caseNumber = useMemo(() => randomCaseNumber(), [])
  const safePortraitId = normalizePortraitId(gender, portraitId)
  const canSubmit = name.trim().length >= 2
  const busy = phase === 'signing' || phase === 'stamping' || phase === 'closing'

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('form'), 80)
    return () => window.clearTimeout(t)
  }, [])

  const handleGender = (nextGender) => {
    onGenderChange(nextGender)
    onPortraitChange(normalizePortraitId(nextGender, portraitId))
  }

  const handleAccept = () => {
    if (!canSubmit || busy) return
    resumeAudio()
    setPhase('signing')

    window.setTimeout(() => {
      setPhase('stamping')
      playStampSound()
      setStampVisible(true)
    }, SIGN_DURATION_MS)

    window.setTimeout(() => {
      setPhase('closing')
    }, SIGN_DURATION_MS + STAMP_DURATION_MS)

    window.setTimeout(() => {
      playPageFlipSound()
      onSubmit()
    }, SIGN_DURATION_MS + STAMP_DURATION_MS + CLOSE_DELAY_MS)
  }

  return (
    <div className={`dossier-scene dossier-scene--${phase}`}>
      <div className="dossier-ambient" aria-hidden="true">
        <div className="dossier-desk-surface" />
        <div className="dossier-desk-glow" />
        <span className="dossier-prop dossier-prop-pen" />
        <span className="dossier-prop dossier-prop-journal" />
        <span className="dossier-prop dossier-prop-ink" />
      </div>

      <div className={`dossier-folder dossier-folder--drop dossier-folder--${phase}`}>
        <div className="dossier-folder-back" aria-hidden="true" />
        <div className="dossier-folder-cover" aria-hidden="true" />

        <article className="dossier-paper">
          <div className="dossier-paper-edge" aria-hidden="true" />

          <div className="dossier-layout">
            <div className="dossier-main">
              <header className="dossier-header">
                <h1 className="dossier-title-type">ЛИЧНОЕ ДЕЛО УЧЕНИКА</h1>
                <p className="dossier-school-type">ШКОЛА № 1</p>
              </header>

              <div className="dossier-meta">
                <p className="dossier-meta-line dossier-type">
                  Личное дело № <span className="dossier-case-num">{caseNumber}</span>
                </p>
                <p className="dossier-meta-line dossier-type">Дата поступления: 01.09.2005</p>
              </div>

              <div className="dossier-ink-smudge dossier-ink-smudge-1" aria-hidden="true" />
              <div className="dossier-ink-smudge dossier-ink-smudge-2" aria-hidden="true" />

              <div className="dossier-field">
                <span className="dossier-label dossier-type">Фамилия, имя ученика:</span>
                <div className="dossier-line-wrap">
                  <input
                    type="text"
                    className="dossier-hand-input"
                    value={name}
                    maxLength={24}
                    disabled={busy}
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    placeholder="Например: Иванов Иван"
                    aria-label="Фамилия, имя ученика"
                    onChange={(e) => onNameChange(e.target.value)}
                  />
                  <span className="dossier-line-rule" aria-hidden="true" />
                </div>
                <p className="dossier-enroll-hint dossier-type">
                  Заполните личное дело для поступления в школу №1
                </p>
              </div>

              <div className="dossier-field dossier-field-gender">
                <span className="dossier-label dossier-type">Пол:</span>
                <div className="dossier-gender-list">
                  <button
                    type="button"
                    className="dossier-gender-option"
                    disabled={busy}
                    aria-pressed={gender === 'boy'}
                    onClick={() => handleGender('boy')}
                  >
                    <span className="dossier-radio-mark">{gender === 'boy' ? '✗' : '○'}</span>
                    <span className="dossier-hand">Мальчик</span>
                  </button>
                  <button
                    type="button"
                    className="dossier-gender-option"
                    disabled={busy}
                    aria-pressed={gender === 'girl'}
                    onClick={() => handleGender('girl')}
                  >
                    <span className="dossier-radio-mark">{gender === 'girl' ? '✗' : '○'}</span>
                    <span className="dossier-hand">Девочка</span>
                  </button>
                </div>
              </div>

              <p className="dossier-note dossier-type">
                После заполнения личного дела ученик будет зачислен в 1-А класс
              </p>

              <DossierDirectorSignature phase={phase} />
            </div>

            <DossierStudentPhoto
              gender={gender}
              portraitId={safePortraitId}
              disabled={busy}
              onPortraitChange={onPortraitChange}
            />
          </div>

          {stampVisible ? (
            <div className="dossier-stamp-mark" aria-hidden="true">
              <span className="dossier-stamp-mark-title">ЗАЧИСЛЕН</span>
              <span className="dossier-stamp-mark-sub">в 1 класс</span>
            </div>
          ) : null}

          <div className={`dossier-stamp-area ${busy ? 'dossier-stamp-area--busy' : ''}`}>
            {!busy ? (
              <p className="dossier-stamp-hint dossier-type">
                {canSubmit ? 'Поставить печать для зачисления' : 'Сначала введите имя ученика'}
              </p>
            ) : null}
            <button
              type="button"
              className="dossier-stamp-btn"
              disabled={!canSubmit || busy}
              aria-label="Принять в школу — поставить печать"
              onClick={handleAccept}
            >
              <span className="dossier-stamp-btn-text">ПРИНЯТ</span>
              <span className="dossier-stamp-btn-text dossier-stamp-btn-text-sub">В ШКОЛУ</span>
            </button>
          </div>
        </article>
      </div>

      <button
        type="button"
        className="dossier-back dossier-hand"
        disabled={busy}
        onClick={onBack}
      >
        ← Вернуться
      </button>
    </div>
  )
}

export default CharacterSetupScreen
