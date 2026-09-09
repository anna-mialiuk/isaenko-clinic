import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/**
 * Recharts малює в SVG і не розуміє var() у fill усередині градієнтів,
 * тому кольори серій читаємо з токенів один раз на рендер.
 * Тема змінюється через data-theme на <html> — компонент перерендериться
 * разом із батьком, і кольори підхопляться.
 */
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const tooltipStyle = () => ({
  background: token('--surface'),
  border: `1px solid ${token('--border')}`,
  borderRadius: 10,
  boxShadow: token('--shadow-md'),
  color: token('--text'),
  fontSize: 13,
  padding: '8px 12px',
})

const axisTick = () => ({ fill: token('--text-3'), fontSize: 12 })

/** Дрібна крива в KPI-картці: без осей, без сітки, тільки форма. */
export function Sparkline({ data, dataKey, color }) {
  const stroke = token(color)
  const id = `spark-${dataKey}`

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Головний графік: відвідувачі й заявки по днях. */
export function TrendChart({ data }) {
  const visitors = token('--series-1')
  const leads = token('--series-2')

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="trend-visitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={visitors} stopOpacity={0.25} />
            <stop offset="100%" stopColor={visitors} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="trend-leads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={leads} stopOpacity={0.3} />
            <stop offset="100%" stopColor={leads} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={token('--border')} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={axisTick()}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis tick={axisTick()} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle()} cursor={{ stroke: token('--border') }} />
        <Area
          type="monotone"
          name="Відвідувачі"
          dataKey="visitors"
          stroke={visitors}
          strokeWidth={2}
          fill="url(#trend-visitors)"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          name="Заявки"
          dataKey="leads"
          stroke={leads}
          strokeWidth={2}
          fill="url(#trend-leads)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/** Стовпчики: події або будь-який список «назва — кількість». */
export function ColumnChart({ data, color = '--series-1' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        barCategoryGap="30%"
      >
        <CartesianGrid vertical={false} stroke={token('--border')} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={axisTick()} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={axisTick()} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: token('--surface-2') }} />
        <Bar
          dataKey="count"
          name="Кількість"
          fill={token(color)}
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Кільце прогресу для списку джерел: частка в загальній кількості. */
export function Ring({ value, color = '--series-1' }) {
  const size = 34
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, value)))

  return (
    <svg
      className="ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`var(${color})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

/** Одна серія по днях — розгорнута картка події. */
export function SeriesChart({ data, dataKey, color = '--series-1', name }) {
  const stroke = token(color)
  const id = `series-${dataKey}`

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={token('--border')} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={axisTick()}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis tick={axisTick()} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle()} cursor={{ stroke: token('--border') }} />
        <Area
          type="monotone"
          name={name}
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
