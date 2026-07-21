import { Link } from 'react-router-dom'

import { useLocale } from '../../hooks/useLocale'
import { getRoute } from '../../utils/getRoute'

import './Methodology.sass'

function Methodology({ variant = 'kharkiv' }) {
  const { methodology } = useLocale()

  return (
    <section className="methodology">
      <div className="container">
        <div className="methodology__card">
          <div className="methodology__content">
            <h2 className="methodology__title h2">{methodology.title}</h2>

            <p className="methodology__text p">{methodology.text}</p>

            <Link to={getRoute(variant, '/multimodal')} className="methodology__button">
              {methodology.button}
            </Link>
          </div>

          <div className="methodology__scheme">
            <div className="methodology__center">
              <img src="/src/assets/images/logos/big-full-logo.svg" alt="logo" />
            </div>

            {methodology.items.map((item, index) => (
              <span key={item} className={`methodology__item methodology__item--${index + 1}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Methodology
