import { useEffect, useState } from 'react'

import { api } from './api'
import { formatDate } from './formatDate'
import { TRAFFIC_FIELDS, digitsOnly, fieldValue, formLabel, leadTitle } from './leadFields'
import CopyButton from './CopyButton'

import './LeadModal.sass'

const HISTORY_LABELS = {
  status: 'Статус',
  comment: 'Коментар',
}

function LeadModal({ lead: initial, statuses, onClose, onSaved }) {
  const [lead, setLead] = useState(initial)
  const [status, setStatus] = useState(initial.status)
  const [comment, setComment] = useState(initial.comment || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Список не тягне історію й повні мітки — довантажуємо при відкритті.
  useEffect(() => {
    let ignore = false

    api
      .lead(initial.id)
      .then((data) => {
        if (!ignore) setLead(data)
      })
      .catch(() => {})

    return () => {
      ignore = true
    }
  }, [initial.id])

  const save = async () => {
    setBusy(true)
    setError('')

    try {
      await api.updateLead(lead.id, { status, comment })
      onSaved({ ...lead, status, comment })
    } catch {
      setError('Не вдалося зберегти')
      setBusy(false)
    }
  }

  const phoneDigits = digitsOnly(lead.phone)

  // Статус міг бути перейменований або видалений — тоді показуємо
  // сирий ідентифікатор, щоб історія не втрачала сенсу.
  const statusLabel = (id) => statuses.find((item) => item.id === id)?.label || id
  const currentIndex = statuses.findIndex((item) => item.id === status)

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2 className="modal__title">{leadTitle(lead)}</h2>
            <p className="modal__subtitle">
              Заявка #{lead.id} · {formatDate(lead.created_at, true)}
            </p>
          </div>

          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        {/* ── Контакти ── */}
        <section className="modal__section">
          <h3 className="modal__section-title">Контакти</h3>

          <div className="contact">
            <span className="contact__label">Телефон</span>

            <span className="contact__value">{lead.phone || '—'}</span>

            {lead.phone && (
              <span className="contact__actions">
                <CopyButton value={lead.phone} title="Скопіювати номер" />

                <a className="contact__icon" href={`tel:${lead.phone}`} title="Подзвонити">
                  ☎
                </a>

                <a
                  className="contact__icon"
                  href={`https://t.me/+${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram"
                >
                  TG
                </a>

                <a
                  className="contact__icon"
                  href={`https://wa.me/${phoneDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                >
                  WA
                </a>
              </span>
            )}
          </div>

          <div className="contact">
            <span className="contact__label">Пошта</span>
            <span className="contact__value">{lead.email || '—'}</span>

            {lead.email && (
              <span className="contact__actions">
                <CopyButton value={lead.email} title="Скопіювати пошту" />

                <a className="contact__icon" href={`mailto:${lead.email}`} title="Написати">
                  @
                </a>
              </span>
            )}
          </div>

          {lead.message && <p className="modal__message">{lead.message}</p>}
        </section>

        {/* ── Воронка ── */}
        <section className="modal__section">
          <h3 className="modal__section-title">Воронка</h3>

          <div className="funnel">
            {statuses.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`funnel__step ${index <= currentIndex ? 'is-passed' : ''} ${
                  item.id === status ? 'is-current' : ''
                }`}
                // Колір етапу задається в налаштуваннях CRM.
                style={{ '--step-color': item.color }}
                onClick={() => setStatus(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Звідки прийшов ── */}
        <section className="modal__section">
          <h3 className="modal__section-title">Джерело</h3>

          <dl className="fields">
            {TRAFFIC_FIELDS.map(([label, ...keys]) => {
              const value = fieldValue(lead, keys)

              return (
                <div key={label} className="fields__row">
                  <dt>{label}</dt>
                  <dd className={value ? '' : 'is-empty'}>{value || '—'}</dd>
                </div>
              )
            })}

            <div className="fields__row">
              <dt>Форма</dt>
              <dd>{formLabel(lead.form_name) || '—'}</dd>
            </div>

            <div className="fields__row">
              <dt>Сторінка заявки</dt>
              <dd className={lead.page ? '' : 'is-empty'}>{lead.page || '—'}</dd>
            </div>

            {lead.gclid && (
              <div className="fields__row">
                <dt>gclid</dt>
                <dd className="fields__mono">{lead.gclid}</dd>
              </div>
            )}

            {lead.fbclid && (
              <div className="fields__row">
                <dt>fbclid</dt>
                <dd className="fields__mono">{lead.fbclid}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* ── Коментар ── */}
        <section className="modal__section">
          <h3 className="modal__section-title">Коментар</h3>

          <textarea
            className="modal__textarea"
            rows={3}
            placeholder="Що обговорили, про що домовились"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </section>

        {/* ── Історія ── */}
        {lead.history?.length > 0 && (
          <section className="modal__section">
            <h3 className="modal__section-title">Історія</h3>

            <ul className="history">
              {lead.history.map((entry) => (
                <li key={entry.id} className="history__item">
                  <span className="history__date">{formatDate(entry.created_at, true)}</span>

                  <span className="history__text">
                    {HISTORY_LABELS[entry.field] || entry.field}:{' '}
                    {entry.field === 'status' ? (
                      <>
                        {statusLabel(entry.old_value) || '—'} →{' '}
                        <strong>{statusLabel(entry.new_value)}</strong>
                      </>
                    ) : (
                      <em>{entry.new_value || 'очищено'}</em>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="modal__save" onClick={save} disabled={busy}>
            {busy ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeadModal
