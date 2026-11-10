const CLOUD_KEY = 'shkolnikSaveBundle'
const SDK_WAIT_MS = 1500
const CLOUD_SAVE_DELAY_MS = 5000

let sdk = null
let player = null
let initPromise = null
let cloudTimer = null
let pendingCloudBundle = null
let gameplayActive = false

function waitForSdk() {
  if (window.YaGames) return Promise.resolve(window.YaGames)

  return new Promise((resolve) => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      if (window.YaGames || Date.now() - startedAt >= SDK_WAIT_MS) {
        window.clearInterval(timer)
        resolve(window.YaGames ?? null)
      }
    }, 50)
  })
}

export function initYandexGames() {
  if (initPromise) return initPromise

  initPromise = waitForSdk()
    .then(async (YaGames) => {
      if (!YaGames) return null
      sdk = await YaGames.init()
      document.documentElement.lang = sdk.environment?.i18n?.lang || 'ru'
      document.documentElement.dataset.platform = 'yandex-games'
      try {
        player = await sdk.getPlayer()
      } catch {
        player = null
      }
      setGameplayActive(gameplayActive)
      return sdk
    })
    .catch(() => null)

  return initPromise
}

export async function signalGameReady() {
  const currentSdk = await initYandexGames()
  try {
    currentSdk?.features?.LoadingAPI?.ready()
  } catch {
    // The game remains usable when the platform API is unavailable.
  }
}

export function setGameplayActive(active) {
  gameplayActive = Boolean(active)
  try {
    if (active) sdk?.features?.GameplayAPI?.start()
    else sdk?.features?.GameplayAPI?.stop()
  } catch {
    // Older SDK versions may not expose GameplayAPI.
  }
}

export async function showFullscreenAd({ onOpen, onClose } = {}) {
  const currentSdk = await initYandexGames()
  if (!currentSdk?.adv?.showFullscreenAdv) {
    onClose?.(false)
    return false
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (wasShown) => {
      if (settled) return
      settled = true
      onClose?.(Boolean(wasShown))
      resolve(Boolean(wasShown))
    }

    try {
      currentSdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => onOpen?.(),
          onClose: finish,
          onError: () => finish(false),
        },
      })
    } catch {
      finish(false)
    }
  })
}

export async function loadCloudSaveBundle() {
  await initYandexGames()
  if (!player?.getData) return null
  try {
    const data = await player.getData([CLOUD_KEY])
    return data?.[CLOUD_KEY] ?? null
  } catch {
    return null
  }
}

async function flushCloudSave() {
  cloudTimer = null
  const bundle = pendingCloudBundle
  pendingCloudBundle = null
  await initYandexGames()
  if (!bundle || !player?.setData) return false
  try {
    await player.setData({ [CLOUD_KEY]: bundle }, false)
    return true
  } catch {
    return false
  }
}

export function queueCloudSave(bundle) {
  pendingCloudBundle = bundle
  if (!cloudTimer) cloudTimer = window.setTimeout(flushCloudSave, CLOUD_SAVE_DELAY_MS)
}

export async function flushPendingCloudSave() {
  if (cloudTimer) window.clearTimeout(cloudTimer)
  return flushCloudSave()
}

