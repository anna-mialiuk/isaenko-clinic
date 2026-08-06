import DoctorCard from '../../components/DoctorCard/DoctorCard'

import { useDoctors } from '../../hooks/useDoctors'
import { useLocale } from '../../hooks/useLocale'

import './Founder.sass'

function Founder({ quote }) {
  const { founder: content } = useLocale()
  const doctors = useDoctors()
  const founder = doctors.find((doctor) => doctor.isFounder)

  if (!founder) return null

  return (
    <section className="founder">
      <div className="container founder__container">
        <DoctorCard doctor={founder} />

        <div className="founder__content">
          <div className="founder__quote-icon">
            <img src="/images/decor/quotes.svg" alt="icon" />
          </div>

          <blockquote className="founder__quote">{quote ?? content.quote}</blockquote>

          <div className="founder__author">
            <img
              loading="lazy"
              decoding="async"
              src="/images/doctors/founder-avatar.webp"
              alt={founder.name}
              className="founder__avatar"
            />

            <div className="founder__author-content">
              <h3 className="founder__author-name">{founder.name}</h3>

              <p className="founder__author-description">{content.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Founder
