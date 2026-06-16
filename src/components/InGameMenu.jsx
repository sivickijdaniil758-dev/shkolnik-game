function InGameMenu({
  open,
  onClose,
  onContinue,
  onDiary,
  onSettings,
  onMainMenu,
}) {
  if (!open) return null

  return (
    <div className="menu-overlay" onClick={onClose}>
      <div className="vn-panel menu-overlay-panel panel-enter" onClick={(e) => e.stopPropagation()}>
        <h3 className="menu-title">⏸ Меню</h3>
        <button type="button" className="game-btn game-btn-secondary" onClick={onContinue}>
          Продолжить
        </button>
        <button type="button" className="game-btn game-btn-secondary" onClick={onDiary}>
          📓 Дневник
        </button>
        <button type="button" className="game-btn game-btn-secondary" onClick={onSettings}>
          ⚙️ Настройки
        </button>
        <button type="button" className="game-btn game-btn-danger" onClick={onMainMenu}>
          Выйти в главное меню
        </button>
      </div>
    </div>
  )
}

export default InGameMenu
