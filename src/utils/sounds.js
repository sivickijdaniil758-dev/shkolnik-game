let audioContext = null

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function playTone({ frequency, duration = 0.12, type = 'sine', volume = 0.08, delay = 0, fade = true }) {
  const ctx = getContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = 0
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  const start = ctx.currentTime + delay
  const end = start + duration
  if (fade) {
    gain.gain.linearRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, end)
  } else {
    gain.gain.value = volume
  }
  oscillator.start(start)
  oscillator.stop(end + 0.02)
}

export function playCorrectSound() {
  playTone({ frequency: 587, duration: 0.08, volume: 0.07 })
  playTone({ frequency: 740, duration: 0.12, delay: 0.06, volume: 0.06 })
}

export function playWrongSound() {
  playTone({ frequency: 240, duration: 0.14, type: 'sine', volume: 0.042 })
  playTone({ frequency: 190, duration: 0.18, delay: 0.08, type: 'triangle', volume: 0.028 })
}

export function playNextSound() {
  playTone({ frequency: 330, duration: 0.05, volume: 0.04 })
}

export function playPageFlipSound() {
  playTone({ frequency: 120, duration: 0.06, type: 'triangle', volume: 0.05 })
  playTone({ frequency: 90, duration: 0.08, delay: 0.04, type: 'sine', volume: 0.04 })
}

export function playFiveSound() {
  playTone({ frequency: 523, duration: 0.1, volume: 0.07 })
  playTone({ frequency: 659, duration: 0.1, delay: 0.1, volume: 0.06 })
  playTone({ frequency: 784, duration: 0.18, delay: 0.2, volume: 0.06 })
}

export function resumeAudio() {
  const ctx = getContext()
  if (ctx.state === 'suspended') ctx.resume()
}

export function playChalkSound() {
  playTone({ frequency: 180, duration: 0.04, type: 'triangle', volume: 0.03, fade: true })
  playTone({ frequency: 240, duration: 0.05, delay: 0.02, type: 'sine', volume: 0.025 })
}

/** Лёгкий звук всплывающего достижения */
export function playAchievementToastSound() {
  playTone({ frequency: 523, duration: 0.09, type: 'sine', volume: 0.045 })
  playTone({ frequency: 659, duration: 0.11, delay: 0.08, type: 'sine', volume: 0.038 })
  playTone({ frequency: 784, duration: 0.14, delay: 0.16, type: 'triangle', volume: 0.03 })
}

/** Школьный звонок (достижение) */
export function playSchoolBellSound() {
  playTone({ frequency: 988, duration: 0.14, type: 'sine', volume: 0.07 })
  playTone({ frequency: 784, duration: 0.18, delay: 0.14, type: 'sine', volume: 0.06 })
  playTone({ frequency: 988, duration: 0.22, delay: 0.32, type: 'sine', volume: 0.055 })
}

/** Удар школьной печати */
export function playStampSound() {
  playTone({ frequency: 70, duration: 0.07, type: 'square', volume: 0.11, fade: false })
  playTone({ frequency: 110, duration: 0.05, delay: 0.03, type: 'triangle', volume: 0.07 })
  playTone({ frequency: 45, duration: 0.12, delay: 0.02, type: 'sine', volume: 0.09 })
}

/** Короткий звук ручки по бумаге */
export function playPenOnPaperSound() {
  const scratches = [0, 0.05, 0.1, 0.16, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7]
  scratches.forEach((delay, i) => {
    playTone({
      frequency: 240 + (i % 4) * 35 + Math.sin(i) * 20,
      duration: 0.028,
      type: 'triangle',
      volume: 0.032,
      delay,
    })
    playTone({
      frequency: 180 + (i % 3) * 25,
      duration: 0.022,
      type: 'sine',
      volume: 0.02,
      delay: delay + 0.015,
    })
  })
}

let ambienceInterval = null
let ambienceCtx = null

/** Тихая атмосфера школы на главном меню */
export function startMenuAmbience() {
  stopMenuAmbience()
  ambienceCtx = getContext()
  if (ambienceCtx.state === 'suspended') ambienceCtx.resume()

  ambienceInterval = window.setInterval(() => {
    const roll = Math.random()
    if (roll < 0.15) {
      playTone({ frequency: 90 + Math.random() * 40, duration: 0.08, type: 'triangle', volume: 0.018 })
    } else if (roll < 0.22) {
      playTone({ frequency: 880, duration: 0.2, type: 'sine', volume: 0.012 })
    } else if (roll < 0.28) {
      playPageFlipSound()
    }
  }, 2800)
}

export function stopMenuAmbience() {
  if (ambienceInterval) {
    window.clearInterval(ambienceInterval)
    ambienceInterval = null
  }
}
