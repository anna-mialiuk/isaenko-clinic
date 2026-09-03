import { useEffect, useState } from 'react'

import { api } from './api'

import './Analytics.sass'

function Analytics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats(30)
      .then(setData)
      .catch(() => setError('Не вдалося завантажити дані'))
  }, [])

  if (error) return <p className="page__error">{error}</p>
  if (!data) return <p className="page__empty">Завантаження…</p>

  return (
    <div className="dash">
      <h1 className="page__title">Аналітика</h1>

      <section className="panel panel--wide">
        <h2 className="panel__title">Налаштовані події</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Подія</th>
              <th>За 30 днів</th>
              <th>Джерело</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => (
              <tr key={event.event_name}>
                <td>{event.event_name || '—'}</td>
                <td>{event.count}</td>
                <td>клієнт → /api/attr</td>
              </tr>
            ))}
            <tr>
              <td>generate_lead</td>
              <td>{data.leads.total}</td>
              <td>сервер → Measurement Protocol</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="panel panel--wide">
        <h2 className="panel__title">Кліки по днях</h2>

        <table className="table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Кліків</th>
              <th>Відвідувачів</th>
            </tr>
          </thead>
          <tbody>
            {[...data.by_day].reverse().map((day) => (
              <tr key={day.day}>
                <td>{day.day}</td>
                <td>{day.clicks}</td>
                <td>{day.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="dash__note">
        Лог помилок поки не ведеться окремо: помилки форми пишуться в error_log сервера. Якщо
        потрібен їх перегляд тут — це окрема таблиця і запис у неї з contact.php.
      </p>
    </div>
  )
}

export default Analytics
