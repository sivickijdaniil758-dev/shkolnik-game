import { REWARD_TYPES, resolveRewardType } from '../data/rewardTypes'

const HONOR_TYPES = new Set([
  REWARD_TYPES.DIPLOMA,
  REWARD_TYPES.DIPLOMA_GOLD,
  REWARD_TYPES.CUP,
])

export function getGramotaHeader(achievement) {
  const type = resolveRewardType(achievement)
  return HONOR_TYPES.has(type) ? 'ПОЧЁТНАЯ ГРАМОТА' : 'ГРАМОТА'
}

export function getGramotaSealVariant(achievement) {
  const type = resolveRewardType(achievement)
  if (HONOR_TYPES.has(type) || type === REWARD_TYPES.MEDAL) return 'red'
  return 'blue'
}

export function getGramotaSealLines(achievement) {
  if (achievement.category === 'secret' || achievement.category === 'fun') {
    return ['ШКОЛЬНЫЙ', 'ПУТЬ']
  }
  return ['МОУ', 'СОШ №1']
}

export function formatGramotaReason(achievement) {
  const raw = (achievement.gramotaReason || achievement.docBody || achievement.description || '').trim()
  if (!raw) return achievement.title

  if (/^[Уу]ченик|^Оставить/i.test(raw)) {
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }

  let text = raw
  if (!/^За\s/i.test(text) && !/^Об\s/i.test(text)) {
    const lower = text.charAt(0).toLowerCase() + text.slice(1)
    text = `за ${lower}`
  }
  return text.charAt(0).toUpperCase() + text.slice(1)
}
