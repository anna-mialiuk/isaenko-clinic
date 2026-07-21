import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import Toast from '../../components/Toast/Toast'
import { useLocale } from '../../hooks/useLocale'
import { sendContactRequest } from '../../services/contactService'

import './QuestionForm.sass'

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

    if (Object.keys(newErrors).length > 0) return

    try {
      setIsSubmitting(true)
      setSubmitError('')
      setToast(null)

      await sendContactRequest({
        name: form.name.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        company: form.company.trim(),
        language,
        page: pathname,
      })

      setIsSent(true)
      setToast({ type: 'success', message: questionForm.success })
      setForm(initialFormState)
    } catch (error) {
      console.error('Question form submit error:', error)
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
            />

            {errors.phone && <span className="question-form__error">{errors.phone}</span>}
          </div>

          <div className="question-form__field">
            <textarea
              name="message"
              placeholder={questionForm.messagePlaceholder}
              value={form.message}
              onChange={handleChange}
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
