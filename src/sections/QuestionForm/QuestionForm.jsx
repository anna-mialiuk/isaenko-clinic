import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import Toast from '../../components/Toast/Toast'
import { useLocale } from '../../hooks/useLocale'
import { sendContactRequest } from '../../services/contactService'
import { trackEvent, getGaIds } from '../../utils/gaEvent'

import './QuestionForm.sass'

const FORM_NAME = 'callback_footer'

const initialFormState = {
  name: '',
  phone: '',
  message: '',
  company: '',
}

function QuestionForm() {
  const { language, questionForm } = useLocale()
  const { pathname } = useLocation()

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState(null)

  const handleFocus = () => {
    trackEvent('form_start', { form_name: FORM_NAME }, { once: 'session' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))

    setIsSent(false)
    setSubmitError('')
    setToast(null)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = questionForm.required
    }

    if (!form.phone.trim()) {
      newErrors.phone = questionForm.required
    }

    if (!form.message.trim()) {
      newErrors.message = questionForm.required
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.company.trim()) return

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      trackEvent('form_error', {
        form_name: FORM_NAME,
        error_type: 'validation',
        error_field: Object.keys(newErrors)[0],
      })
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      setToast(null)

      const eventId = trackEvent('form_submit', { form_name: FORM_NAME })

      const { clientId, sessionId } = await getGaIds()

      await sendContactRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        company: form.company.trim(),
        language,
        page: pathname,
        event_id: eventId,
        form_name: FORM_NAME,
        ga_client_id: clientId,
        ga_session_id: sessionId,
      })

      setIsSent(true)
      setToast({ type: 'success', message: questionForm.success })
      setForm(initialFormState)
    } catch (error) {
      console.error('Question form submit error:', error)

      trackEvent('form_error', {
        form_name: FORM_NAME,
        error_type: 'server',
      })

      setSubmitError(questionForm.error)
      setToast({ type: 'error', message: questionForm.error })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="question-form" id="contacts">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="container question-form__container">
        <div className="question-form__content">
          <h2 className="question-form__title h2">{questionForm.title}</h2>

          <p className="question-form__text p">{questionForm.text}</p>

          <p className="question-form__policy">{questionForm.policy}</p>
        </div>

        <form className="question-form__form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            onFocus={handleFocus}
            className="question-form__honeypot"
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="question-form__field">
            <input
              type="text"
              name="name"
              placeholder={questionForm.namePlaceholder}
              value={form.name}
              onChange={handleChange}
              onFocus={handleFocus}
            />

            {errors.name && <span className="question-form__error">{errors.name}</span>}
          </div>

          <div className="question-form__field">
            <input
              type="tel"
              name="phone"
              placeholder={questionForm.phonePlaceholder}
              value={form.phone}
              onChange={handleChange}
              onFocus={handleFocus}
            />

            {errors.phone && <span className="question-form__error">{errors.phone}</span>}
          </div>

          <div className="question-form__field">
            <textarea
              name="message"
              placeholder={questionForm.messagePlaceholder}
              value={form.message}
              onChange={handleChange}
              onFocus={handleFocus}
            />

            {errors.message && <span className="question-form__error">{errors.message}</span>}
          </div>

          {isSent && <p className="question-form__success">{questionForm.success}</p>}

          {submitError && <p className="question-form__error">{submitError}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? questionForm.sending : questionForm.submit}
          </button>
        </form>
      </div>
    </section>
  )
}

export default QuestionForm
