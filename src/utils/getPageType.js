import { directionRoutes } from '../data/directionRoutes'

const KNOWN_TYPES = {
  '/': 'home',
  '/about': 'about',
  '/team': 'specialist',
  '/contacts': 'contacts',
  '/hospital': 'other',
  '/multimodal': 'other',
}

const directionPaths = new Set(directionRoutes.map((route) => route.path))

const stripCity = (pathname) => {
  if (pathname === '/kyiv') return '/'
  if (pathname.startsWith('/kyiv/')) return pathname.replace('/kyiv', '')
  return pathname
}

export const getPageType = (pathname) => {
  const path = stripCity(pathname).replace(/\/$/, '') || '/'

  if (KNOWN_TYPES[path]) return KNOWN_TYPES[path]
  if (directionPaths.has(path)) return 'direction'

  return 'other'
}

export const getCityFromPath = (pathname) =>
  pathname === '/kyiv' || pathname.startsWith('/kyiv/') ? 'kyiv' : 'kharkiv'
