let audioContext = null
let output = null
let enabled = true
const playing = new Set()

function stopEffects() {
  for (const source of playing) {
    try { source.stop() } catch { /* Already ended. */ }
  }
  playing.clear()
}

export function setEffectsEnabled(value) {
  enabled = Boolean(value)
  if (!enabled) stopEffects()
}

function getContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return null
    audioContext = new AudioContext()
    output = audioContext.createDynamicsCompressor()
    output.threshold.value = -18
    output.knee.value = 12
    output.ratio.value = 4
    output.attack.value = 0.003
    output.release.value = 0.15
    output.connect(audioContext.destination)
  }
  return audioContext
}

function playTone({ frequency, duration = 0.12, type = 'sine', volume = 0.08, delay = 0, fade = true }) {
  if (!enabled || document.hidden) return
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = 0
  oscillator.connect(gain)
  gain.connect(output)
  const start = ctx.currentTime + delay
  const end = start + duration
  gain.gain.setValueAtTime(0, start)
  if (fade) {
    gain.gain.linearRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, end)
  } else {
    gain.gain.linearRampToValueAtTime(volume, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.001, end)
  }
  playing.add(oscillator)
  oscillator.onended = () => {
    playing.delete(oscillator)
    oscillator.disconnect()
    gain.disconnect()
  }
  oscillator.start(start)
  oscillator.stop(end + 0.02)
}

// Filtered procedural noise gives paper and rubber a texture without sampled assets.
function playTexture({ duration, frequency, volume, delay = 0 }) {
  if (!enabled || document.hidden) return
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  const source = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1
  source.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = 0.65
  const gain = ctx.createGain()
  const start = ctx.currentTime + delay
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(output)
  playing.add(source)
  source.onended = () => {
    playing.delete(source)
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }
  source.start(start)
  source.stop(start + duration)
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
  playTexture({ duration: 0.16, frequency: 1900, volume: 0.09 })
  playTexture({ duration: 0.11, frequency: 1100, volume: 0.05, delay: 0.08 })
}

export function playFiveSound() {
  playTone({ frequency: 523, duration: 0.1, volume: 0.07 })
  playTone({ frequency: 659, duration: 0.1, delay: 0.1, volume: 0.06 })
  playTone({ frequency: 784, duration: 0.18, delay: 0.2, volume: 0.06 })
}

export function resumeAudio() {
  if (!enabled || document.hidden) return
  const ctx = getContext()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
}

export function suspendEffectsAudio() {
  stopEffects()
  if (audioContext?.state === 'running') audioContext.suspend().catch(() => {})
}

export function playChalkSound() {
  playTexture({ duration: 0.055, frequency: 2300, volume: 0.055 })
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
  playTexture({ duration: 0.075, frequency: 650, volume: 0.18 })
  playTone({ frequency: 135, duration: 0.09, volume: 0.075, fade: false })
  playTexture({ duration: 0.05, frequency: 1500, volume: 0.045, delay: 0.065 })
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
