export function getMarkByMistakes(mistakes) {
  if (mistakes <= 1) return 5
  if (mistakes <= 3) return 4
  if (mistakes <= 6) return 3
  return 2
}

export function getFinalMarkByMistakes(mistakes) {
  if (mistakes === 0) return 5
  if (mistakes === 1) return 4
  if (mistakes === 2) return 3
  return 2
}
