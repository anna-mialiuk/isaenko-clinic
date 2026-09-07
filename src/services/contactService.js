import { getAttribution, getCid } from '../utils/attribution'

const CONTACT_API_URL = import.meta.env.VITE_API_URL || '/api/contact.php'

/**
 * Дані про джерело додаємо тут, а не в кожній формі:
 * так лід завжди приходить із мітками, навіть якщо beacon
 * form_submit ще не долетів до /api/attr на момент відправки.
 */
const buildAttributionFields = () => ({
  ...getAttribution(),
  cid: getCid(),
  landing_page: sessionStorage.getItem('attr_landing_v1') || window.location.href,
  page_location: window.location.href,
  referrer: document.referrer || '',
})

export async function sendContactRequest(payload) {
  const response = await fetch(CONTACT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...buildAttributionFields(), ...payload }),
  })

  let data

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Contact form request failed')
  }

  return data
}
