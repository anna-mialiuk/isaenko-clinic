import './TreatmentCard.sass'

function TreatmentCard({ treatment }) {
  return (
    <article
      className={`treatment-card ${treatment.horizontal ? 'treatment-card--horizontal' : ''}`}
    >
      <div className="treatment-card__content">
        <img src={treatment.icon} alt="" className="treatment-card__icon" />

        <h3 className="treatment-card__title">{treatment.title}</h3>
      </div>

      {treatment.hover && (
        <div className="treatment-card__hover">
          <div className="treatment-card__hover-icon">
            <img src="/src/assets/images/logos/big-full-logo.svg" alt="" />
          </div>

          <div className="treatment-card__hover-text">
            <strong>{treatment.hover.number}</strong>
            <span>{treatment.hover.text}</span>
          </div>
        </div>
      )}
    </article>
  )
}

export default TreatmentCard
