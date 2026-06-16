function HintNotes({ copyLeft, neighborLeft, onCopy, onNeighbor, disabled }) {
  return (
    <div className="hint-notes" aria-label="Подсказки">
      <button
        type="button"
        className="hint-note hint-note-copy"
        disabled={disabled || copyLeft <= 0}
        title="Списать у отличника — показать правильный ответ"
        onClick={onCopy}
      >
        <span className="hint-note-emoji" aria-hidden="true">
          📝
        </span>
        <span className="hint-note-body">
          <span className="hint-note-title">Списать у отличника</span>
          <span className="hint-note-count">{copyLeft}</span>
        </span>
      </button>

      <button
        type="button"
        className="hint-note hint-note-neighbor"
        disabled={disabled || neighborLeft <= 0}
        title="Спросить соседа — убрать два неверных ответа"
        onClick={onNeighbor}
      >
        <span className="hint-note-emoji" aria-hidden="true">
          🤫
        </span>
        <span className="hint-note-body">
          <span className="hint-note-title">Спросить соседа</span>
          <span className="hint-note-count">{neighborLeft}</span>
        </span>
      </button>
    </div>
  )
}

export default HintNotes
