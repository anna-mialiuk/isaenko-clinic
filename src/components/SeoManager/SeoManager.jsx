import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { SITE_URL, DEFAULT_OG_IMAGE, CLINIC_SCHEMA_BASE } from '../../config/seoConfig'
import { directionRoutes } from '../../data/directionRoutes'
import { useLocale } from '../../hooks/useLocale'

const pageKeys = {
  '/about': 'about',
  '/team': 'team',
  '/hospital': 'hospital',
  '/contacts': 'contacts',
  '/multimodal': 'multimodal',
}

const getAbsoluteUrl = (pathname) => `${SITE_URL}${pathname === '/' ? '' : pathname}`

const normalizePath = (pathname) => {
  if (pathname === '/kyiv') return '/'
  if (pathname.startsWith('/kyiv/')) return pathname.replace('/kyiv', '')
  return pathname
}

const getOrCreateMeta = (selector, createAttributes = {}) => {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')

    Object.entries(createAttributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    document.head.appendChild(element)
  }

  return element
}

const getOrCreateLink = (selector, createAttributes = {}) => {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('link')

    Object.entries(createAttributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    document.head.appendChild(element)
  }

  return element
}

const setMeta = (name, content) => {
  const element = getOrCreateMeta(`meta[name="${name}"]`, { name })
  element.setAttribute('content', content)
}

const setPropertyMeta = (property, content) => {
  const element = getOrCreateMeta(`meta[property="${property}"]`, { property })
  element.setAttribute('content', content)
}

const setCanonical = (url) => {
  const element = getOrCreateLink('link[rel="canonical"]', { rel: 'canonical' })
  element.setAttribute('href', url)
}

const setAlternate = (url) => {
  const element = getOrCreateLink('link[rel="alternate"][hreflang="x-default"]', {
    rel: 'alternate',
    hreflang: 'x-default',
  })
  element.setAttribute('href', url)
}

const setJsonLd = (schema) => {
  const id = 'structured-data'
  let element = document.getElementById(id)

  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(schema)
}

const getSeoContent = ({ pathname, seo, directionsContent }) => {
  const normalizedPath = normalizePath(pathname)

  if (normalizedPath === '/') {
    return { ...seo.home, isNotFound: false }
  }

  const pageKey = pageKeys[normalizedPath]

  if (pageKey && seo[pageKey]) {
    return { ...seo[pageKey], isNotFound: false }
  }

  const directionRoute = directionRoutes.find((route) => route.path === normalizedPath)

  if (directionRoute) {
    const direction = directionsContent?.[directionRoute.slug]

    if (direction) {
      return {
        title: `${direction.title} — Dr. Isaenko`,
        description: seo.directionDescription(direction.title),
        isNotFound: false,
      }
    }
  }

  return {
    ...(seo.notFound || {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    }),
    isNotFound: true,
  }
}

const getBreadcrumbSchema = (pathname, title) => {
  const homeUrl = getAbsoluteUrl('/')
  const currentUrl = getAbsoluteUrl(pathname)

  if (pathname === '/' || pathname === '/kyiv') {
    return null
  }

  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Dr. Isaenko',
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title.replace(' — Dr. Isaenko', ''),
        item: currentUrl,
      },
    ],
  }
}

const getSchema = ({ pathname, title, description }) => {
  const breadcrumbSchema = getBreadcrumbSchema(pathname, title)

  const schemas = [
    {
      ...CLINIC_SCHEMA_BASE,
      description,
      address: [
        {
          '@type': 'PostalAddress',
          addressLocality: 'Kharkiv',
          addressCountry: 'UA',
        },
        {
          '@type': 'PostalAddress',
          addressLocality: 'Kyiv',
          addressCountry: 'UA',
        },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '10:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '10:00',
          closes: '18:00',
        },
      ],
    },
    {
      '@type': 'WebSite',
      name: 'Dr. Isaenko',
      url: SITE_URL,
      inLanguage: ['uk-UA', 'ru-UA', 'en'],
    },
  ]

  if (breadcrumbSchema) {
    schemas.push(breadcrumbSchema)
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  }
}

function SeoManager() {
  const { language, seo, directionsContent } = useLocale()
  const { pathname } = useLocation()

  useEffect(() => {
    const content = getSeoContent({ pathname, seo, directionsContent })
    const title = content?.title || seo.defaultTitle
    const description = content?.description || seo.defaultDescription
    const canonicalUrl = getAbsoluteUrl(pathname)

    document.title = title
    document.documentElement.lang = language

    setMeta('description', description)
    setMeta('robots', content.isNotFound ? 'noindex, nofollow' : 'index, follow')

    const canonicalPath = getAbsoluteUrl(normalizePath(pathname))

    setCanonical(canonicalPath)
    setAlternate(canonicalPath)

    setPropertyMeta('og:type', 'website')
    setPropertyMeta('og:site_name', seo.siteName || 'Dr. Isaenko')
    setPropertyMeta('og:title', title)
    setPropertyMeta('og:description', description)
    setPropertyMeta('og:url', canonicalUrl)
    setPropertyMeta('og:image', DEFAULT_OG_IMAGE)
    setPropertyMeta('og:locale', language === 'uk' ? 'uk_UA' : language)

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', DEFAULT_OG_IMAGE)

    setJsonLd(getSchema({ pathname, title, description }))
  }, [directionsContent, language, pathname, seo])

  return null
}

export default SeoManager
