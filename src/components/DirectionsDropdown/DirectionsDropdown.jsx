import { NavLink } from 'react-router-dom'

import { getDirectionsNavigation } from '../../data/navigation'
import { useLanguage } from '../../hooks/useLanguage'

function DirectionsDropdown({ variant = 'kharkiv' }) {
  const { language } = useLanguage()

  const directionsNavigation = getDirectionsNavigation(variant, language)

  const buttonLabels = {
    uk: 'Напрями',
    ru: 'Направления',
    en: 'Directions',
  }

  return (
    <div className="hero__directions-wrapper">
      <button type="button" className="hero__directions">
        <img
          src="/src/assets/images/icons/directions-icon.svg"
          alt=""
          className="hero__directions-icon"
        />

        {buttonLabels[language]}
      </button>

      <div className="hero__directions-dropdown">
        {directionsNavigation.map((item) => (
          <NavLink
            key={item.slug}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default DirectionsDropdown
