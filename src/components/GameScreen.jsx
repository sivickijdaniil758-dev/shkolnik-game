import ChalkSubject from './ChalkSubject'
import ClassroomPhotoBackground from './ClassroomPhotoBackground'
import Confetti from './Confetti'
import GameHUD from './GameHUD'
import HintNotes from './HintNotes'
import Notebook from './Notebook'

function GameScreen({
  grade,
  subject,
  questionIndex,
  mistakes,
  playerName,
  playerPortraitId,
  question,
  selectedOption,
  isWrongAnimation,
  isCorrectFlash,
  teacherPhrase,
  timer,
  hintCopyLeft,
  hintNeighborLeft,
  hintHiddenIndices,
  hintShowAnswer,
  onOpenSettings,
  onHintCopy,
  onHintNeighbor,
  onAnswer,
}) {
  const hintsDisabled = Boolean(selectedOption)

  return (
    <div className={`game-scene game-scene-photo ${isWrongAnimation ? 'scene-shake' : ''}`}>
      <ClassroomPhotoBackground />
      <div className="game-scene-photo-vignette" aria-hidden="true" />
      <ChalkSubject subject={subject} />

      <div className="game-scene-ui">
        <GameHUD
          grade={grade}
          mistakes={mistakes}
          timer={timer}
          playerName={playerName}
          playerPortraitId={playerPortraitId}
          onOpenSettings={onOpenSettings}
        />

        <div className="game-play-zone">
          <HintNotes
            copyLeft={hintCopyLeft}
            neighborLeft={hintNeighborLeft}
            disabled={hintsDisabled}
            onCopy={onHintCopy}
            onNeighbor={onHintNeighbor}
          />
          <Notebook
            questionIndex={questionIndex}
            question={question}
            teacherPhrase={teacherPhrase}
            selectedOption={selectedOption}
            isCorrectFlash={isCorrectFlash}
            isWrongFlash={isWrongAnimation}
            hiddenOptionIndices={hintHiddenIndices}
            highlightCorrect={hintShowAnswer}
            onAnswer={onAnswer}
          />
        </div>
      </div>

      <Confetti active={isCorrectFlash} />
    </div>
  )
}

export default GameScreen
