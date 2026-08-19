import { getPageType, getCityFromPath } from './getPageType'

const MEASUREMENT_ID = 'G-3LKVREYQFY'
const THROTTLE_MS = 2000
const recent = new Map()

const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Єдина точка відправки подій у GA4.
 * Повертає event_id — його треба передати на сервер, щоб серверна подія
 * дедуплікувалась з клієнтською.
 *
 * @param {string} name — ім'я події (snake_case, ≤40 символів)
 * @param {object} params — параметри події
 * @param {object} opts — { once: 'session'|'ever', dedupKey: string }
 */

export const trackEvent = (name, params = {}, opts = {}) => {
  const key =
    opts.dedupKey ||
    `${name}:${params.form_name || params.booking_place || params.phone_place || params.messenger || ''}`

  const now = Date.now()
  if (recent.has(key) && now - recent.get(key) < THROTTLE_MS) return null
  recent.set(key, now)

  if (opts.once) {
    const store = opts.once === 'ever' ? localStorage : sessionStorage
    const flag = `dri_once_${key}`

    try {
      if (store.getItem(flag)) return null
      store.setItem(flag, '1')
    } catch {
      // приватний режим — просто не застосовуємо one-shot
    }
  }

  const eventId = uuid()

  const payload = {
    city: getCityFromPath(window.location.pathname),
    ...params,
    event_id: eventId,
    page_path: window.location.pathname,
    page_type: getPageType(window.location.pathname),
    page_language: document.documentElement.lang || 'uk',
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, payload)
  }

  return eventId
}

export const getGaIds = () =>
  new Promise((resolve) => {
    if (typeof window.gtag !== 'function') return resolve({})

    let clientId
    let sessionId
    let done = 0

    const finish = () => {
      if (++done === 2) resolve({ clientId, sessionId })
    }

    window.gtag('get', MEASUREMENT_ID, 'client_id', (v) => {
      clientId = v
      finish()
    })

    window.gtag('get', MEASUREMENT_ID, 'session_id', (v) => {
      sessionId = v
      finish()
    })

    setTimeout(() => resolve({ clientId, sessionId }), 2000)
  })
