export const DEFAULT_VARIANT = 'kharkiv'
export const CITY_VARIANTS = ['kharkiv', 'kyiv']

export const isKnownVariant = (variant) => CITY_VARIANTS.includes(variant)

export const normalizeVariant = (variant = DEFAULT_VARIANT) =>
  isKnownVariant(variant) ? variant : DEFAULT_VARIANT

export const getCityPrefix = (variant = DEFAULT_VARIANT) =>
  normalizeVariant(variant) === 'kyiv' ? '/kyiv' : ''

export const getRoute = (variant = DEFAULT_VARIANT, path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (normalizedPath === '/') {
    return getCityPrefix(variant) || '/'
  }

  return `${getCityPrefix(variant)}${normalizedPath}`
}

export const getHomeRoute = (variant = DEFAULT_VARIANT) => getRoute(variant, '/')
