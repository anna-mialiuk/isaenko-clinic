import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import HeroActions from '../HeroActions/HeroActions'
import { getDirectionsNavigation, getMainNavigation } from '../../data/navigation'
import { darkLogos } from '../../utils/getDarkLogo'
import { useLanguage } from '../../hooks/useLanguage'
import { getHomeRoute } from '../../utils/getRoute'

import './MobileMenu.sass'

const languages = [
  { id: 'en', label: 'EN' },
  { id: 'uk', label: 'UK' },
  { id: 'ru', label: 'RU' },
]

const labels = {
  uk: {
    directions: 'Напрями',
    close: 'Закрити меню',
  },
  ru: {
    directions: 'Направления',
    close: 'Закрыть меню',
  },
  en: {
    directions: 'Directions',
    close: 'Close menu',
  },
}

function MobileMenu({ isOpen, onClose, variant = 'kharkiv' }) {
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false)
  const { language, setLanguage } = useLanguage()

  const mainNavigation = getMainNavigation(variant, language)
  const directionsNavigation = getDirectionsNavigation(variant, language)
  const t = labels[language]

  return (
    <div className={`mobile-menu ${isOpen ? 'mobile-menu--active' : ''}`}>
      <div className="mobile-menu__top">
        <Link to={getHomeRoute(variant)} className="mobile-menu__logo" onClick={onClose}>
          <img src={darkLogos[language]} alt="Dr. Isaenko" />
        </Link>

        <div className="mobile-menu__languages">
          {languages.map((item) => (
            <button
              key={item.id}
              type="button"
              className={language === item.id ? 'active' : ''}
              onClick={() => setLanguage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button type="button" className="mobile-menu__close" onClick={onClose} aria-label={t.close}>
          ×
        </button>
      </div>

      <div className="mobile-menu__directions">
        <button
          type="button"
          className={`mobile-menu__directions-button ${isDirectionsOpen ? 'active' : ''}`}
          onClick={() => setIsDirectionsOpen((isOpen) => !isOpen)}
        >
          {t.directions}
          <span className={isDirectionsOpen ? 'active' : ''}>⌃</span>
        </button>

        {isDirectionsOpen && (
          <div className="mobile-menu__directions-list">
            {directionsNavigation.map((item) => (
              <Link key={item.slug} to={item.path} onClick={onClose}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="mobile-menu__nav">
        {mainNavigation.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mobile-menu__actions">
        <HeroActions />
      </div>
    </div>
  )
}

export default MobileMenu
