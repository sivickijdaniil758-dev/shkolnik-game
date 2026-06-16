import TeacherCharacter from './TeacherCharacter'

function ClassroomBackground({ blurred = false, teacherMood = 'neutral', showTeacher = true }) {
  return (
    <div className={`classroom-scene ${blurred ? 'classroom-blurred' : ''}`} aria-hidden="true">
      <div className="classroom-sky" />
      <div className="classroom-wall" />
      <div className="classroom-ceiling" />
      <div className="classroom-ceiling-light" />

      <div className="classroom-clock">
        <div className="clock-face">
          <div className="clock-hand clock-hour" />
          <div className="clock-hand clock-minute" />
          <div className="clock-center" />
        </div>
      </div>

      <div className="classroom-bookshelf">
        <div className="shelf-board" />
        <div className="shelf-books">
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="classroom-window">
        <div className="window-frame" />
        <div className="window-pane window-pane-left" />
        <div className="window-pane window-pane-right" />
        <div className="window-sill" />
        <div className="window-curtain window-curtain-left" />
        <div className="window-curtain window-curtain-right" />
        <div className="window-sunbeam window-sunbeam-1" />
        <div className="window-sunbeam window-sunbeam-2" />
        <div className="window-sunbeam window-sunbeam-3" />
      </div>

      <div className="classroom-poster poster-mendeleev">
        <div className="portrait-frame">
          <div className="portrait-face" />
          <span className="portrait-label">Менделеев</span>
        </div>
      </div>
      <div className="classroom-poster poster-alphabet">
        <span>А Б В Г Д</span>
      </div>
      <div className="classroom-poster poster-rules">
        <span>Тишина на уроке!</span>
      </div>
      <div className="classroom-poster poster-math">
        <span>Таблица умножения</span>
      </div>

      <div className="classroom-board">
        <div className="board-frame" />
        <div className="board-surface">
          <div className="board-chalk board-chalk-1">Контрольная работа</div>
          <div className="board-chalk board-chalk-2">Не шумим!</div>
          <div className="board-chalk board-chalk-3">Школьник</div>
        </div>
        <div className="board-tray">
          <span className="chalk-piece chalk-white" />
          <span className="chalk-piece chalk-yellow" />
          <span className="chalk-piece chalk-pink" />
        </div>
      </div>

      {showTeacher ? <TeacherCharacter mood={teacherMood} /> : null}

      <div className="classroom-rows">
        <div className="classroom-row row-back">
          <div className="classmate classmate-1">
            <div className="classmate-head" />
            <div className="classmate-desk" />
          </div>
          <div className="classmate classmate-2">
            <div className="classmate-head" />
            <div className="classmate-desk" />
          </div>
          <div className="classmate classmate-3">
            <div className="classmate-head" />
            <div className="classmate-desk" />
          </div>
        </div>
        <div className="classroom-row row-mid">
          <div className="classmate classmate-4">
            <div className="classmate-head" />
            <div className="classmate-desk" />
          </div>
          <div className="classmate classmate-5">
            <div className="classmate-head" />
            <div className="classmate-desk" />
          </div>
        </div>
      </div>

      <div className="classroom-floor">
        <div className="floor-board floor-board-1" />
        <div className="floor-board floor-board-2" />
        <div className="floor-board floor-board-3" />
        <div className="floor-board floor-board-4" />
      </div>

      <div className="classroom-desk-front">
        <div className="desk-top">
          <div className="desk-scribble" />
        </div>
        <div className="desk-pen" />
      </div>

      <div className="classroom-dust" />
      <div className="classroom-fly" />
      <div className="classroom-haze" />
      <div className="classroom-vignette" />
    </div>
  )
}

export default ClassroomBackground
