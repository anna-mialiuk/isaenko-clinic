import { useState } from 'react'

import HeaderContent from '../../components/HeaderContent/HeaderContent'
import MobileMenu from '../../components/MobileMenu/MobileMenu'
import StickyHeader from '../../components/StickyHeader/StickyHeader'

import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import useCityVariantNavigation from '../../hooks/useCityVariantNavigation'
import useStickyHeaderVisibility from '../../hooks/useStickyHeaderVisibility'

import './DirectionHeader.sass'

function DirectionHeader({ variant = 'kharkiv' }) {
  const [language, setLanguage] = useState('uk')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { city, currentCity, handleCityChange } = useCityVariantNavigation(variant)

  const isStickyVisible = useStickyHeaderVisibility({
    disabled: isMenuOpen,
  })

  useBodyScrollLock(isMenuOpen)

  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <StickyHeader
        isVisible={isStickyVisible}
        city={city}
        setCity={handleCityChange}
        currentCity={currentCity}
        language={language}
        setLanguage={setLanguage}
        onMenuOpen={openMenu}
        variant={city}
      />

      <header className="direction-header">
        <div className="container direction-header__container">
          <HeaderContent
            block="direction-header"
            variant={city}
            city={city}
            setCity={handleCityChange}
            currentCity={currentCity}
            language={language}
            setLanguage={setLanguage}
            onMenuOpen={openMenu}
          />
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        language={language}
        setLanguage={setLanguage}
        variant={city}
      />
    </>
  )
}

export default DirectionHeader
