export function formatPrice(price, language) {
  if (!price) return ''

  if (language === 'en') {
    return price.replace(/\s*грн\.?/i, ' UAH').trim()
  }

  return price
}
