import { buildBookingUrl } from './attribution'
import { buildPayload, dispatch, uuid } from './trackingCore'
import { initFormTracking } from './formTracking'

const BOOKING_HOST = 'cbox.mobi'
const BOOKING_PATH = '/go/booking'

const isBookingUrl = (url) => url.includes(BOOKING_HOST) || url.includes(BOOKING_PATH)

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
  initFormTracking()
  patchWindowOpen()
  watchIframes()
}
