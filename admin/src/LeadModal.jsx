import { useState } from 'react'

import { api } from './api'

const FIELDS = [
  ['Створено', 'created_at'],
  ['Імʼя', 'name'],
  ['Телефон', 'phone'],
  ['Повідомлення', 'message'],
  ['Форма', 'form_name'],
  ['Сторінка', 'page'],
  ['Мова', 'language'],
  ['Джерело', 'utm_source'],
  ['Канал', 'utm_medium'],
  ['Кампанія', 'utm_campaign'],
  ['ID кампанії', 'cmp_id'],
  ['Платформа', 'src_pl'],
  ['gclid', 'gclid'],
  ['fbclid', 'fbclid'],
  ['client_id GA4', 'client_id'],
  ['cid', 'cid'],
]

function LeadModal({ lead, statuses, statusLabels, onClose, onSaved }) {
  const [status, setStatus] = useState(lead.status)
  const [comment, setComment] = useState(lead.comment || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__box" onClick={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h2 className="modal__title">Заявка #{lead.id}</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <dl className="modal__fields">
          {FIELDS.map(([label, key]) =>
            lead[key] ? (
              <div key={key} className="modal__row">
                <dt>{label}</dt>
                <dd>{lead[key]}</dd>
              </div>
            ) : null,
          )}
        </dl>

        <label className="modal__label">
          Статус
          <select
            className="modal__select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item] || item}
              </option>
            ))}
          </select>
        </label>

        <label className="modal__label">
          Коментар
          <textarea
            className="modal__textarea"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>

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
