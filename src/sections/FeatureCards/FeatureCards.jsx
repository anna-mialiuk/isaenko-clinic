import './FeatureCards.sass'

function FeatureCards({ title, description, cards }) {
  return (
    <section className="feature-cards">
      <div className="container feature-cards__container">
        <h2 className="feature-cards__title h2">{title}</h2>

        {description && <p className="feature-cards__description">{description}</p>}

        <div className="feature-cards__grid">
          {cards.map((card) => {
            const icons = card.icons
              ? card.icons
              : Array.from({ length: card.count || 1 }, () => card.icon)

            return (
              <div className="feature-cards__card" key={card.title}>
                <div className="feature-cards__icons">
                  {icons.map((icon, index) => (
                    <img
                      loading="lazy"
                      decoding="async"
                      key={`${icon}-${index}`}
                      src={icon}
                      alt=""
                      className={`feature-cards__icon ${
                        icon.includes('arrow-') ? 'feature-cards__icon--arrow' : ''
                      }`}
                    />
                  ))}
                </div>

                <h3 className="feature-cards__card-title">{card.title}</h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureCards
