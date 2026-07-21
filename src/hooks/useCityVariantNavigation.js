import { useNavigate } from 'react-router-dom'

import { cities } from '../data/cities'
import { getHomeRoute, normalizeVariant } from '../utils/getRoute'

function useCityVariantNavigation(variant = 'kharkiv') {
  const navigate = useNavigate()
  const city = normalizeVariant(variant)
  const currentCity = cities[city] || cities.kharkiv

  const handleCityChange = (cityId) => {
    navigate(getHomeRoute(cityId))
  }

  return {
    city,
    currentCity,
    handleCityChange,
  }
}

export default useCityVariantNavigation
