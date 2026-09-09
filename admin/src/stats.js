/** Спільні розрахунки для Огляду й Подій. */

export const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0)

/** Дельта до попереднього періоду у відсотках; null — нема з чим порівнювати. */
export const delta = (current, previous) => {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

export const dayLabel = (iso) => {
  const [, month, day] = iso.split('-')
  return `${day}.${month}`
}

/** Кожен день періоду у форматі YYYY-MM-DD, від найдавнішого до сьогодні. */
export const periodDays = (days) => {
  const result = []
  const cursor = new Date()
  cursor.setDate(cursor.getDate() - days + 1)

  for (let i = 0; i < days; i += 1) {
    result.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

/**
 * База повертає тільки дні, де щось було. Для графіка потрібен
 * кожен день періоду — інакше пропуски виглядають як стрибки.
 * `series` — { назва: [{ day, <valueKey> }] }, у результаті
 * кожен день має поле на кожну назву.
 */
export const fillDays = (days, series, valueKey = 'count') => {
  const maps = Object.fromEntries(
    Object.entries(series).map(([name, rows]) => [
      name,
      Object.fromEntries(rows.map((row) => [row.day, Number(row[valueKey] || 0)])),
    ]),
  )

  return periodDays(days).map((iso) => ({
    day: iso,
    label: dayLabel(iso),
    ...Object.fromEntries(Object.keys(series).map((name) => [name, maps[name][iso] || 0])),
  }))
}
