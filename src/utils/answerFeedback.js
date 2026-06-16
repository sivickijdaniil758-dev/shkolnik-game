export const ANSWER_REVEAL_MS = {
  correct: 500,
  wrong: 900,
}

export function getAnswerRevealDelay(isCorrect) {
  return isCorrect ? ANSWER_REVEAL_MS.correct : ANSWER_REVEAL_MS.wrong
}

export function getAnswerRowState(index, question, selectedOption, highlightCorrect) {
  if (!selectedOption) {
    if (highlightCorrect && index === question.correctIndex) return 'hint'
    return 'idle'
  }

  if (index === selectedOption.index) {
    return selectedOption.state
  }

  if (selectedOption.state === 'wrong' && index === question.correctIndex) {
    return 'correct'
  }

  return 'idle'
}
