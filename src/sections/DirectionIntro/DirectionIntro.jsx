import { useEffect, useState } from 'react'
import { hospitalImages } from '../../data/hospitalImages'
import { useLocale } from '../../hooks/useLocale'
import './DirectionIntro.sass'

function DirectionIntro({ title, text }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const { common } = useLocale()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide === hospitalImages.length - 1 ? 0 : prevSlide + 1))
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="direction-intro">
      <div className="container direction-intro__container">
        <div className="direction-intro__content">
          <h1 className="direction-intro__title h1">{title}</h1>

          <div className="direction-intro__text">
            {text.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`direction-intro__p p ${
                  index === text.length - 1 ? 'direction-intro__p--accent' : ''
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <a href="#contacts" className="direction-intro__button">
            {common.onlineBooking}
            <span>→</span>
          </a>
        </div>

        <h1 className="direction-intro__title-mobile h1">{title}</h1>

        <div className="direction-intro__slider">
          {hospitalImages.map((image, index) => (
            <img
              loading="lazy"
              decoding="async"
              key={image}
              src={image}
              alt={title}
              className={`direction-intro__image ${
                index === activeSlide ? 'direction-intro__image--active' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default DirectionIntro
