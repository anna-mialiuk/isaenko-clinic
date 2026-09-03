import { useEffect, useState } from 'react'

import { api } from './api'
import { formatDate } from './formatDate'

import './Errors.sass'

const SOURCE_LABELS = {
  telegram: 'Telegram',
  email: 'Пошта',
  ga4_mp: 'GA4',
  form: 'Форма',
  db: 'База',
}

const LEVEL_LABELS = {
  error: 'Помилка',
  warning: 'Попередження',
}

function Errors() {
  // Разом із записами зберігаємо фільтр, для якого вони завантажені.
  // Так «завантаження» виводиться зі стану, а не окремим прапорцем,
  // який довелось би вмикати синхронно в ефекті.
  const [loaded, setLoaded] = useState(null)
  const [filter, setFilter] = useState('unresolved')
  const [error, setError] = useState('')

  const items = loaded?.items || []
  const loading = !loaded || loaded.filter !== filter

  // reloadKey змінюється, коли треба перечитати список після невдалого
  // збереження — щоб не тримати окрему функцію, яку ESLint вважає
  // синхронним setState в ефекті.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    api
      .errors({ resolved: filter === 'all' ? '' : filter === 'resolved' ? 1 : 0 })
      .then((data) => {
        if (ignore) return
        setLoaded({ filter, items: data.items })
        setError('')
      })
      .catch(() => {
        if (ignore) return
        setLoaded({ filter, items: [] })
        setError('Не вдалося завантажити лог')
      })

    return () => {
      ignore = true
    }
  }, [filter, reloadKey])

  const toggleResolved = async (item) => {
    const next = item.resolved ? 0 : 1

    // Оптимістично: рядок зникає одразу, якщо не підходить під фільтр.
    setLoaded((state) => {
      const list = state?.items || []

      return {
        ...state,
        items:
          filter === 'all'
            ? list.map((row) => (row.id === item.id ? { ...row, resolved: next } : row))
            : list.filter((row) => row.id !== item.id),
      }
    })

    try {
      await api.resolveError(item.id, next)
    } catch {
      setError('Не вдалося зберегти')
      setReloadKey((key) => key + 1)
    }
  }

  return (
    <div className="errors">
      <header className="errors__header">
        <h1 className="page__title">Помилки</h1>

        <select
          className="errors__filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="unresolved">Нерозібрані</option>
          <option value="resolved">Розібрані</option>
          <option value="all">Усі</option>
        </select>
      </header>

      {error && <p className="page__error">{error}</p>}

      {loading && <p className="page__empty">Завантаження…</p>}

      {!loading && !items.length && (
        <p className="page__empty">
          {filter === 'unresolved' ? 'Нерозібраних помилок немає' : 'Порожньо'}
        </p>
      )}

      <div className="errors__list">
        {items.map((item) => {
          const context = item.context ? JSON.parse(item.context) : null

          return (
            <article key={item.id} className={`issue issue--${item.level}`}>
              <header className="issue__head">
                <span className="issue__source">{SOURCE_LABELS[item.source] || item.source}</span>
                <span className="issue__level">{LEVEL_LABELS[item.level] || item.level}</span>
                <span className="issue__date">{formatDate(item.created_at, true)}</span>
              </header>

              <p className="issue__message">{item.message}</p>

              {context && (
                <dl className="issue__context">
                  {Object.entries(context)
                    .filter(([, value]) => value !== '' && value != null)
                    .map(([key, value]) => (
                      <div key={key} className="issue__row">
                        <dt>{key}</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                </dl>
              )}

              <footer className="issue__foot">
                {item.lead_id && <span className="issue__lead">Заявка #{item.lead_id}</span>}

                <button
                  type="button"
                  className="issue__resolve"
                  onClick={() => toggleResolved(item)}
                >
                  {item.resolved ? 'Повернути в роботу' : 'Розібрано'}
                </button>
              </footer>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Errors
