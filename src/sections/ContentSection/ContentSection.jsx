import SmartLink from '../../components/SmartLink/SmartLink'

import './ContentSection.sass'

function ContentSection({
  id,
  className = '',
  title,
  titleClass = '',
  subtitle,
  text,
  image,
  imageAlt = '',
  button,
  children,
  imagePosition = 'center',
}) {
  return (
    <section className={`content-section ${className}`} id={id}>
      <div className="container content-section__container">
        <div className="content-section__content">
          <h1 className={`content-section__title h1 ${titleClass}`}>{title}</h1>

          {(subtitle || text || children || button) && (
            <div className="content-section__info">
              {subtitle && <h2 className="content-section__subtitle">{subtitle}</h2>}

              {text && <div className="content-section__text">{text}</div>}

              {children}

              {button && (
                <SmartLink
                  to={button.to || button.href}
                  className="content-section__button"
                  onClick={button.onClick}
                >
                  {button.label}
                  <span>→</span>
                </SmartLink>
              )}
            </div>
          )}
        </div>

        {image && (
          <div className="content-section__image-wrapper">
            <img
              loading="lazy"
              decoding="async"
              src={image}
              alt={imageAlt}
              className="content-section__image"
              style={{ objectPosition: imagePosition }}
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default ContentSection
