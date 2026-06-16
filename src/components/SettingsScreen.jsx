function SettingsScreen({
  difficulty,
  difficultyOptions,
  soundEnabled,
  musicEnabled,
  musicVolume = 20,
  onDifficultyChange,
  onToggleSound,
  onToggleMusic,
  onMusicVolumeChange,
  onResetProgress,
  onMainMenu,
  onClose,
}) {
  return (
    <div className="settings-journal-scene">
      <div className="settings-journal-desk" aria-hidden="true" />

      <div className="settings-journal panel-enter">
        <div className="journal-spine" aria-hidden="true" />
        <button type="button" className="journal-close" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <header className="journal-header">
          <p className="journal-print">Школа №127 · 2004</p>
          <h2 className="journal-title">Журнал класса</h2>
          <p className="journal-hand journal-subtitle">Записи ученика</p>
        </header>

        <section className="journal-section">
          <h3 className="journal-section-title">Сложность</h3>
          <ul className="journal-list">
            {Object.entries(difficultyOptions).map(([key, option]) => (
              <li key={key}>
                <button
                  type="button"
                  className={`journal-line-btn ${difficulty === key ? 'active' : ''}`}
                  onClick={() => onDifficultyChange(key)}
                >
                  <span className="journal-hand">{option.label}</span>
                  <span className="journal-note">— {option.seconds} сек. на вопрос</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="journal-section">
          <h3 className="journal-section-title">Звук</h3>
          <button
            type="button"
            className={`journal-sound-row ${soundEnabled ? '' : 'muted'}`}
            onClick={onToggleSound}
          >
            <span className={`journal-speaker ${soundEnabled ? '' : 'journal-speaker-off'}`}>
              🔊
            </span>
            <span className="journal-hand">{soundEnabled ? 'Включён' : 'Выключен'}</span>
          </button>
        </section>

        <section className="journal-section">
          <h3 className="journal-section-title">Музыка</h3>
          <button type="button" className="journal-sound-row" onClick={onToggleMusic}>
            <span className="journal-speaker">🎵</span>
            <span className="journal-hand">{musicEnabled ? 'Включена' : 'Выключена'}</span>
          </button>

          <div className="journal-volume-block">
            <label className="journal-volume-label" htmlFor="music-volume">
              <span className="journal-hand">Громкость музыки</span>
              <span className="journal-volume-value">{musicVolume}%</span>
            </label>
            <input
              id="music-volume"
              type="range"
              className="journal-volume-slider"
              min={0}
              max={100}
              step={1}
              value={musicVolume}
              disabled={!musicEnabled}
              onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
            />
          </div>
        </section>

        <footer className="journal-footer">
          <button type="button" className="journal-btn journal-btn-warn" onClick={onResetProgress}>
            Сбросить прогресс
          </button>
          {onMainMenu ? (
            <button type="button" className="journal-btn" onClick={onMainMenu}>
              Вернуться в меню
            </button>
          ) : (
            <button type="button" className="journal-btn" onClick={onClose}>
              К доске
            </button>
          )}
        </footer>

        <div className="journal-stamp" aria-hidden="true">
          МП
        </div>
      </div>
    </div>
  )
}

export default SettingsScreen
