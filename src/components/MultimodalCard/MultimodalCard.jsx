import './MultimodalCard.sass'

function MultimodalCard({ icon: Icon, title, className = '' }) {
  return (
    <article className={`multimodal-card ${className}`}>
      <div className="multimodal-card__icon">
        <Icon />
      </div>

      <h3 className="multimodal-card__title">{title}</h3>
    </article>
  )
}

export default MultimodalCard
