export const formatDate = (value, withSeconds = false) => {
  if (!value) return ''

  const date = new Date(value.replace(' ', 'T') + 'Z')

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
  })
}
