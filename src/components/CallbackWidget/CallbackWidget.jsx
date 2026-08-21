import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import useScrollCTAVisibility from '../../hooks/useScrollCTAVisibility'
import { useLocale } from '../../hooks/useLocale'
import { sendContactRequest } from '../../services/contactService'
import { trackEvent, getGaIds } from '../../utils/gaEvent'

import './CallbackWidget.sass'

const FORM_NAME = 'callback_widget'
const MIN_PHONE_DIGITS = 9

const countDigits = (value) => value.replace(/\D/g, '').length

function CallbackWidget() {
  const { callbackWidget, questionForm, language } = useLocale()
  const { pathname } = useLocation()
  const isCtaVisible = useScrollCTAVisibility()

  const inputRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleToggle = () => {
    const nextOpen = !isOpen

    setIsOpen(nextOpen)

    if (nextOpen) {
      setIsSent(false)
      setError('')
      trackEvent('form_open', { form_name: FORM_NAME })
    }
  }

  const handleFocus = () => {
    trackEvent('form_start', { form_name: FORM_NAME }, { once: 'session' })
  }

  const handleChange = (e) => {
    setPhone(e.target.value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (company.trim()) return

    if (countDigits(phone) < MIN_PHONE_DIGITS) {
      setError(callbackWidget.invalidPhone)

      trackEvent('form_error', {
        form_name: FORM_NAME,
        error_type: 'validation',
        error_field: 'phone',
      })

      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const eventId = trackEvent('form_submit', { form_name: FORM_NAME })

      const { clientId, sessionId } = await getGaIds()

      await sendContactRequest({
        name: '',
        phone: phone.trim(),
        message: callbackWidget.serverMessage,
        company: '',
        language,
        page: pathname,
        event_id: eventId,
        form_name: FORM_NAME,
        ga_client_id: clientId,
        ga_session_id: sessionId,
      })

      setIsSent(true)
      setPhone('')
    } catch (submitError) {
      console.error('Callback widget submit error:', submitError)

      trackEvent('form_error', {
        form_name: FORM_NAME,
        error_type: 'server',
      })

      setError(questionForm.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`callback-widget ${isOpen ? 'callback-widget--open' : ''} ${
        isCtaVisible ? 'callback-widget--raised' : ''
      }`}
    >
      <div className="callback-widget__panel" role="dialog" aria-label={callbackWidget.title}>
        <button
          type="button"
          className="callback-widget__close"
          onClick={() => setIsOpen(false)}
          aria-label={callbackWidget.close}
        >
          ×
        </button>

        {isSent ? (
          <p className="callback-widget__success">{questionForm.success}</p>
        ) : (
          <>
            <p className="callback-widget__title">{callbackWidget.title}</p>

            <p className="callback-widget__text">{callbackWidget.text}</p>

            <form className="callback-widget__form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="callback-widget__honeypot"
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
              />

              <input
                ref={inputRef}
                type="tel"
                name="phone"
                className="callback-widget__input"
                placeholder={questionForm.phonePlaceholder}
                value={phone}
                onChange={handleChange}
                onFocus={handleFocus}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(error)}
              />

              {error && <span className="callback-widget__error">{error}</span>}

              <button type="submit" className="callback-widget__submit" disabled={isSubmitting}>
                {isSubmitting ? questionForm.sending : callbackWidget.submit}
              </button>
            </form>

            <p className="callback-widget__policy">{questionForm.policy}</p>
          </>
        )}
      </div>

      <button
        type="button"
        className="callback-widget__button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? callbackWidget.close : callbackWidget.aria}
      >
        <img src="/images/icons/phone.svg" alt="" className="callback-widget__icon" />
      </button>
    </div>
  )
}

export default CallbackWidget
