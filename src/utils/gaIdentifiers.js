const MEASUREMENT_ID = 'G-3LKVREYQFY'

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export const getClientId = () => {
  const raw = readCookie('_ga')
  if (!raw) return null

  const parts = raw.split('.')
  if (parts.length < 4) return null

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
}

export const getSessionIds = () => {
  const cookieName = `_ga_${MEASUREMENT_ID.replace(/^G-/, '')}`
  const raw = readCookie(cookieName)

  if (!raw) return { session_id: null, session_number: null }

  if (raw.startsWith('GS2.')) {
    const sessionId = raw.match(/\bs(\d+)/)
    const sessionNumber = raw.match(/\$o(\d+)/)

    return {
      session_id: sessionId ? sessionId[1] : null,
      session_number: sessionNumber ? sessionNumber[1] : null,
    }
  }

  const parts = raw.split('.')

  return {
    session_id: parts[2] || null,
    session_number: parts[3] || null,
  }
}

export const warmUpGtagCache = () => {
  if (typeof window.gtag !== 'function') return

  const timeout = setTimeout(() => {}, 1000)

  try {
    window.gtag('get', MEASUREMENT_ID, 'client_id', () => clearTimeout(timeout))
    window.gtag('get', MEASUREMENT_ID, 'session_id', () => {})
  } catch {
    clearTimeout(timeout)
  }
}

export const getGaIdentifiers = () => ({
  client_id: getClientId(),
  ...getSessionIds(),
})
