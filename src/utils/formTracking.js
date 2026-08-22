import { buildPayload, dispatch, uuid } from './trackingCore'

const lastEventIds = new Map()

const THROTTLE_MS = 2000
const lastSubmitAt = new Map()

const resolveFormName = (form) => {
  const explicit = form.dataset?.formName
  if (explicit) return explicit

  if (form.name) return form.name
  if (form.id) return form.id

  const className = typeof form.className === 'string' ? form.className : ''
  const block = className.split(' ').find((c) => c.includes('__'))

  if (block) return block.split('__')[0].replace(/-/g, '_')

  return 'form'
}

const handleSubmit = (event) => {
  const form = event.target

  if (!form || form.tagName !== 'FORM') return

  if (form.dataset?.trackIgnore !== undefined) return

  const formName = resolveFormName(form)

  const now = Date.now()
  if (now - (lastSubmitAt.get(formName) || 0) < THROTTLE_MS) return
  lastSubmitAt.set(formName, now)

  const eventId = uuid()
  lastEventIds.set(formName, eventId)

  const payload = buildPayload('form_submit', eventId, form)
  payload.form_name = formName

  dispatch('form_submit', payload)
}

export const getFormEventId = (formName) => lastEventIds.get(formName) || null

let initialised = false

export const initFormTracking = () => {
  if (initialised) return
  initialised = true

  document.addEventListener('submit', handleSubmit, true)
}
