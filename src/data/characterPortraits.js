import boySportsman from '../assets/portraits/boy-sportsman.webp'
import boyBotanist from '../assets/portraits/boy-botanist.webp'
import boyNeformal from '../assets/portraits/boy-neformal.webp'
import girlExcellent from '../assets/portraits/girl-excellent.webp'
import girlQueen from '../assets/portraits/girl-queen.webp'
import girlEmo from '../assets/portraits/girl-emo.webp'

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

const warmedPortraits = new Map()

/** Start while the player chooses a save slot; reuse the normal browser cache. */
export function preloadPortraits() {
  for (const portrait of Object.values(PORTRAIT_GROUPS).flat()) {
    if (warmedPortraits.has(portrait.image)) continue
    const image = new Image()
    image.decoding = 'async'
    image.fetchPriority = 'low'
    image.onerror = () => warmedPortraits.delete(portrait.image)
    image.src = portrait.image
    warmedPortraits.set(portrait.image, image)
    image.decode?.().catch(() => {})
  }
}
