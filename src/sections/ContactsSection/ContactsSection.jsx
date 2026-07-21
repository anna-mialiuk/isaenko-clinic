import { useLanguage } from '../../hooks/useLanguage'
import { useLocale } from '../../hooks/useLocale'

import './ContactsSection.sass'

function ContactsSection({ city, schedule, phone, phoneHref, email, mapUrl }) {
  const { language } = useLanguage()
  const { contacts } = useLocale()

  const cityName = typeof city === 'object' ? city[language] : city

  return (
    <section className="contacts-section">
      <div className="container contacts-section__container">
        <div className="contacts-section__info">
          <h2 className="contacts-section__city">{cityName}</h2>

          <div className="contacts-section__group">
            <h3 className="contacts-section__group-title">{contacts.workSchedule}</h3>

            <div className="contacts-section__schedule">
              {schedule.map((item) => (
                <div className="contacts-section__schedule-row" key={item.day}>
                  <span>{item.day}</span>
                  <strong>{item.time}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="contacts-section__group">
            <h3 className="contacts-section__group-title">{contacts.phone}</h3>

            <a className="contacts-section__link" href={phoneHref}>
              {phone}
            </a>
          </div>

          <div className="contacts-section__group">
            <h3 className="contacts-section__group-title">{contacts.email}</h3>

            <a className="contacts-section__link" href={`mailto:${email}`}>
              {email}
            </a>
          </div>
        </div>

        <div className="contacts-section__map">
          <iframe
            title={`${cityName} Dr. Isaenko map`}
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default ContactsSection
