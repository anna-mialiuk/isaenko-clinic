import SmartLink from '../../components/SmartLink/SmartLink'
import InfoCard from '../../components/InfoCard/InfoCard'

import './StatsSection.sass'

function StatsSection({ stats, buttonText, buttonLink, className = '' }) {
  return (
    <section className={`stats-section ${className}`}>
      <div className="stats-section__container container">
        <div className="stats-section__grid">
          {stats.map((item) => (
            <InfoCard key={item.id} value={item.value} text={item.text} />
          ))}
        </div>

        {buttonText && buttonLink && (
          <div className="stats-section__button-container">
            <SmartLink to={buttonLink} className="stats-section__button">
              {buttonText}
              <span>→</span>
            </SmartLink>
          </div>
        )}
      </div>
    </section>
  )
}

export default StatsSection
