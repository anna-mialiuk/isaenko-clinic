import { useLanguage } from '../../hooks/useLanguage'

function LanguageSelect() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="hero__language">
      <button type="button" className="hero__select">
        {language === 'uk' && 'UK'}
        {language === 'en' && 'EN'}
        {language === 'ru' && 'RU'}

        <img src="/src/assets/images/icons/white-arrow.svg" alt="" />
      </button>

      <div className="hero__language-dropdown">
        <button
          type="button"
          className={language === 'en' ? 'active' : ''}
          onClick={() => setLanguage('en')}
        >
          English
        </button>

        <button
          type="button"
          className={language === 'uk' ? 'active' : ''}
          onClick={() => setLanguage('uk')}
        >
          Українська
        </button>

        <button
          type="button"
          className={language === 'ru' ? 'active' : ''}
          onClick={() => setLanguage('ru')}
        >
          Русский
        </button>
      </div>
    </div>
  )
}

export default LanguageSelect
