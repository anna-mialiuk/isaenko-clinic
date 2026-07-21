import { memo } from 'react'

import './InfoCard.sass'

function InfoCard({ value, text, small = false, className = '' }) {
  return (
    <article className={`info-card ${className}`}>
      <h3 className={`info-card__value h2 ${small ? 'info-card__value--small' : ''}`}>{value}</h3>

      <p className="info-card__text p">{text}</p>
    </article>
  )
}

export default memo(InfoCard)
