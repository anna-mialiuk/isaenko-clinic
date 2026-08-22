import { getAttribution, getCid } from './attribution'
import { getGaIdentifiers } from './gaIdentifiers'

const ATTR_ENDPOINT = '/api/attr'

const META_EVENTS = {
  booking_click: 'BookingClick',
  phone_click: 'Contact',
  email_click: 'Contact',
  form_submit: 'Lead',
}

const TIKTOK_EVENTS = {
  booking_click: 'ClickButton',
  phone_click: 'Contact',
  email_click: 'Contact',
  form_submit: 'SubmitForm',
}

export const uuid = () => {
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

export const buildPayload = (eventName, eventId, element) => {
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

export const dispatch = (eventName, payload) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload)
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    event_id: payload.event_id,
    ...Object.fromEntries(Object.entries(payload).map(([k, v]) => [`attr_${k}`, v])),
  })

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', META_EVENTS[eventName] || 'Contact', payload, {
      eventID: payload.event_id,
    })
  }

  if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
    window.ttq.track(TIKTOK_EVENTS[eventName] || 'ClickButton', {
      ...payload,
      event_id: payload.event_id,
    })
  }

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'text/plain' })
    navigator.sendBeacon(ATTR_ENDPOINT, blob)
  }
}
