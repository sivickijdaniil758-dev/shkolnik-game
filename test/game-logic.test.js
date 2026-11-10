import assert from 'node:assert/strict'
import test from 'node:test'
import { getFinalMarkByMistakes, getMarkByMistakes } from '../src/utils/grading.js'
import { pickHiddenWrongIndices } from '../src/utils/hintHelpers.js'

test('subject marks use the documented mistake thresholds', () => {
  assert.equal(getMarkByMistakes(0), 5)
  assert.equal(getMarkByMistakes(1), 5)
  assert.equal(getMarkByMistakes(2), 4)
  assert.equal(getMarkByMistakes(6), 3)
  assert.equal(getMarkByMistakes(7), 2)
})

test('final marks use stricter thresholds', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map(getFinalMarkByMistakes),
    [5, 4, 3, 2],
  )
})

test('neighbor hint never hides the correct answer', () => {
  for (let run = 0; run < 30; run += 1) {
    const hidden = pickHiddenWrongIndices(2, 4)
    assert.equal(hidden.length, 2)
    assert.equal(new Set(hidden).size, 2)
    assert.ok(!hidden.includes(2))
  }
})
