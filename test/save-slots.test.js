import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import {
  deleteSlot,
  exportSaveBundle,
  importSaveBundle,
  readSlot,
  readSlotDeletedAt,
  setActiveSlot,
  writeSlot,
} from '../src/utils/saveSlots.js'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage()
})

test('deleted slots are exported as cloud tombstones', () => {
  writeSlot(1, { hasProgress: true, lastPlayedAt: '2026-01-01T10:00:00.000Z' })
  setActiveSlot(1)
  deleteSlot(1, '2026-01-02T10:00:00.000Z')

  const bundle = exportSaveBundle()

  assert.equal(bundle.version, 2)
  assert.deepEqual(bundle.slots, {})
  assert.equal(bundle.deletedSlots[1], '2026-01-02T10:00:00.000Z')
  assert.equal(bundle.activeSlot, null)
})

test('an older cloud save does not resurrect a locally deleted slot', () => {
  deleteSlot(1, '2026-01-02T10:00:00.000Z')

  const changed = importSaveBundle({
    version: 1,
    activeSlot: 1,
    slots: {
      1: { hasProgress: true, playerName: 'Старое', lastPlayedAt: '2026-01-01T10:00:00.000Z' },
    },
  })

  assert.equal(changed, false)
  assert.equal(readSlot(1), null)
  assert.equal(readSlotDeletedAt(1), '2026-01-02T10:00:00.000Z')
})

test('a newer cloud deletion removes an older local save', () => {
  writeSlot(2, { hasProgress: true, playerName: 'Локальное', lastPlayedAt: '2026-01-01T10:00:00.000Z' })
  setActiveSlot(2)

  const changed = importSaveBundle({
    version: 2,
    activeSlot: null,
    slots: {},
    deletedSlots: { 2: '2026-01-03T10:00:00.000Z' },
  })

  assert.equal(changed, true)
  assert.equal(readSlot(2), null)
  assert.equal(readSlotDeletedAt(2), '2026-01-03T10:00:00.000Z')
})

test('a newer cloud save replaces an older deletion marker', () => {
  deleteSlot(3, '2026-01-01T10:00:00.000Z')

  const changed = importSaveBundle({
    version: 2,
    activeSlot: 3,
    slots: {
      3: { hasProgress: true, playerName: 'Новое', lastPlayedAt: '2026-01-04T10:00:00.000Z' },
    },
    deletedSlots: {},
  })

  assert.equal(changed, true)
  assert.equal(readSlot(3).playerName, 'Новое')
  assert.equal(readSlotDeletedAt(3), null)
})
