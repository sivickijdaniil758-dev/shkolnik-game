/** Типы школьных наград (Россия, 2000–2005) */
export const REWARD_TYPES = {
  PRAISE: 'praise',
  DIPLOMA: 'diploma',
  DIPLOMA_GOLD: 'diploma_gold',
  THANKS: 'thanks',
  MEDAL: 'medal',
  DOSSIER: 'dossier',
  ORDER: 'order',
  CUP: 'cup',
}

export const REWARD_TYPE_LABELS = {
  [REWARD_TYPES.PRAISE]: 'Похвальная грамота',
  [REWARD_TYPES.DIPLOMA]: 'Диплом',
  [REWARD_TYPES.DIPLOMA_GOLD]: 'Диплом с золотой рамкой',
  [REWARD_TYPES.THANKS]: 'Благодарность',
  [REWARD_TYPES.MEDAL]: 'Медаль',
  [REWARD_TYPES.DOSSIER]: 'Запись в личном деле',
  [REWARD_TYPES.ORDER]: 'Приказ директора',
  [REWARD_TYPES.CUP]: 'Кубок школы',
}

/** Совместимость со старым полем style в сохранениях/данных */
export const LEGACY_STYLE_TO_REWARD = {
  praise: REWARD_TYPES.PRAISE,
  diploma: REWARD_TYPES.DIPLOMA,
  medal: REWARD_TYPES.MEDAL,
  thanks: REWARD_TYPES.THANKS,
  notice: REWARD_TYPES.ORDER,
  sticker: REWARD_TYPES.DOSSIER,
}

export function resolveRewardType(achievement) {
  if (!achievement) return REWARD_TYPES.PRAISE
  if (achievement.rewardType) return achievement.rewardType
  if (achievement.style) return LEGACY_STYLE_TO_REWARD[achievement.style] ?? REWARD_TYPES.PRAISE
  return REWARD_TYPES.PRAISE
}

export function getRewardTypeLabel(achievement) {
  const type = resolveRewardType(achievement)
  return REWARD_TYPE_LABELS[type] ?? 'Школьная награда'
}
