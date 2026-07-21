import { memo } from 'react'

import { useLocale } from '../../hooks/useLocale'
import { darkLogos } from '../../utils/getDarkLogo'

import './DoctorCard.sass'

function DoctorCard({ doctor, isCurrent }) {
  const { language } = useLocale()

  const backText = doctor.description || doctor.about
  const canHover = doctor.hasHover !== false && Boolean(backText)

  return (
    <article
      className={`doctor-card ${canHover ? 'doctor-card--has-hover' : ''}`}
      tabIndex={canHover && isCurrent !== false ? 0 : undefined}
      aria-hidden={isCurrent === false ? true : undefined}
      aria-label={`${doctor.name}. ${doctor.position}`}
    >
      <div className="doctor-card__front">
        <img
          loading="lazy"
          decoding="async"
          src={doctor.image}
          alt={`Фото лікаря: ${doctor.name}`}
          className="doctor-card__image"
        />

        <div className="doctor-card__experience">
          <strong>{doctor.experience}</strong>
          <span>{doctor.experienceText}</span>
        </div>

        <div className="doctor-card__content">
          <h3 className="doctor-card__name">{doctor.name}</h3>

          <p className="doctor-card__position">{doctor.position}</p>
        </div>
      </div>

      {canHover && (
        <div className="doctor-card__back">
          <img
            loading="lazy"
            decoding="async"
            src={darkLogos[language] || darkLogos.uk}
            alt=""
            aria-hidden="true"
            className="doctor-card__back-logo"
          />

          <h3 className="doctor-card__back-name">{doctor.name}</h3>

          <p className="doctor-card__back-text">{backText}</p>
        </div>
      )}
    </article>
  )
}

export default memo(DoctorCard)
