import { useCallback, useRef } from 'react'
import { getPortraitsForGender } from '../data/characterPortraits'

function DossierStudentPhoto({ gender, portraitId, onPortraitChange, disabled = false }) {
  const portraits = getPortraitsForGender(gender)
  const index = Math.max(
    0,
    portraits.findIndex((p) => p.id === portraitId),
  )
  const current = portraits[index] ?? portraits[0]
  const touchStartX = useRef(null)

  const go = useCallback(
    (delta) => {
      if (disabled || portraits.length < 2) return
      const next = (index + delta + portraits.length) % portraits.length
      onPortraitChange(portraits[next].id)
    },
    [disabled, index, onPortraitChange, portraits],
  )

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e) => {
    if (touchStartX.current == null || disabled) return
    const endX = e.changedTouches[0]?.clientX
    if (endX == null) return
    const dx = endX - touchStartX.current
    if (dx > 42) go(-1)
    else if (dx < -42) go(1)
    touchStartX.current = null
  }

  return (
    <aside className="dossier-photo-col">
      <div
        className="dossier-photo-card"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span className="dossier-photo-clip" aria-hidden="true" />
        <div className="dossier-photo-frame">
          <img
            key={current.id}
            className="dossier-photo-img"
            src={current.image}
            alt=""
            draggable={false}
            decoding="async"
          />
          <span className="dossier-photo-tape" aria-hidden="true" />
        </div>
        <p className="dossier-photo-type dossier-hand">{current.label}</p>
      </div>

      <p className="dossier-photo-hint dossier-type">Выберите ученика ◀ ▶</p>

      <div className="dossier-photo-nav">
        <button
          type="button"
          className="dossier-photo-nav-btn dossier-hand"
          disabled={disabled}
          aria-label="Предыдущая фотография"
          onClick={() => go(-1)}
        >
          ◀︎
        </button>
        <span className="dossier-photo-counter dossier-type">
          {index + 1}/{portraits.length}
        </span>
        <button
          type="button"
          className="dossier-photo-nav-btn dossier-hand"
          disabled={disabled}
          aria-label="Следующая фотография"
          onClick={() => go(1)}
        >
          ▶︎
        </button>
      </div>
    </aside>
  )
}

export default DossierStudentPhoto
