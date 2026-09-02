import { useEffect, useState } from 'react'

import { api } from './api'

const STATUS_LABELS = {
  new: 'Нові',
  in_progress: 'В роботі',
  booked: 'Записані',
  done: 'Прийшли',
  rejected: 'Відмова',
}

function Bars({ items, labelKey, valueKey, labels }) {
  const max = Math.max(1, ...items.map((item) => Number(item[valueKey])))

  return (
    <ul className="bars">
      {items.map((item) => (
        <li key={item[labelKey]} className="bars__row">
          <span className="bars__label">{labels?.[item[labelKey]] || item[labelKey]}</span>
          <span className="bars__track">
            <span
              className="bars__fill"
              style={{ width: `${(Number(item[valueKey]) / max) * 100}%` }}
            />
          </span>
          <span className="bars__value">{item[valueKey]}</span>
        </li>
      ))}
    </ul>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [days, setDays] = useState(30)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats(days)
      .then(setData)
      .catch(() => setError('Не вдалося завантажити статистику'))
  }, [days])

  if (error) return <p className="crm__error">{error}</p>
  if (!data) return <p className="crm__empty">Завантаження…</p>

  const totalClicks = data.by_day.reduce((sum, day) => sum + Number(day.clicks), 0)
  const totalVisitors = data.by_day.reduce((sum, day) => sum + Number(day.visitors), 0)
  const leadsInPeriod = data.leads.by_day.reduce((sum, day) => sum + Number(day.count), 0)

  const conversion = totalVisitors ? ((leadsInPeriod / totalVisitors) * 100).toFixed(1) : '0'

  return (
    <div className="dash">
      <header className="dash__header">
        <h1 className="crm__title">Дашборд</h1>

        <select
          className="dash__period"
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          <option value={7}>7 днів</option>
          <option value={30}>30 днів</option>
          <option value={90}>90 днів</option>
        </select>
      </header>

      <div className="tiles">
        <div className="tile">
          <span className="tile__value">{leadsInPeriod}</span>
          <span className="tile__label">заявок за період</span>
        </div>
        <div className="tile">
          <span className="tile__value">{totalVisitors}</span>
          <span className="tile__label">відвідувачів з подіями</span>
        </div>
        <div className="tile">
          <span className="tile__value">{totalClicks}</span>
          <span className="tile__label">цільових кліків</span>
        </div>
        <div className="tile">
          <span className="tile__value">{conversion}%</span>
          <span className="tile__label">конверсія в заявку</span>
        </div>
      </div>

      <div className="panels">
        <section className="panel">
          <h2 className="panel__title">Заявки за статусами</h2>
          <Bars
            items={Object.entries(data.leads.by_status).map(([status, count]) => ({
              status,
              count,
            }))}
            labelKey="status"
            valueKey="count"
            labels={STATUS_LABELS}
          />
        </section>

        <section className="panel">
          <h2 className="panel__title">Джерела заявок</h2>
          {data.leads.by_source.length ? (
            <Bars items={data.leads.by_source} labelKey="source" valueKey="count" />
          ) : (
            <p className="panel__empty">Поки немає даних</p>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Події</h2>
          <Bars items={data.events} labelKey="event_name" valueKey="count" />
        </section>

        <section className="panel panel--wide">
          <h2 className="panel__title">Найпопулярніші сторінки</h2>
          <Bars items={data.pages} labelKey="page_location" valueKey="count" />
        </section>
      </div>

      <p className="dash__note">
        Дані з власної бази сайту: кліки, події й заявки. Демографія (стать, вік) і міста доступні
        лише в GA4 через Data API — для цього потрібні службовий обліковий запис і ввімкнений Google
        Signals.
      </p>
    </div>
  )
}

export default Dashboard
