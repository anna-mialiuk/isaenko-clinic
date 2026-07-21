import InfoCard from '../../components/InfoCard/InfoCard'
import { useLocale } from '../../hooks/useLocale'

import './ScheduleSection.sass'

function ScheduleSection({ items, showHeader = true }) {
  const { schedule } = useLocale()

  return (
    <section className="schedule-section">
      <div className="container schedule-section__container">
        {showHeader && (
          <div className="schedule-section__header">
            <h2 className="schedule-section__title h1">{schedule.title}</h2>
            <p className="schedule-section__text p">{schedule.text}</p>
          </div>
        )}

        <div className="schedule-section__grid">
          {items.map((item) => (
            <InfoCard key={item.id} value={item.value} text={item.text} small={item.small} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ScheduleSection
