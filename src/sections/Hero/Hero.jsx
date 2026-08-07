import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { heroMedia } from '../../data/heroMedia'

import HeaderContent from '../../components/HeaderContent/HeaderContent'
import MobileMenu from '../../components/MobileMenu/MobileMenu'
import StickyHeader from '../../components/StickyHeader/StickyHeader'

import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import useCityVariantNavigation from '../../hooks/useCityVariantNavigation'
import useHeroPhotoOpacity from '../../hooks/useHeroPhotoOpacity'
import { useLanguage } from '../../hooks/useLanguage'
import { useLocale } from '../../hooks/useLocale'
import useStickyHeaderVisibility from '../../hooks/useStickyHeaderVisibility'
import { getRoute } from '../../utils/getRoute'

import './Hero.sass'

function Hero({ variant = 'kharkiv' }) {
  const heroRef = useRef(null)

  const { language, setLanguage } = useLanguage()
  const { hero: content } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { city, currentCity, handleCityChange } = useCityVariantNavigation(variant)
  const heroData = heroMedia[city] || heroMedia.kharkiv

  const isStickyVisible = useStickyHeaderVisibility({
    disabled: isMenuOpen,
  })

  useHeroPhotoOpacity(heroRef)
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

      <section
        className="hero"
        ref={heroRef}
        style={{
          '--hero-bg': `url(${heroData.background})`,
          '--hero-gradient': 'url(/images/hero/hero-gradient.webp)',
        }}
      >
        <div className="container hero__container">
          <header className="hero__header">
            <HeaderContent
              block="hero"
              variant={city}
              city={city}
              setCity={handleCityChange}
              currentCity={currentCity}
              language={language}
              setLanguage={setLanguage}
              onMenuOpen={openMenu}
            />
          </header>

          <div className="hero__content">
            <h1 className="hero__h1 h1">
              {content.title.map((line, index) => (
                <span key={line}>
                  {line}
                  {index !== content.title.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="hero__paragraph p">
              {content.text.map((line, index) => (
                <span key={line}>
                  {line}
                  {index !== content.text.length - 1 && <br />}
                </span>
              ))}
            </p>

            {content.button && (
              <Link to={getRoute(city, content.button.path)} className="hero__button">
                {content.button.label}
              </Link>
            )}
          </div>
        </div>
      </section>

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

export default Hero
