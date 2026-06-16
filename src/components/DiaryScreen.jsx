import { useCallback, useEffect, useRef, useState } from 'react'
import AchievementAward from './AchievementAward'
import { ACHIEVEMENTS } from '../data/achievements'
import { getPortraitImage } from '../data/characterPortraits'
import { playPageFlipSound } from '../utils/sounds'
import {
  DIARY_PAGE_ACHIEVEMENTS,
  DIARY_PAGE_COVER,
  DIARY_PAGE_DOSSIER,
  DIARY_TOTAL_PAGES,
  admissionDateForGrade,
  computeGradeStats,
  formatPlayTime,
  genderLabel,
  getAchievementsForGradeYear,
  getFavoriteSubject,
  getGramotasForGrade,
  getMarkTilt,
  getPageKind,
  getPageLabel,
  gradeToPageIndex,
  pageIndexToGrade,
  parseStudentName,
  schoolYearForGrade,
} from '../utils/diaryHelpers'

const FLIP_MS = 680
const SWIPE_THRESHOLD = 48

function HandMark({ mark, seed = 0 }) {
  const tilt = getMarkTilt(seed)
  return (
    <span
      className={`diary-hand-mark diary-hand-mark-${mark}`}
      style={{ '--mark-tilt': `${tilt}deg` }}
    >
      {mark}
    </span>
  )
}

function StudentPhoto({ portraitId, className = '' }) {
  const src = portraitId ? getPortraitImage(portraitId) : null
  if (!src) return null
  return (
    <div className={`diary-student-photo ${className}`}>
      <span className="diary-student-photo-clip" aria-hidden="true" />
      <img className="diary-student-photo-img" src={src} alt="" draggable={false} />
    </div>
  )
}

function DiaryCoverPage({ playerName, playerPortraitId, currentGrade }) {
  const { surname, firstName } = parseStudentName(playerName)
  const grade = currentGrade ?? 1

  return (
    <div className="diary-cover-page">
      <div className="diary-cover-texture" aria-hidden="true" />
      <div className="diary-cover-emblem" aria-hidden="true">
        <span className="diary-cover-emblem-inner">№ 1</span>
      </div>
      <StudentPhoto portraitId={playerPortraitId} className="diary-cover-photo" />
      <h1 className="diary-cover-title">ДНЕВНИК</h1>
      <p className="diary-cover-sub">ученика</p>
      <div className="diary-cover-name-block">
        <p className="diary-cover-surname">{surname}</p>
        <p className="diary-cover-firstname">{firstName}</p>
      </div>
      <ul className="diary-cover-meta">
        <li>
          <span className="diary-cover-meta-label">Класс</span>
          <span className="diary-cover-meta-value">{grade}-А</span>
        </li>
        <li>
          <span className="diary-cover-meta-label">Школа</span>
          <span className="diary-cover-meta-value">СОШ № 1</span>
        </li>
        <li>
          <span className="diary-cover-meta-label">Учебный год</span>
          <span className="diary-cover-meta-value">{schoolYearForGrade(grade)}</span>
        </li>
      </ul>
      <p className="diary-cover-footer">г. Россия · 2000–2010</p>
    </div>
  )
}

function DiaryDossierPage({
  playerName,
  playerPortraitId,
  playerGender,
  currentGrade,
  diary,
  achievementStats,
  unlockedAchievements,
}) {
  const { surname, firstName } = parseStudentName(playerName)
  const favorite = getFavoriteSubject(diary)
  const stats = achievementStats ?? {}

  return (
    <div className="diary-paper diary-paper-dossier">
      <div className="diary-paper-lines" aria-hidden="true" />
      <div className="diary-paper-margin" aria-hidden="true" />
      <div className="diary-paper-age" aria-hidden="true" />

      <header className="diary-dossier-head">
        <h2 className="diary-print diary-dossier-title">ЛИЧНОЕ ДЕЛО</h2>
        <span className="diary-dossier-stamp">МП</span>
      </header>

      <div className="diary-dossier-layout">
        <StudentPhoto portraitId={playerPortraitId} className="diary-dossier-photo" />
        <div className="diary-dossier-fields">
          <p className="diary-dossier-row">
            <span className="diary-field-label">Фамилия</span>
            <span className="diary-hand diary-field-line">{surname}</span>
          </p>
          <p className="diary-dossier-row">
            <span className="diary-field-label">Имя</span>
            <span className="diary-hand diary-field-line">{firstName}</span>
          </p>
          <p className="diary-dossier-row">
            <span className="diary-field-label">Пол</span>
            <span className="diary-hand diary-field-line">{genderLabel(playerGender)}</span>
          </p>
          <p className="diary-dossier-row">
            <span className="diary-field-label">Класс</span>
            <span className="diary-hand diary-field-line">{currentGrade ?? 1}-А</span>
          </p>
          <p className="diary-dossier-row">
            <span className="diary-field-label">Поступил</span>
            <span className="diary-hand diary-field-line">{admissionDateForGrade(1)}</span>
          </p>
          <p className="diary-dossier-row">
            <span className="diary-field-label">Любимый предмет</span>
            <span className="diary-hand diary-field-line diary-field-fav">{favorite}</span>
          </p>
        </div>
      </div>

      <section className="diary-dossier-stats">
        <h3 className="diary-print diary-dossier-stats-title">СТАТИСТИКА УЧЕНИКА</h3>
        <ul className="diary-dossier-stats-list diary-hand">
          <li>
            Время в школе: <strong>{formatPlayTime(stats.playTimeMs)}</strong>
          </li>
          <li>
            Классов в дневнике: <strong>{diary.length}</strong>
          </li>
          <li>
            Наград: <strong>{unlockedAchievements.length}</strong>
          </li>
          <li>
            Пятёрок подряд (рекорд): <strong>{stats.consecutiveCorrect ?? 0}</strong>
          </li>
        </ul>
      </section>

      <p className="diary-teacher-sign diary-hand">Завуч _________________</p>
    </div>
  )
}

function DiaryGradePage({ grade, entry, unlockedAchievements, playerName }) {
  const stats = computeGradeStats(entry)
  const yearAchievements = getAchievementsForGradeYear(grade, entry, unlockedAchievements)
  const gramotas = getGramotasForGrade(entry, yearAchievements)

  return (
    <div className="diary-paper diary-paper-grade">
      <div className="diary-paper-lines" aria-hidden="true" />
      <div className="diary-paper-margin" aria-hidden="true" />
      <div className="diary-paper-age" aria-hidden="true" />

      <header className="diary-grade-head">
        <p className="diary-hand diary-grade-class">{grade}-А класс</p>
        <p className="diary-print diary-grade-caption">ИТОГИ УЧЕБНОГО ГОДА</p>
        <p className="diary-hand diary-grade-year">{schoolYearForGrade(grade)} уч. г.</p>
      </header>

      {!stats.hasData ? (
        <div className="diary-grade-empty">
          <p className="diary-hand">Этот год ещё впереди.</p>
          <p className="diary-hand diary-grade-empty-sub">Здесь появятся отметки и награды.</p>
        </div>
      ) : (
        <>
          <section className="diary-grade-summary">
            <div className="diary-stat-chip diary-hand">
              <span className="diary-stat-label">Средний балл</span>
              <span className="diary-stat-value">
                {stats.averageMark != null ? (
                  <>
                    <HandMark mark={Math.round(stats.averageMark)} seed={grade * 3} />
                    <small> ({stats.averageMark.toFixed(2)})</small>
                  </>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="diary-stat-row diary-hand">
              <span className="diary-stat-pill diary-stat-pill-5">пятёрок: {stats.fives}</span>
              <span className="diary-stat-pill diary-stat-pill-4">четвёрок: {stats.fours}</span>
              <span className="diary-stat-pill diary-stat-pill-3">троек: {stats.threes}</span>
            </div>
            {stats.twos > 0 ? (
              <p className="diary-hand diary-stat-warn">двоек: {stats.twos}</p>
            ) : null}
            <p className="diary-hand diary-stat-mistakes">ошибок за год: {stats.mistakes}</p>
          </section>

          <section className="diary-grade-subjects">
            <h3 className="diary-print diary-grade-section-title">Пройденные предметы</h3>
            <ul className="diary-subject-list">
              {stats.markRows.map((row, i) => (
                <li key={`${row.subject}-${i}`} className="diary-subject-item diary-hand">
                  <span className="diary-subject-name">{row.subject}</span>
                  <HandMark mark={row.mark} seed={i + row.mark * 5} />
                  {row.mistakes > 0 ? (
                    <span className="diary-subject-mistakes">({row.mistakes} ош.)</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {gramotas.length > 0 ? (
            <section className="diary-grade-gramotas">
              <h3 className="diary-print diary-grade-section-title">Грамоты года</h3>
              <div className="diary-grade-gramota-strip">
                {gramotas.map((id, i) => (
                  <div
                    key={id}
                    className="diary-grade-gramota-pin"
                    style={{ '--gramota-rot': `${(i % 4) * 4 - 6}deg` }}
                  >
                    <AchievementAward
                      achievementId={id}
                      playerName={playerName}
                      compact
                      className="diary-praise-award"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {yearAchievements.length > 0 ? (
            <section className="diary-grade-achievements">
              <h3 className="diary-print diary-grade-section-title">Достижения года</h3>
              <ul className="diary-achievement-year-list diary-hand">
                {yearAchievements.map((id) => (
                  <li key={id}>
                    <span className="diary-achievement-bullet">★</span>
                    {ACHIEVEMENTS[id]?.title ?? id}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <div className="diary-teacher-sign diary-hand">кл. руководитель _____________</div>
      <span className="diary-page-stamp diary-page-stamp-grade" aria-hidden="true">
        {grade}
      </span>
    </div>
  )
}

function DiaryAchievementsPage({ unlockedAchievements, playerName, achievementUnlockedAt }) {
  const ids = unlockedAchievements.filter((id) => ACHIEVEMENTS[id])

  return (
    <div className="diary-paper diary-paper-achievements">
      <div className="diary-paper-lines" aria-hidden="true" />
      <div className="diary-paper-margin" aria-hidden="true" />

      <header className="diary-achievements-head">
        <h2 className="diary-print diary-achievements-title">ДОСКА ДОСТИЖЕНИЙ</h2>
        <p className="diary-hand diary-achievements-sub">вся история успехов</p>
      </header>

      {ids.length === 0 ? (
        <p className="diary-hand diary-achievements-empty">
          Пока пусто — учись, получай пятёрки, открывай награды!
        </p>
      ) : (
        <div className="diary-achievements-board">
          {ids.map((id, i) => (
            <div
              key={id}
              className="diary-achievement-pin"
              style={{ '--pin-rot': `${(i % 7) * 5 - 15}deg` }}
            >
              <AchievementAward
                achievementId={id}
                playerName={playerName}
                compact
                className="diary-praise-award"
              />
              {achievementUnlockedAt?.[id] ? (
                <span className="diary-achievement-date diary-print">{achievementUnlockedAt[id]}</span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="diary-stickers-row" aria-hidden={ids.length === 0}>
        <span className="diary-sticker diary-sticker-star">★</span>
        <span className="diary-stamp-round">5</span>
        <span className="diary-sticker diary-sticker-smile">☺</span>
      </div>
    </div>
  )
}

function DiaryScreen({
  diary,
  playerName,
  playerPortraitId,
  playerGender = 'boy',
  currentGrade,
  unlockedAchievements = [],
  achievementStats,
  achievementUnlockedAt = {},
  soundEnabled,
  onDiaryPageView,
  onBack,
}) {
  const [pageIndex, setPageIndex] = useState(() => gradeToPageIndex(currentGrade ?? 1))
  const [flipping, setFlipping] = useState(null)
  const touchRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const grade = pageIndexToGrade(pageIndex)
    if (grade && onDiaryPageView) onDiaryPageView(grade)
    else if (pageIndex === DIARY_PAGE_ACHIEVEMENTS && onDiaryPageView) onDiaryPageView(11)
  }, [pageIndex, onDiaryPageView])

  const renderPage = useCallback(
    (index) => {
      const kind = getPageKind(index)
      if (kind === 'cover') {
        return (
          <DiaryCoverPage
            playerName={playerName}
            playerPortraitId={playerPortraitId}
            currentGrade={currentGrade}
          />
        )
      }
      if (kind === 'dossier') {
        return (
          <DiaryDossierPage
            playerName={playerName}
            playerPortraitId={playerPortraitId}
            playerGender={playerGender}
            currentGrade={currentGrade}
            diary={diary}
            achievementStats={achievementStats}
            unlockedAchievements={unlockedAchievements}
          />
        )
      }
      if (kind === 'achievements') {
        return (
          <DiaryAchievementsPage
            unlockedAchievements={unlockedAchievements}
            playerName={playerName}
            achievementUnlockedAt={achievementUnlockedAt}
          />
        )
      }
      const grade = pageIndexToGrade(index)
      const entry = diary.find((e) => e.grade === grade)
      return (
        <DiaryGradePage
          grade={grade}
          entry={entry}
          unlockedAchievements={unlockedAchievements}
          playerName={playerName}
        />
      )
    },
    [
      diary,
      playerName,
      playerPortraitId,
      playerGender,
      currentGrade,
      achievementStats,
      unlockedAchievements,
      achievementUnlockedAt,
    ],
  )

  const turnPage = (dir) => {
    if (flipping) return
    const nextIndex = dir === 'next' ? pageIndex + 1 : pageIndex - 1
    if (nextIndex < 0 || nextIndex >= DIARY_TOTAL_PAGES) return
    if (soundEnabled) playPageFlipSound()
    setFlipping({ dir, from: pageIndex, to: nextIndex })
    window.setTimeout(() => {
      setPageIndex(nextIndex)
      setFlipping(null)
    }, FLIP_MS)
  }

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e) => {
    if (flipping) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) turnPage('next')
    else turnPage('prev')
  }

  const isCover = pageIndex === DIARY_PAGE_COVER

  return (
    <div className="diary-scene">
      <div className="diary-scene-desk" aria-hidden="true" />

      <div className={`school-diary panel-enter ${isCover ? 'school-diary--cover-open' : ''}`}>
        <div className="school-diary-cover-edge" aria-hidden="true" />
        <div className="school-diary-spine" aria-hidden="true" />

        <div className="school-diary-book">
          <div
            className="diary-pages-viewport"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="diary-page-under">{renderPage(flipping ? flipping.to : pageIndex)}</div>

            {flipping ? (
              <div className={`diary-page-flipper diary-flip-${flipping.dir}`}>
                <div className="diary-leaf">
                  <div className="diary-leaf-front">
                    {renderPage(flipping.dir === 'next' ? flipping.from : flipping.to)}
                  </div>
                  <div className="diary-leaf-back" aria-hidden="true" />
                </div>
              </div>
            ) : (
              <div className="diary-page-top">{renderPage(pageIndex)}</div>
            )}
          </div>
        </div>

        <nav className="diary-nav" aria-label="Страницы дневника">
          <button
            type="button"
            className="diary-nav-btn diary-hand"
            disabled={pageIndex <= 0 || Boolean(flipping)}
            onClick={() => turnPage('prev')}
          >
            ← Предыдущая страница
          </button>
          <p className="diary-page-indicator diary-print">
            {getPageLabel(pageIndex)} · {pageIndex + 1}/{DIARY_TOTAL_PAGES}
          </p>
          <button
            type="button"
            className="diary-nav-btn diary-hand"
            disabled={pageIndex >= DIARY_TOTAL_PAGES - 1 || Boolean(flipping)}
            onClick={() => turnPage('next')}
          >
            Следующая страница →
          </button>
        </nav>
      </div>

      <button type="button" className="diary-close-btn diary-hand" onClick={onBack}>
        ← Закрыть дневник
      </button>
    </div>
  )
}

export default DiaryScreen
