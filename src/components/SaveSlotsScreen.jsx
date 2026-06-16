import { useState } from 'react'
import { getPortraitImage } from '../data/characterPortraits'
import { playChalkSound, playPageFlipSound, resumeAudio } from '../utils/sounds'

function formatAverageMark(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return value.toFixed(1).replace('.', ',')
}

function SaveSlotCard({
  summary,
  soundEnabled,
  onNewGame,
  onContinue,
  onRestart,
  onDelete,
}) {
  const { slot, empty } = summary

  const playFeedback = (chalk = true) => {
    if (!soundEnabled) return
    resumeAudio()
    if (chalk) playChalkSound()
    else playPageFlipSound()
  }

  const handle = (fn, chalk = true) => {
    playFeedback(chalk)
    fn(slot)
  }

  if (empty) {
    return (
      <li className="save-slots-list-item">
        <article className="save-slot-card save-slot-card--empty">
          <p className="save-slot-badge">Слот {slot}</p>
          <div className="save-slot-empty-body">
            <span className="save-slot-folder-icon" aria-hidden="true">
              📁
            </span>
            <p className="save-slot-empty-label">Пустое личное дело</p>
          </div>
          <button
            type="button"
            className="save-slot-btn save-slot-btn--primary"
            onClick={() => handle(onNewGame)}
          >
            Новая игра
          </button>
        </article>
      </li>
    )
  }

  const portraitSrc = getPortraitImage(summary.playerPortraitId)

  return (
    <li className="save-slots-list-item">
      <article className="save-slot-card save-slot-card--filled">
        <p className="save-slot-badge">Слот {slot}</p>

        <div className="save-slot-main">
          <div className="save-slot-portrait-wrap">
            <img
              className="save-slot-portrait"
              src={portraitSrc}
              alt=""
              draggable={false}
            />
          </div>

          <div className="save-slot-info">
            <p className="save-slot-name">{summary.playerName}</p>
            <p className="save-slot-meta">
              <span className="save-slot-meta-row">
                <span className="save-slot-meta-label">Класс</span>
                <span className="save-slot-meta-value">{summary.currentGrade}</span>
              </span>
              <span className="save-slot-meta-row">
                <span className="save-slot-meta-label">Средний балл</span>
                <span className="save-slot-meta-value">
                  {formatAverageMark(summary.averageMark)}
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="save-slot-actions">
          <button
            type="button"
            className="save-slot-btn save-slot-btn--primary"
            onClick={() => handle(onContinue)}
          >
            Продолжить
          </button>
          <button
            type="button"
            className="save-slot-btn"
            onClick={() => handle(onRestart, false)}
          >
            Начать заново
          </button>
          <button
            type="button"
            className="save-slot-btn save-slot-btn--danger"
            onClick={() => handle(onDelete, false)}
          >
            Удалить
          </button>
        </div>
      </article>
    </li>
  )
}

function SaveSlotsScreen({
  summaries,
  soundEnabled,
  onNewGame,
  onContinue,
  onRestart,
  onDelete,
  onBack,
}) {
  const [hoverBack, setHoverBack] = useState(false)

  const handleBack = () => {
    if (soundEnabled) {
      resumeAudio()
      playPageFlipSound()
    }
    onBack()
  }

  return (
    <div className="save-slots-scene">
      <div className="save-slots-desk" aria-hidden="true" />

      <div className="save-slots-journal panel-enter">
        <div className="save-slots-spine" aria-hidden="true" />

        <button
          type="button"
          className={`save-slots-back ${hoverBack ? 'save-slots-back--hover' : ''}`}
          onMouseEnter={() => setHoverBack(true)}
          onMouseLeave={() => setHoverBack(false)}
          onFocus={() => setHoverBack(true)}
          onBlur={() => setHoverBack(false)}
          onClick={handleBack}
        >
          ← В главное меню
        </button>

        <header className="save-slots-header">
          <p className="save-slots-print">Школа №127 · 2004</p>
          <h1 className="save-slots-heading">Личные дела</h1>
          <p className="save-slots-subtitle">Выберите сохранение</p>
        </header>

        <ul className="save-slots-list">
          {summaries.map((summary) => (
            <SaveSlotCard
              key={summary.slot}
              summary={summary}
              soundEnabled={soundEnabled}
              onNewGame={onNewGame}
              onContinue={onContinue}
              onRestart={onRestart}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SaveSlotsScreen
