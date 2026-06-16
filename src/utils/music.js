import menuThemeUrl from '../assets/audio/menu-theme.mp3'

/** Фоновая музыка меню — HTML Audio API, один экземпляр на всю сессию */

const MENU_START_SEC = 3
const DEFAULT_VOLUME_PERCENT = 20
const SOUND_MUTE_STORAGE_KEY = 'schoolboy-menu-music-enabled'
const VOLUME_STORAGE_KEY = 'schoolboy-menu-music-volume'

let menuAudio = null
let menuHasStarted = false
let pausedForGameplay = false
let menuVolumePercent = DEFAULT_VOLUME_PERCENT
let menuMuted = true

/** @deprecated Web Audio — больше не используется для экранов */
let audioContext = null
let melodyTimer = null
let padNodes = null

export function readMenuMusicEnabled(fallback = true) {
  try {
    const raw = localStorage.getItem(SOUND_MUTE_STORAGE_KEY)
    if (raw === null) return fallback
    return raw === 'true'
  } catch {
    return fallback
  }
}

export function writeMenuMusicEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_MUTE_STORAGE_KEY, String(enabled))
  } catch {
    /* ignore */
  }
}

export function getMenuMusicVolume() {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (raw === null) return DEFAULT_VOLUME_PERCENT
    const value = Number(raw)
    if (!Number.isFinite(value)) return DEFAULT_VOLUME_PERCENT
    return Math.max(0, Math.min(100, Math.round(value)))
  } catch {
    return DEFAULT_VOLUME_PERCENT
  }
}

export function setMenuMusicVolume(percent) {
  menuVolumePercent = Math.max(0, Math.min(100, Math.round(percent)))
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(menuVolumePercent))
  } catch {
    /* ignore */
  }
  applyMenuVolume()
}

function initMenuState() {
  menuVolumePercent = getMenuMusicVolume()
  menuMuted = !readMenuMusicEnabled(true)
}

function getMenuAudio() {
  if (!menuAudio) {
    menuAudio = new Audio(menuThemeUrl)
    menuAudio.loop = true
    menuAudio.preload = 'auto'
    menuAudio.volume = 0
  }
  return menuAudio
}

function applyMenuVolume() {
  const audio = getMenuAudio()
  if (pausedForGameplay || menuMuted) {
    audio.volume = 0
    return
  }
  audio.volume = menuVolumePercent / 100
}

/** Экраны, где играет музыка меню */
export function isMenuMusicScreen(screen) {
  return ['start', 'settings', 'diary', 'achievements', 'characterSetup', 'saveSlots'].includes(screen)
}

/** Продолжить музыку на экранах меню (не сбрасывает позицию) */
export function resumeMenuMusicForMenuScreens() {
  const audio = getMenuAudio()
  if (!menuHasStarted) {
    audio.currentTime = MENU_START_SEC
    menuHasStarted = true
  }
  pausedForGameplay = false
  applyMenuVolume()
  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      /* autoplay до взаимодействия пользователя */
    })
  }
}

/** Пауза на время игрового процесса — currentTime сохраняется */
export function pauseMenuMusicForGameplay() {
  pausedForGameplay = true
  getMenuAudio().pause()
}

/** @deprecated используйте pauseMenuMusicForGameplay */
export function stopMenuMusicOnlyForGameplay() {
  pauseMenuMusicForGameplay()
}

/** @deprecated используйте resumeMenuMusicForMenuScreens */
export function startMenuMusic() {
  resumeMenuMusicForMenuScreens()
}

/** Mute кнопкой звука: трек идёт, volume = 0 */
export function muteMenuMusic() {
  menuMuted = true
  writeMenuMusicEnabled(false)
  applyMenuVolume()
  if (getMenuAudio().paused && !pausedForGameplay) {
    resumeMenuMusicForMenuScreens()
  }
}

/** Unmute кнопкой звука */
export function unmuteMenuMusic() {
  menuMuted = false
  writeMenuMusicEnabled(true)
  if (!pausedForGameplay) {
    applyMenuVolume()
    const audio = getMenuAudio()
    if (audio.paused) {
      resumeMenuMusicForMenuScreens()
    }
  }
}

function stopAllSynth() {
  if (melodyTimer) {
    window.clearTimeout(melodyTimer)
    window.clearInterval(melodyTimer)
    melodyTimer = null
  }
  if (padNodes?.oscillators) {
    padNodes.oscillators.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* stopped */
      }
    })
  }
  padNodes = null
}

export function stopSchoolMusic() {
  stopAllSynth()
}

export function resumeMusicContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

initMenuState()
