import { useEffect, useMemo, useState } from 'react'

import { api } from './api'
import { ColumnChart, Ring, Sparkline, TrendChart } from './charts'
import { IconCursor, IconEye, IconInbox, IconTarget } from './Icons'
import { delta, fillDays, sum } from './stats'

import './Dashboard.sass'

const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4']

/** Повний URL у підписі нечитабельний — лишаємо шлях і мітки. */
const shortenUrl = (value) => {
  try {
    const url = new URL(value)
    return (url.pathname === '/' ? '/' : url.pathname) + url.search
  } catch {
    return value
  }
}

function Kpi({ icon: Icon, label, value, change, series, dataKey, color }) {
  const tone = change == null ? '' : change >= 0 ? 'is-up' : 'is-down'

  return (
    <article className="kpi">
      <div className="kpi__head">
        <span className="kpi__icon" style={{ color: `var(${color})` }}>
          <Icon />
        </span>
        <span className="kpi__label">{label}</span>
      </div>

      <div className="kpi__row">
        <span className="kpi__value">{value}</span>
        {change != null && (
          <span className={`kpi__delta ${tone}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>

      <div className="kpi__spark">
        <Sparkline data={series} dataKey={dataKey} color={color} />
      </div>
    </article>
  )
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
  const [statusLabels, setStatusLabels] = useState({})
  const [days, setDays] = useState(30)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .stats(days)
      .then(setData)
      .catch(() => setError('Не вдалося завантажити статистику'))
  }, [days])

  // Назви статусів живуть у базі — беремо їх, а не зашиті в код.
  useEffect(() => {
    api
      .statuses()
      .then((response) =>
        setStatusLabels(Object.fromEntries(response.items.map((item) => [item.id, item.label]))),
      )
      .catch(() => {})
  }, [])

  const series = useMemo(() => {
    if (!data) return []

    const visitors = fillDays(days, { visitors: data.by_day }, 'visitors')
    const clicks = fillDays(days, { clicks: data.by_day }, 'clicks')
    const leads = fillDays(days, { leads: data.leads.by_day })

    return visitors.map((row, index) => ({ ...row, ...clicks[index], ...leads[index] }))
  }, [data, days])

  if (error) return <p className="page__error">{error}</p>
  if (!data) return <p className="page__empty">Завантаження…</p>

  const totalClicks = sum(series, 'clicks')
  const totalVisitors = sum(series, 'visitors')
  const leadsInPeriod = sum(series, 'leads')
  const previous = data.previous || {}

  const conversion = totalVisitors ? (leadsInPeriod / totalVisitors) * 100 : 0
  const previousConversion = previous.visitors ? (previous.leads / previous.visitors) * 100 : 0

  const sourcesTotal = sum(data.leads.by_source, 'count')
  const sources = data.leads.by_source.slice(0, 6)

  const events = data.events.map((event) => ({
    label: event.event_name || '—',
    count: Number(event.count),
  }))

  return (
    <div className="dash">
      <header className="dash__header">
        <div>
          <h1 className="page__title">Огляд</h1>
          <p className="dash__subtitle">Заявки, трафік і джерела за вибраний період</p>
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

      <div className="kpis">
        <Kpi
          icon={IconInbox}
          label="Заявки"
          value={leadsInPeriod}
          change={delta(leadsInPeriod, previous.leads)}
          series={series}
          dataKey="leads"
          color="--series-2"
        />
        <Kpi
          icon={IconEye}
          label="Відвідувачі з подіями"
          value={totalVisitors}
          change={delta(totalVisitors, previous.visitors)}
          series={series}
          dataKey="visitors"
          color="--series-1"
        />
        <Kpi
          icon={IconCursor}
          label="Цільові кліки"
          value={totalClicks}
          change={delta(totalClicks, previous.clicks)}
          series={series}
          dataKey="clicks"
          color="--series-3"
        />
        <Kpi
          icon={IconTarget}
          label="Конверсія в заявку"
          value={`${conversion.toFixed(1)}%`}
          change={previousConversion ? Math.round(conversion - previousConversion) : null}
          series={series}
          dataKey="leads"
          color="--series-4"
        />
      </div>

      <div className="panels panels--main">
        <section className="panel panel--trend">
          <div className="panel__head">
            <h2 className="panel__title">Динаміка</h2>
            <ul className="legend">
              <li className="legend__item" style={{ '--dot': 'var(--series-1)' }}>
                Відвідувачі
              </li>
              <li className="legend__item" style={{ '--dot': 'var(--series-2)' }}>
                Заявки
              </li>
            </ul>
          </div>
          <TrendChart data={series} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Джерела заявок</h2>
          {sources.length ? (
            <ul className="sources">
              {sources.map((source, index) => {
                const share = sourcesTotal ? Number(source.count) / sourcesTotal : 0
                const color = SERIES[index % SERIES.length]

                return (
                  <li key={source.source} className="sources__row">
                    <span className="sources__dot" style={{ background: `var(${color})` }} />
                    <span className="sources__name">
                      {source.source === 'direct' ? 'прямий' : source.source}
                    </span>
                    <span className="sources__count">{source.count}</span>
                    <span className="sources__share">{Math.round(share * 100)}%</span>
                    <Ring value={share} color={color} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="panel__empty">Поки немає заявок за цей період</p>
          )}
        </section>
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
            labels={statusLabels}
          />
        </section>

        <section className="panel">
          <h2 className="panel__title">Події</h2>
          {events.length ? (
            <ColumnChart data={events} />
          ) : (
            <p className="panel__empty">Поки немає подій</p>
          )}
        </section>

        <section className="panel panel--wide">
          <h2 className="panel__title">Найпопулярніші сторінки</h2>
          <Bars
            items={data.pages.map((page) => ({
              ...page,
              page_location: shortenUrl(page.page_location),
            }))}
            labelKey="page_location"
            valueKey="count"
          />
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
