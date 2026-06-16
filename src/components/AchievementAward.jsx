import { ACHIEVEMENTS } from '../data/achievements'
import { resolveRewardType } from '../data/rewardTypes'
import {
  formatGramotaReason,
  getGramotaHeader,
  getGramotaSealLines,
  getGramotaSealVariant,
} from '../utils/gramotaHelpers'

function AchievementAward({
  achievementId,
  playerName,
  compact = false,
  animated = false,
  issueDate,
  className = '',
}) {
  const a = ACHIEVEMENTS[achievementId]
  if (!a) return null

  const name = playerName?.trim() || 'Ученик'
  const rewardType = resolveRewardType(a)
  const header = getGramotaHeader(a)
  const reason = formatGramotaReason(a)
  const sealLines = getGramotaSealLines(a)
  const sealVariant = getGramotaSealVariant(a)
  const dateLabel = issueDate?.trim() || null

  const rootClass = [
    'gramota',
    `gramota--${rewardType}`,
    `gramota--seal-${sealVariant}`,
    compact ? 'gramota--compact' : '',
    animated ? 'gramota--animate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={rootClass}>
      <div className="gramota-outer-frame" aria-hidden="true" />
      <div className="gramota-inner-frame" aria-hidden="true" />
      <span className="gramota-corner gramota-corner--tl" aria-hidden="true" />
      <span className="gramota-corner gramota-corner--tr" aria-hidden="true" />
      <span className="gramota-corner gramota-corner--bl" aria-hidden="true" />
      <span className="gramota-corner gramota-corner--br" aria-hidden="true" />

      <header className="gramota-head">
        <p className="gramota-header">{header}</p>
        <p className="gramota-subheader">НАГРАЖДАЕТСЯ</p>
        <p className="gramota-name">{name}</p>
      </header>

      <p className="gramota-reason">{reason}</p>

      {a.docLines?.map((line) => (
        <p key={line} className="gramota-extra-line">
          {line}
        </p>
      ))}

      <footer className="gramota-foot">
        <div className="gramota-sign-block">
          <p className="gramota-director">Директор школы №1</p>
          <p className="gramota-sign-line">_____________________</p>
          {dateLabel ? <p className="gramota-date">Дата выдачи: {dateLabel}</p> : null}
        </div>
        <div className="gramota-seal" aria-hidden="true">
          <span className="gramota-seal-line">{sealLines[0]}</span>
          <span className="gramota-seal-line">{sealLines[1]}</span>
        </div>
      </footer>
    </article>
  )
}

export default AchievementAward
