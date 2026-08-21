import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { captureAttribution } from '../utils/attribution'
import { initClickTracking } from '../utils/clickTracking'
import { warmUpGtagCache } from '../utils/gaIdentifiers'

export const useAttributionCapture = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    initClickTracking()
    warmUpGtagCache()
  }, [])

  useEffect(() => {
    captureAttribution()
  }, [pathname, search])
}
