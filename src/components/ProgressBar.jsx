function ProgressBar({ percent, label, remaining }) {
  return (
    <div className="year-progress">
      <div className="year-progress-header">
        <span className="progress-label">Прогресс года</span>
        <span className="progress-value">{label}</span>
      </div>
      <div className="year-progress-track">
        <div className="year-progress-glow" style={{ width: `${percent}%` }} />
        <div className="year-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="year-progress-note">До конца класса: {remaining} шаг(ов)</p>
    </div>
  )
}

export default ProgressBar
