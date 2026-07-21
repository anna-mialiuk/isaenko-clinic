import { useEffect, useState } from 'react'
import { trustImages } from '../../data/trustBlock'

import './TrustBlock.sass'

function TrustBlock({
  title,
  subtitle = '',
  text = '',
  items = [],
  footerText = '',
  withBullets = false,
}) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide === trustImages.length - 1 ? 0 : prevSlide + 1))
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="trust-block">
      <div className="trust-block__container container">
        <div className="trust-block__card">
          <div className="trust-block__slider">
            {trustImages.map((image, index) => (
              <img
                loading="lazy"
                decoding="async"
                key={image}
                src={image}
                alt="Dr. Isaenko clinic"
                className={`trust-block__image ${
                  index === activeSlide ? 'trust-block__image--active' : ''
                }`}
              />
            ))}
          </div>

          <div className="trust-block__content">
            {title && <h2 className="trust-block__title">{title}</h2>}

            {subtitle && <p className="trust-block__subtitle">{subtitle}</p>}

            {text && <p className="trust-block__text">{text}</p>}

            <ul className={`trust-block__list ${withBullets ? 'trust-block__list--bullets' : ''}`}>
              {items.map((item) => (
                <li key={item.bold || item.text}>
                  {item.bold && <strong>{item.bold}</strong>}
                  {item.text}
                </li>
              ))}
            </ul>

            {footerText && <p className="trust-block__footer-text">{footerText}</p>}

            <img
              loading="lazy"
              decoding="async"
              className="trust-block__big-circle pink-circle"
              src="/src/assets/images/decor/pink-circle.svg"
              alt=""
            />
          </div>

          <img
            loading="lazy"
            decoding="async"
            className="trust-block__small-circle pink-circle"
            src="/src/assets/images/decor/pink-circle.svg"
            alt=""
          />
        </div>
      </div>
    </section>
  )
}

export default TrustBlock
