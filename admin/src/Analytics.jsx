import { useEffect, useMemo, useState } from 'react'

import { api } from './api'
import { SeriesChart, Sparkline } from './charts'
import { delta, fillDays, sum } from './stats'

// Сітка, картки й шапка сторінки спільні з Оглядом.
import './Dashboard.sass'
import './Analytics.sass'

const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4']

/** Ключ серії має бути безпечним для id градієнта в SVG. */
// У старих рядках event_name буває NULL — приводимо до рядка.
const seriesKey = (name) => `e_${String(name ?? '').replace(/[^a-z0-9]/gi, '_')}`

function Delta({ value }) {
  if (value == null) return <span className="events__delta">—</span>

  return (
    <span className={`events__delta ${value >= 0 ? 'is-up' : 'is-down'}`}>
      {value >= 0 ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  )
}

/** Розбивка події за джерелом і кампанією. */
function Sources({ rows }) {
  const total = sum(rows, 'count')
  const max = Math.max(1, ...rows.map((row) => Number(row.count)))

  if (!rows.length) return <p className="panel__empty">Немає даних за період</p>

  return (
    <ul className="breakdown">
      {rows.slice(0, 8).map((row) => (
        <li key={`${row.source}|${row.campaign}`} className="breakdown__row">
          <span className="breakdown__name">
            {row.source === 'direct' ? 'прямий' : row.source}
            {row.campaign && <span className="breakdown__campaign">{row.campaign}</span>}
          </span>
          <span className="breakdown__track">
            <span
              className="breakdown__fill"
              style={{ width: `${(Number(row.count) / max) * 100}%` }}
            />
          </span>
          <span className="breakdown__count">{row.count}</span>
          <span className="breakdown__share">{Math.round((row.count / total) * 100)}%</span>
        </li>
      ))}
    </ul>
  )
}

function Analytics() {
  const [data, setData] = useState(null)
  const [days, setDays] = useState(30)
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .events(days)
      .then(setData)
      .catch(() => setError('Не вдалося завантажити дані'))
  }, [days])

  // Одна таблиця «день × подія» для спарклайнів і розгорнутого графіка.
  const series = useMemo(() => {
    if (!data) return []

    const grouped = {}
    data.by_day.forEach((row) => {
      const key = seriesKey(row.event_name)
      ;(grouped[key] ||= []).push(row)
    })

    return fillDays(days, grouped)
  }, [data, days])

  if (error) return <p className="page__error">{error}</p>
  if (!data) return <p className="page__empty">Завантаження…</p>

  const total = sum(data.events, 'count')

  return (
    <div className="dash">
      <header className="dash__header">
        <div>
          <h1 className="page__title">Події</h1>
          <p className="dash__subtitle">
            {total} подій за період · клік по рядку розгортає динаміку і джерела
          </p>
        </div>

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

      <section className="panel panel--wide">
        {data.events.length ? (
          <ul className="events">
            {data.events.map((event, index) => {
              const key = seriesKey(event.event_name)
              const color = SERIES[index % SERIES.length]
              const name = event.event_name || ''
              const isOpen = open === name

              return (
                <li key={name || 'unnamed'} className={`events__item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="events__row"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : name)}
                  >
                    <span className="events__dot" style={{ background: `var(${color})` }} />
                    <span className="events__name">{event.event_name || '—'}</span>
                    <span className="events__spark">
                      <Sparkline data={series} dataKey={key} color={color} />
                    </span>
                    <span className="events__count">{event.count}</span>
                    <Delta value={delta(event.count, event.previous)} />
                    <span className="events__chevron" aria-hidden="true" />
                  </button>

                  {isOpen && (
                    <div className="events__details">
                      <div className="events__chart">
                        <SeriesChart
                          data={series}
                          dataKey={key}
                          color={color}
                          name={event.event_name}
                        />
                      </div>
                      <div className="events__sources">
                        <h3 className="events__subtitle">Джерела й кампанії</h3>
                        <Sources
                          rows={data.by_source.filter((row) => (row.event_name || '') === name)}
                        />
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="panel__empty">За цей період подій не було</p>
        )}
      </section>

      <p className="dash__note">
        Тут події з власного трекінгу сайту (клієнт → /api/attr). generate_lead відправляється з
        сервера в GA4 через Measurement Protocol і рахується як заявки на Огляді.
      </p>
    </div>
  )
}

export default Analytics
