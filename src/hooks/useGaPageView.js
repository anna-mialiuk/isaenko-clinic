import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { getPageType, getCityFromPath } from '../utils/getPageType'

export const useGaPageView = () => {
  const { pathname, search } = useLocation()
  const lastSentPath = useRef(null)

  useEffect(() => {
    if (typeof window.gtag !== 'function') return

    const pagePath = `${pathname}${search}`

    if (lastSentPath.current === pagePath) return
    lastSentPath.current = pagePath

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer || undefined,
      page_type: getPageType(pathname),
      city: getCityFromPath(pathname),
    })
  }, [pathname, search])
}
