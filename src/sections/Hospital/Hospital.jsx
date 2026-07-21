import { useEffect, useState } from 'react'
import { hospitalImages } from '../../data/hospitalImages'
import { useLocale } from '../../hooks/useLocale'
import './Hospital.sass'

function Hospital() {
  const [activeSlide, setActiveSlide] = useState(0)
  const { hospital } = useLocale()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide === hospitalImages.length - 1 ? 0 : prevSlide + 1))
    }, 3000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="hospital" id="hospital">
      <div className="container hospital__container">
        <div className="hospital__content">
          <h2 className="hospital__title h1">{hospital.title}</h2>

          <div className="hospital__text">
            {hospital.paragraphs.map((paragraph) => (
              <p key={paragraph} className="hospital__p p">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <h2 className="hospital__title-mobile h1">{hospital.title}</h2>

        <div className="hospital__slider">
          {hospitalImages.map((image, index) => (
            <img
              loading="lazy"
              decoding="async"
              key={image}
              src={image}
              alt={hospital.imageAlt}
              className={`hospital__image ${
                index === activeSlide ? 'hospital__image--active' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hospital
