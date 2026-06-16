import { useMemo, useState } from 'react'
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '../data/achievements'
import AchievementAward from './AchievementAward'

const HONOR_ORDER = [
  'first_grader',
  'first_five',
  'excellent',
  'perfect_grade',
  'grade_4_graduate',
  'grade_11_graduate',
  'math_genius',
  'school_legend',
  'no_mistakes',
  'exam_passed',
  'grade_2',
  'grade_10_senior',
  'russian_perfect',
  'parents_school',
  'not_ready',
  'eternal_repeater',
  'two_collector',
  'lucky_guess',
  'settings_hooligan',
  'bell_for_teacher',
  'explorer',
  'school_lover',
  'paper_pilot',
  'backpack_rummage',
]

const PIN_ROTATIONS = [-4, 3, -2, 5, -3, 2, -5, 4, -1, 3]

function AchievementsScreen({
  unlockedAchievements,
  achievementUnlockedAt = {},
  playerName,
  onBack,
}) {
  const [selectedId, setSelectedId] = useState(null)
  const unlocked = useMemo(() => new Set(unlockedAchievements), [unlockedAchievements])

  const ordered = useMemo(
    () => [
      ...HONOR_ORDER.filter((id) => ACHIEVEMENTS[id]),
      ...ACHIEVEMENT_IDS.filter((id) => !HONOR_ORDER.includes(id)),
    ],
    [],
  )

  const selected = selectedId ? ACHIEVEMENTS[selectedId] : null
  const selectedDate = selectedId ? achievementUnlockedAt[selectedId] : null

  return (
    <div className="cork-board-scene">
      <div className="cork-board panel-enter">
        <header className="cork-board-header">
          <span className="cork-pushpin cork-pushpin-l" aria-hidden="true" />
          <div>
            <h2 className="cork-board-title">Доска почёта</h2>
            <p className="cork-board-sub">
              {playerName || 'Ученик'} · открыто {unlocked.size} из {ACHIEVEMENT_IDS.length}
            </p>
          </div>
          <span className="cork-pushpin cork-pushpin-r" aria-hidden="true" />
        </header>

        <div className="cork-board-grid">
          {ordered.map((id, i) => {
            const a = ACHIEVEMENTS[id]
            const isOpen = unlocked.has(id)
            const rot = PIN_ROTATIONS[i % PIN_ROTATIONS.length]
            return (
              <button
                key={id}
                type="button"
                className={`cork-pin-item ${isOpen ? 'cork-pin-item--open' : 'cork-pin-item--locked'}`}
                style={{ '--pin-rot': `${rot}deg` }}
                disabled={!isOpen}
                onClick={() => isOpen && setSelectedId(id)}
              >
                <span className="cork-pin-item-tack" aria-hidden="true" />
                {isOpen ? (
                  <div className="cork-pin-item-doc">
                    <AchievementAward
                      achievementId={id}
                      playerName={playerName}
                      compact
                    />
                  </div>
                ) : (
                  <div className="cork-pin-item-locked" aria-hidden="true">
                    <span>?</span>
                    <p>{a.title}</p>
                  </div>
                )}
                <span className="cork-pin-item-label">{a.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      <button type="button" className="cork-board-back" onClick={onBack}>
        ← Назад
      </button>

      {selected && unlocked.has(selectedId) ? (
        <div className="cork-detail-overlay" onClick={() => setSelectedId(null)}>
          <div className="cork-detail-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cork-detail-doc">
              <AchievementAward
                achievementId={selectedId}
                playerName={playerName}
                issueDate={selectedDate}
                animated
              />
            </div>
            <h3 className="cork-detail-title">{selected.title}</h3>
            <p className="cork-detail-desc">{selected.description}</p>
            <button
              type="button"
              className="cork-detail-close"
              onClick={() => setSelectedId(null)}
            >
              Убрать в портфель
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AchievementsScreen
