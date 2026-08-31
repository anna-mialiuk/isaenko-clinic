import { Link } from 'react-router-dom'

import { getDirectionsNavigation, getMainNavigation } from '../../data/navigation'
import { footerData } from '../../data/footerData'
import { useLanguage } from '../../hooks/useLanguage'
import { useLocale } from '../../hooks/useLocale'
import { logos } from '../../utils/getLogo'
import { trackEvent } from '../../utils/gaEvent'

import './Footer.sass'

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function FooterLinkList({ title, links }) {
  return (
    <div className="footer__column">
      <h3 className="footer__column-header p">{title}</h3>

      {links.map((link) => (
        <Link key={link.path} to={link.path} className="footer__link" onClick={scrollToTop}>
          {link.label}
        </Link>
      ))}
    </div>
  )
}

function Footer({ variant = 'kharkiv' }) {
  const { language } = useLanguage()
  const { footer } = useLocale()

  const data = footerData[variant] || footerData.kharkiv

  const mainNavigation = getMainNavigation(variant, language)
  const directionsNavigation = getDirectionsNavigation(variant, language)

  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__flex">
          <div className="footer__info">
            <img src={logos[language]} alt="Dr. Isaenko" className="footer__logo" />

            <p className="footer__license p">{footer[variant].licenseText}</p>

            <div className="footer__socials">
              <a
                href={data.socials.instagram}
                className="footer__instagram"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('click_messenger', { messenger: 'instagram' })}
              >
                <img
                  src="/images/social/instagram.svg"
                  alt="Dr. Isaenko Instagram"
                  className="footer__instagram-logo"
                />
              </a>

              <a
                href={data.socials.facebook}
                className="footer__instagram"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('click_messenger', { messenger: 'facebook' })}
              >
                <img
                  src="/images/social/facebook.svg"
                  alt="Dr. Isaenko Facebook"
                  className="footer__instagram-logo"
                />
              </a>
            </div>
          </div>

          <FooterLinkList title={footer[variant].labels.navigation} links={mainNavigation} />

          <FooterLinkList title={footer[variant].labels.directions} links={directionsNavigation} />

          <div className="footer__contacts">
            <h3 className="footer__contacts-header">{footer[variant].labels.workSchedule}</h3>

            {footer[variant].workSchedule.map((item) => (
              <div key={item.day} className="footer__schedule">
                <span className="footer__schedule-day">{item.day}</span>
                <span className="footer__schedule-time">{item.time}</span>
              </div>
            ))}

            {footer[variant].stationaryText && (
              <p className="footer__stationary">{footer[variant].stationaryText}</p>
            )}

            <div className="footer__messengers">
              <p className="footer__messengers-header">{footer[variant].labels.supportChats}</p>

              <a
                href={data.socials.whatsapp}
                className="footer__messengers-link"
                onClick={() => trackEvent('click_messenger', { messenger: 'whatsapp' })}
              >
                <img
                  src="/images/social/whats-app.svg"
                  alt="WhatsApp"
                  className="footer__link-icon"
                />
                WhatsApp
              </a>

              <a
                href={data.socials.telegram}
                className="footer__messengers-link"
                onClick={() => trackEvent('click_messenger', { messenger: 'telegram' })}
              >
                <img
                  src="/images/social/telegram.svg"
                  alt="Telegram"
                  className="footer__link-icon"
                />
                Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__rights">{footer[variant].rights}</p>

          <div className="footer__documents">
            {footer[variant].documents.map((document) => (
              <a
                key={document.label}
                href={document.href}
                className={`footer__documents-link ${
                  document.underlined ? 'footer__documents-link_underlined' : ''
                }`}
              >
                {document.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
