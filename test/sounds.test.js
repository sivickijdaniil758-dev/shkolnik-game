import test from 'node:test'
import assert from 'node:assert/strict'
import { playStampSound, playPageFlipSound, setEffectsEnabled, suspendEffectsAudio } from '../src/utils/sounds.js'

test('sound effects respect mute/visibility, release sources and place envelopes at their own start time', () => {
  const sources = []
  const gains = []
  const param = () => ({ value: 0, events: [], setValueAtTime(...args) { this.events.push(args) },
    linearRampToValueAtTime(...args) { this.events.push(args) }, exponentialRampToValueAtTime(...args) { this.events.push(args) } })
  const node = () => ({ connect() {}, disconnect() { this.disconnected = true } })
  class Context {
    state = 'running'
    currentTime = 12
    sampleRate = 44100
    destination = node()
    createDynamicsCompressor() { return { ...node(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() } }
    createGain() { const gain = { ...node(), gain: param() }; gains.push(gain); return gain }
    createBiquadFilter() { return { ...node(), frequency: param(), Q: param() } }
    createBuffer(channels, size) { assert.equal(channels, 1); return { getChannelData: () => new Float32Array(size) } }
    createBufferSource() {
      const source = { ...node(), start(time) { this.startedAt = time }, stop() { this.stopped = true } }
      sources.push(source)
      return source
    }
    createOscillator() { return Object.assign(this.createBufferSource(), { frequency: param() }) }
    suspend() { this.state = 'suspended'; return Promise.resolve() }
  }
  globalThis.window = { AudioContext: Context }
  globalThis.document = { hidden: false }
  try {
    setEffectsEnabled(true)
    playStampSound()
    assert.equal(sources.length, 3, 'stamp uses two textures and one soft impact tone')
    sources.forEach((source, i) => {
      assert.deepEqual(gains[i].gain.events[0], [0, source.startedAt], 'no ramp from context time zero')
    })
    sources[0].onended()
    assert.equal(sources[0].disconnected, true)
    setEffectsEnabled(false)
    playStampSound()
    assert.equal(sources.length, 3)
    setEffectsEnabled(true)
    document.hidden = true
    playPageFlipSound()
    assert.equal(sources.length, 3)
    document.hidden = false
    playPageFlipSound()
    assert.equal(sources.length, 5)
    suspendEffectsAudio()
    assert.ok(sources.every(source => source.stopped))
    playStampSound()
    assert.equal(sources.length, 5, 'suspended audio does not queue delayed effects')
  } finally {
    delete globalThis.window
    delete globalThis.document
  }
})
