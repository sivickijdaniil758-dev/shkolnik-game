import boySportsman from '../assets/portraits/boy-sportsman.png'
import boyBotanist from '../assets/portraits/boy-botanist.png'
import boyNeformal from '../assets/portraits/boy-neformal.png'
import girlExcellent from '../assets/portraits/girl-excellent.png'
import girlQueen from '../assets/portraits/girl-queen.png'
import girlEmo from '../assets/portraits/girl-emo.png'

export const PORTRAIT_GROUPS = {
  boy: [
    { id: 'boy-sportsman', label: 'Спортсмен', image: boySportsman },
    { id: 'boy-botanist', label: 'Ботаник', image: boyBotanist },
    { id: 'boy-neformal', label: 'Неформал', image: boyNeformal },
  ],
  girl: [
    { id: 'girl-excellent', label: 'Отличница', image: girlExcellent },
    { id: 'girl-queen', label: 'Королева школы', image: girlQueen },
    { id: 'girl-emo', label: 'Эмо', image: girlEmo },
  ],
}

export function getPortraitsForGender(gender) {
  return PORTRAIT_GROUPS[gender] ?? PORTRAIT_GROUPS.boy
}

export function getDefaultPortraitId(gender = 'boy') {
  return getPortraitsForGender(gender)[0].id
}

export function normalizePortraitId(gender, portraitId) {
  const list = getPortraitsForGender(gender)
  if (portraitId && list.some((p) => p.id === portraitId)) return portraitId
  return list[0].id
}

export function getPortraitById(portraitId) {
  for (const list of Object.values(PORTRAIT_GROUPS)) {
    const found = list.find((p) => p.id === portraitId)
    if (found) return found
  }
  return PORTRAIT_GROUPS.boy[0]
}

export function getPortraitImage(portraitId) {
  return getPortraitById(portraitId).image
}
