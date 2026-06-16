import { useState } from 'react'
import mainMenuBg from '../assets/main-menu-bg.png'
import { playChalkSound, playPageFlipSound, resumeAudio } from '../utils/sounds'

const MENU_ITEMS = [
  { id: 'start', label: 'НАЧАТЬ ИГРУ', action: 'start' },
  { id: 'continue', label: 'ПРОДОЛЖИТЬ ИГРУ', action: 'continue' },
  { id: 'settings', label: 'НАСТРОЙКИ', action: 'settings' },
  { id: 'diary', label: 'ДНЕВНИК', action: 'diary' },
  { id: 'achievements', label: 'ДОСТИЖЕНИЯ', action: 'achievements' },
]

function StartScreen({
  hasProgress,
  soundEnabled,
  onToggleSound,
  onStartGame,
  onContinue,
  onOpenSettings,
  onOpenDiary,
  onOpenAchievements,
  onSecretBell,
  onSecretPlane,
  onSecretBackpack,
}) {
  const [hoverId, setHoverId] = useState(null)

  const playFeedback = (chalk = true) => {
    if (!soundEnabled) return
    resumeAudio()
    if (chalk) playChalkSound()
    else playPageFlipSound()
  }

  const handleMenu = (action) => {
    playFeedback(true)
    if (action === 'start') onStartGame()
    else if (action === 'continue') onContinue()
    else if (action === 'settings') onOpenSettings()
    else if (action === 'diary') onOpenDiary()
    else if (action === 'achievements') onOpenAchievements()
  }

  const handleSecret = (fn) => {
    playFeedback(false)
    fn()
  }

  return (
    <div className="main-menu">
      <img
        className="main-menu-bg"
        src={mainMenuBg}
        alt=""
        draggable={false}
        decoding="async"
      />

      <nav className="main-menu-chalk" aria-label="Главное меню">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`main-menu-chalk-btn ${hoverId === item.id ? 'main-menu-chalk-btn--hover' : ''}`}
            disabled={item.action === 'continue' && !hasProgress}
            onMouseEnter={() => setHoverId(item.id)}
            onMouseLeave={() => setHoverId(null)}
            onFocus={() => setHoverId(item.id)}
            onBlur={() => setHoverId(null)}
            onClick={() => handleMenu(item.action)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className={`main-menu-sound ${soundEnabled ? '' : 'main-menu-sound--off'}`}
        aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
        title={soundEnabled ? 'Звук включён' : 'Звук выключен'}
        onClick={() => {
          resumeAudio()
          onToggleSound?.()
        }}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      <button
        type="button"
        className="main-menu-secret main-menu-secret--bell"
        aria-label="Школьный звонок"
        onClick={() => handleSecret(onSecretBell)}
      />
      <button
        type="button"
        className="main-menu-secret main-menu-secret--plane"
        aria-label="Самолётик"
        onClick={() => handleSecret(onSecretPlane)}
      />
      <button
        type="button"
        className="main-menu-secret main-menu-secret--backpack"
        aria-label="Рюкзак"
        onClick={() => handleSecret(onSecretBackpack)}
      />
    </div>
  )
}

export default StartScreen
