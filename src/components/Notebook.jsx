import { getAnswerRowState } from '../utils/answerFeedback'

const OPTION_LETTERS = ['А', 'Б', 'В', 'Г']

function Notebook({
  questionIndex,
  question,
  teacherPhrase,
  selectedOption,
  isCorrectFlash,
  isWrongFlash,
  hiddenOptionIndices = [],
  highlightCorrect = false,
  onAnswer,
}) {
  return (
    <div className={`notebook-desk ${isWrongFlash ? 'notebook-shake' : ''}`}>
      <div className="notebook-desk-contact-shadow" aria-hidden="true" />

      <div
        className={`notebook-stack ${isCorrectFlash ? 'notebook-glow-correct' : ''} ${isWrongFlash ? 'notebook-glow-wrong' : ''}`}
      >
        <div className="sheet-under sheet-under-1" aria-hidden="true" />
        <div className="sheet-under sheet-under-2" aria-hidden="true" />

        <div
          key={questionIndex}
          className="notebook-sheet notebook-sheet-enter"
        >
          <div className="sheet-paper">
            <div className="sheet-grain" aria-hidden="true" />
            <div className="sheet-lines" aria-hidden="true" />
            <div className="sheet-margin-red" aria-hidden="true" />
            <div className="sheet-wear" aria-hidden="true" />
            <div className="sheet-corner sheet-corner-tr" aria-hidden="true" />
            <div className="sheet-corner sheet-corner-bl" aria-hidden="true" />

            <div className="sheet-content">
              <p className="cw-question">{question.question}</p>

              {teacherPhrase ? (
                <p className="cw-teacher-note">{teacherPhrase}</p>
              ) : null}

              <div className="cw-answers" role="list">
                {question.options.map((option, index) => {
                  if (hiddenOptionIndices.includes(index)) return null
                  const state = getAnswerRowState(index, question, selectedOption, highlightCorrect)
                  const letter = OPTION_LETTERS[index] ?? String.fromCharCode(65 + index)

                  return (
                    <button
                      key={`${option}-${index}`}
                      type="button"
                      role="listitem"
                      className={`cw-answer-row answer-${state}`}
                      onClick={() => onAnswer(index)}
                      disabled={Boolean(selectedOption)}
                    >
                      <span className="cw-letter">{letter})</span>
                      <span className="cw-text">{option}</span>
                      {state === 'correct' ? (
                        <span className="cw-pen-mark cw-mark-check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                      {state === 'wrong' ? (
                        <span className="cw-pen-mark cw-mark-cross" aria-hidden="true">
                          ✗
                        </span>
                      ) : null}
                      {state !== 'idle' ? <span className="cw-ink-stroke" aria-hidden="true" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="notebook-ballpen" aria-hidden="true">
          <span className="ballpen-body" />
          <span className="ballpen-grip" />
        </div>
      </div>
    </div>
  )
}

export default Notebook
