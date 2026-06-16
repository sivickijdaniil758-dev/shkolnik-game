/** Две случайные неверные опции для подсказки «Спросить соседа» */
export function pickHiddenWrongIndices(correctIndex, optionCount) {
  const wrong = []
  for (let i = 0; i < optionCount; i += 1) {
    if (i !== correctIndex) wrong.push(i)
  }
  for (let i = wrong.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wrong[i], wrong[j]] = [wrong[j], wrong[i]]
  }
  return wrong.slice(0, Math.min(2, wrong.length))
}

export const HINTS_PER_CLASS = { copy: 1, neighbor: 1 }
