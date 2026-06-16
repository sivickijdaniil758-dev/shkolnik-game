import Confetti from './Confetti'
import SceneBackdrop from './SceneBackdrop'

function FinalScreen({
  grade,
  passed,
  mistakes,
  totalQuestions,
  mark,
  attempt,
  maxAttempts,
  canRetry,
  onRetry,
  onRestartClass,
  onContinueToNextGrade,
}) {
  const excellent = passed && mark === 5

  return (
    <SceneBackdrop variant={passed ? 'success' : 'dramatic'}>
      <Confetti active={excellent} />
      <div className={`vn-panel result-panel panel-enter final-panel ${passed ? 'final-passed' : 'final-failed'} ${excellent ? 'final-excellent' : ''}`}>
        {passed ? (
          <>
            <div className="result-icon result-icon-win">🎓</div>
            <h2 className="result-title">Финальный тест сдан!</h2>
            <p className="result-subtitle">
              Правильных ответов: {totalQuestions - mistakes}/{totalQuestions}
            </p>
            <div className={`result-stamp stamp-mark-${mark} stamp-bounce`}>
              <span className="stamp-mark">{mark}</span>
            </div>
            <p className="result-subtitle">Готов перейти во {grade + 1} класс?</p>
            <button type="button" className="game-btn game-btn-primary" onClick={onContinueToNextGrade}>
              Продолжить →
            </button>
          </>
        ) : (
          <>
            <div className="result-icon result-icon-sad">📋</div>
            <h2 className="result-title">Финальный тест не сдан</h2>
            <div className={`result-stamp stamp-mark-${mark}`}>
              <span className="stamp-mark">{mark}</span>
            </div>
            <p className="result-subtitle">
              Правильных ответов: {totalQuestions - mistakes}/{totalQuestions}
            </p>
            <p className="result-subtitle">
              Попытка: {attempt}/{maxAttempts}
            </p>
            {canRetry ? (
              <button type="button" className="game-btn game-btn-primary" onClick={onRetry}>
                Пересдать финальный тест
              </button>
            ) : (
              <button type="button" className="game-btn game-btn-primary" onClick={onRestartClass}>
                Начать класс заново
              </button>
            )}
          </>
        )}
      </div>
    </SceneBackdrop>
  )
}

export default FinalScreen
