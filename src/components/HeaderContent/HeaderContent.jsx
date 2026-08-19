import { Link } from 'react-router-dom'

import CitySelect from '../CitySelect/CitySelect'
import LanguageSelect from '../LanguageSelect/LanguageSelect'
import DirectionsDropdown from '../DirectionsDropdown/DirectionsDropdown'
import HeaderNavigation from '../HeaderNavigation/HeaderNavigation'
import HeroActions from '../HeroActions/HeroActions'
import { getHomeRoute } from '../../utils/getRoute'
import { useLanguage } from '../../hooks/useLanguage'
import { useLocale } from '../../hooks/useLocale'
import { logos } from '../../utils/getLogo'
import { trackEvent } from '../../utils/gaEvent'

function HeaderContent({
  block,
  variant = 'kharkiv',
  city,
  setCity,
  currentCity,
  language,
  setLanguage,
  onMenuOpen,
}) {
  const { language: currentLanguage } = useLanguage()
  const { common } = useLocale()

  return (
    <>
      <div className={`${block}__top`}>
        <Link to={getHomeRoute(variant)} className={`${block}__logo`}>
          <img src={logos[currentLanguage]} alt="Dr. Isaenko" />
        </Link>

        <div className={`${block}__contacts`}>
          <CitySelect city={city} setCity={setCity} currentCity={currentCity} />

          <a
            href={`tel:${currentCity.phoneLink}`}
            onClick={() => trackEvent('click_phone', { phone_place: 'header', city: variant })}
          >
            {currentCity.phone}
          </a>

          <LanguageSelect language={language} setLanguage={setLanguage} />
        </div>

        <button
          type="button"
          className={`${block}__burger`}
          onClick={onMenuOpen}
          aria-label={common.openMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`${block}__bottom`}>
        <div className={`${block}__menu`}>
          <DirectionsDropdown variant={variant} />

          <HeaderNavigation variant={variant} className={`${block}__nav`} />
        </div>

        <HeroActions />
      </div>
    </>
  )
}

export default HeaderContent
