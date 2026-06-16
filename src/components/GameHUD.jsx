import { getPortraitImage } from '../data/characterPortraits'

function GameHUD({
  grade,
  mistakes,
  timer,
  playerName,
  playerPortraitId,
  onOpenSettings,
}) {
  const portraitSrc = playerPortraitId ? getPortraitImage(playerPortraitId) : null
  const timerUrgent = timer <= 5

  return (
    <>
      <div className="game-hud-minimal">
        <div className="hud-stats-row">
          <div className="hud-pill hud-pill-name">
            {portraitSrc ? (
              <img className="hud-player-photo" src={portraitSrc} alt="" draggable={false} />
            ) : null}
            <span>{playerName || 'Ученик'}</span>
          </div>
          <div className="hud-pill hud-pill-class">
            <span>{grade}-А</span>
          </div>
          <div className={`hud-pill hud-pill-timer ${timerUrgent ? 'hud-urgent' : ''}`}>
            <span>⏱</span>
            <span>{timer}с</span>
          </div>
          <div className={`hud-pill ${mistakes > 0 ? 'hud-warn' : ''}`}>
            <span>❌</span>
            <span>{mistakes}</span>
          </div>
        </div>
      </div>

      <div className="hud-corner-controls">
        <button
          type="button"
          className="hud-corner-btn hud-corner-settings"
          onClick={onOpenSettings}
          aria-label="Настройки"
        >
          ⚙️
        </button>
      </div>
    </>
  )
}

export default GameHUD
