import { useLanguage } from '../../hooks/useLanguage'
import { cities } from '../../data/cities'

function CitySelect({ city, setCity, currentCity }) {
  const { language } = useLanguage()

  return (
    <div className="hero__city">
      <button type="button" className="hero__select">
        {currentCity.name[language]}
        <img src="/images/icons/white-arrow.svg" alt="" />
      </button>

      <div className="hero__city-dropdown">
        <button
          type="button"
          className={city === 'kyiv' ? 'active' : ''}
          onClick={() => setCity('kyiv')}
        >
          {cities.kyiv.name[language]}
        </button>

        <button
          type="button"
          className={city === 'kharkiv' ? 'active' : ''}
          onClick={() => setCity('kharkiv')}
        >
          {cities.kharkiv.name[language]}
        </button>
      </div>
    </div>
  )
}

export default CitySelect
