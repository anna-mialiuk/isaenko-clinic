import HeaderContent from '../HeaderContent/HeaderContent'
import './StickyHeader.sass'

function StickyHeader({
  isVisible,
  city,
  setCity,
  currentCity,
  language,
  setLanguage,
  onMenuOpen,
  variant = 'kharkiv',
}) {
  return (
    <header className={`sticky-header ${isVisible ? 'sticky-header--visible' : ''}`}>
      <div className="container sticky-header__container">
        <HeaderContent
          block="sticky-header"
          variant={variant}
          city={city}
          setCity={setCity}
          currentCity={currentCity}
          language={language}
          setLanguage={setLanguage}
          onMenuOpen={onMenuOpen}
        />
      </div>
    </header>
  )
}

export default StickyHeader
