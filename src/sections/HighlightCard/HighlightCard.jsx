import './HighlightCard.sass'

function HighlightCard({ value, text }) {
  return (
    <section className="highlight-card">
      <div className="highlight-card__container container">
        <div className="highlight-card__card">
          <h2 className="highlight-card__value h2">{value}</h2>

          <p className="highlight-card__text p">{text}</p>
        </div>
      </div>
    </section>
  )
}

export default HighlightCard
