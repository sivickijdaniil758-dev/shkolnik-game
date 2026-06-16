import Confetti from './Confetti'
import SceneBackdrop from './SceneBackdrop'

function ResultScreen({
  grade,
  subject,
  mistakes,
  mark,
  attempt,
  maxAttempts,
  onContinue,
  onRetry,
  canRetry,
  showRepeatYear,
  onRestartClass,
}) {
  if (showRepeatYear) {
    return (
      <SceneBackdrop variant="dramatic">
        <div className="vn-panel result-panel panel-enter panel-repeat-year">
          <div className="result-icon result-icon-sad">😔</div>
          <h2 className="result-title">Ты остался на второй год</h2>
          <p className="result-subtitle">Попытки по предмету закончились. Нужно пройти весь класс заново.</p>
          <div className="result-notebook-closed" aria-hidden="true">
            <div className="closed-notebook" />
          </div>
          <button type="button" className="game-btn game-btn-primary" onClick={onRestartClass}>
            Начать класс заново
          </button>
        </div>
      </SceneBackdrop>
    )
  }

  const excellent = mark === 5
  const failed = mark === 2

  return (
    <SceneBackdrop variant={failed ? 'dramatic' : 'success'}>
      <Confetti active={excellent} />
      <div
        className={`vn-panel result-panel panel-enter ${excellent ? 'result-excellent' : ''} ${failed ? 'result-failed' : ''}`}
      >
        <div className={`result-stamp stamp-mark-${mark}`}>
          <span className="stamp-mark">{mark}</span>
        </div>

        <h2 className="result-title">{failed ? 'Нужна пересдача' : 'Предмет завершён!'}</h2>
        <p className="result-subtitle">{grade} класс · {subject}</p>

        <div className="result-stats glass-panel">
          <div className="result-stat">
            <span className="result-stat-label">Ошибки</span>
            <span className="result-stat-value">{mistakes}</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-label">Оценка</span>
            <span className={`mark-badge mark-${mark} mark-badge-lg`}>{mark}</span>
          </div>
          {failed ? (
            <div className="result-stat">
              <span className="result-stat-label">Попытка</span>
              <span className="result-stat-value">
                {attempt}/{maxAttempts}
              </span>
            </div>
          ) : null}
        </div>

        {failed ? (
          <>
            <p className="result-warning">Ты получил 2. Можно пересдать.</p>
            {canRetry ? (
              <button type="button" className="game-btn game-btn-primary" onClick={onRetry}>
                Пересдать
              </button>
            ) : null}
          </>
        ) : (
          <button type="button" className="game-btn game-btn-primary" onClick={onContinue}>
            Продолжить →
          </button>
        )}
      </div>
    </SceneBackdrop>
  )
}

export default ResultScreen
