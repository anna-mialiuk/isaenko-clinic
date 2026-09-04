import { useEffect, useState } from 'react'

import { api } from './api'

import './CrmSettings.sass'

const PALETTE = [
  '#4d48b4',
  '#2b8ad9',
  '#3d9970',
  '#d99a2b',
  '#d1435b',
  '#8a5cd9',
  '#2ba8a8',
  '#8a8aa3',
]

/** Латиниця, цифри й підкреслення: id потрапляє в базу і в URL фільтрів. */
const slugify = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9а-яїієґ]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30) || `status_${Date.now()}`

function CrmSettings() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .statuses()
      .then((data) => setItems(data.items.filter((item) => !Number(item.is_archived))))
      .catch(() => setError('Не вдалося завантажити статуси'))
  }, [])

  const update = (index, patch) => {
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    setSaved(false)
  }

  const move = (index, delta) => {
    const target = index + delta

    if (target < 0 || target >= items.length) return

    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]

    setItems(next)
    setSaved(false)
  }

  const remove = (index) => {
    setItems((list) => list.filter((_, i) => i !== index))
    setSaved(false)
  }

  const add = () => {
    setItems((list) => [
      ...list,
      { id: `status_${Date.now()}`, label: '', color: PALETTE[list.length % PALETTE.length] },
    ])
    setSaved(false)
  }

  const save = async () => {
    setBusy(true)
    setError('')

    // Порожні назви відкидаємо тут, а не на сервері: так користувач
    // одразу бачить, що саме не збережеться.
    const payload = items
      .filter((item) => item.label.trim() !== '')
      .map((item) => ({
        id: item.id || slugify(item.label),
        label: item.label.trim(),
        color: item.color,
      }))

    if (!payload.length) {
      setError('Має лишитись хоча б один статус')
      setBusy(false)
      return
    }

    try {
      await api.saveStatuses(payload)
      setSaved(true)
    } catch {
      setError('Не вдалося зберегти')
    } finally {
      setBusy(false)
    }
  }

  if (error && !items) return <p className="page__error">{error}</p>
  if (!items) return <p className="page__empty">Завантаження…</p>

  return (
    <div className="settings">
      <header className="settings__header">
        <h1 className="page__title">Налаштування CRM</h1>
      </header>

      <section className="panel panel--wide">
        <h2 className="panel__title">Статуси воронки</h2>

        <p className="settings__hint">
          Порядок статусів — це порядок колонок у канбані й етапів у картці заявки.
        </p>

        <ul className="statuses">
          {items.map((item, index) => (
            <li key={item.id} className="statuses__row">
              <span className="statuses__dot" style={{ background: item.color }} />

              <input
                className="statuses__label"
                placeholder="Назва статусу"
                value={item.label}
                onChange={(event) => update(index, { label: event.target.value })}
              />

              <span className="statuses__colors">
                {PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`statuses__color ${item.color === color ? 'is-active' : ''}`}
                    style={{ background: color }}
                    aria-label={`Колір ${color}`}
                    onClick={() => update(index, { color })}
                  />
                ))}
              </span>

              <span className="statuses__actions">
                <button
                  type="button"
                  className="statuses__move"
                  disabled={index === 0}
                  aria-label="Вище"
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="statuses__move"
                  disabled={index === items.length - 1}
                  aria-label="Нижче"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="statuses__remove"
                  aria-label="Прибрати"
                  onClick={() => remove(index)}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>

        <button type="button" className="settings__add" onClick={add}>
          Додати статус
        </button>

        <p className="settings__note">
          Прибраний статус не видаляється з бази: заявки, що вже в ньому, лишаються доступними,
          просто колонка зникає з канбану. Повернути статус можна, створивши його з тією самою
          назвою.
        </p>

        {error && <p className="page__error settings__error">{error}</p>}

        <div className="settings__actions">
          {saved && <span className="settings__saved">Збережено</span>}

          <button type="button" className="settings__save" onClick={save} disabled={busy}>
            {busy ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CrmSettings
