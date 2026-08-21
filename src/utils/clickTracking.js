import { buildBookingUrl, getAttribution, getCid } from './attribution'
import { getGaIdentifiers } from './gaIdentifiers'

const BOOKING_HOST = 'cbox.mobi'
const BOOKING_PATH = '/go/booking'

const isBookingUrl = (url) => url.includes(BOOKING_HOST) || url.includes(BOOKING_PATH)
const ATTR_ENDPOINT = '/api/attr'

const uuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const resolvePlace = (element) => {
  if (!element) return undefined

  const explicit = element.closest?.('[data-booking-place]')
  if (explicit) return explicit.dataset.bookingPlace

  const className = element.className || ''

  if (typeof className === 'string') {
    if (className.includes('hero__')) return 'hero'
    if (className.includes('scroll-cta')) return 'scroll_cta'
    if (className.includes('footer')) return 'footer'
    if (className.includes('header') || className.includes('top-bar')) return 'header'
  }

  return undefined
}

const buildPayload = (eventName, eventId, element) => {
  const attribution = getAttribution()
  const place = resolvePlace(element)

  return {
    ...attribution,
    ...(place ? { booking_place: place } : {}),
    ...getGaIdentifiers(),
    cid: getCid(),
    event_name: eventName,
    event_id: eventId,
    page_location: window.location.href,
    landing_page: sessionStorage.getItem('attr_landing_v1') || window.location.href,
    referrer: document.referrer || '',
  }
}

const dispatch = (eventName, payload) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    event_id: payload.event_id,
    ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [`attr_${k}`, v])),
  })

  if (typeof window.fbq === 'function') {
    const fbEvent = eventName === 'booking_click' ? 'BookingClick' : 'Contact'
    window.fbq('trackCustom', fbEvent, payload, { eventID: payload.event_id })
  }

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' })
    navigator.sendBeacon(ATTR_ENDPOINT, blob)
  }
}

const handleClick = (event) => {
  const link = event.target.closest?.('a[href]')
  if (!link) return

  const href = link.getAttribute('href') || ''

  if (href.startsWith('tel:')) {
    dispatch('phone_click', buildPayload('phone_click', uuid(), link))
    return
  }

  if (href.startsWith('mailto:')) {
    dispatch('email_click', buildPayload('email_click', uuid(), link))
    return
  }

  if (!isBookingUrl(href)) return

  const eventId = uuid()
  const payload = buildPayload('booking_click', eventId, link)
  dispatch('booking_click', payload)

  link.href = buildBookingUrl(href, payload)
}

export const setNextBookingPlace = (place) => {
  window.__bookingPlace = place
}

const patchWindowOpen = () => {
  const original = window.open

  window.open = function (url, ...rest) {
    if (typeof url === 'string' && isBookingUrl(url)) {
      const eventId = uuid()
      const payload = buildPayload('booking_click', eventId)

      if (window.__bookingPlace) {
        payload.booking_place = window.__bookingPlace
        delete window.__bookingPlace
      }
      dispatch('booking_click', payload)
      return original.call(this, buildBookingUrl(url, payload), ...rest)
    }

    return original.call(this, url, ...rest)
  }
}

/** Віджет запису може зʼявитись як iframe уже після рендеру. */
const watchIframes = () => {
  if (!window.MutationObserver) return

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeName !== 'IFRAME') return

        const src = node.getAttribute('src') || ''
        if (!isBookingUrl(src)) return

        const eventId = uuid()
        const payload = buildPayload('booking_click', eventId)
        dispatch('booking_click', payload)
        node.src = buildBookingUrl(src, payload)
      })
    })
  })

  observer.observe(document.documentElement, { childList: true, subtree: true })
}

let initialised = false

export const initClickTracking = () => {
  if (initialised) return
  initialised = true

  if (!sessionStorage.getItem('attr_landing_v1')) {
    sessionStorage.setItem('attr_landing_v1', window.location.href)
  }

  document.addEventListener('click', handleClick, true)
  patchWindowOpen()
  watchIframes()
}
