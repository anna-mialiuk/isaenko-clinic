import { useLocale } from '../../hooks/useLocale'

import { trackEvent } from '../../utils/gaEvent'

import './TopBar.sass'

function TopBar() {
  const { topBar: content } = useLocale()

  return (
    <div className="top-bar">
      <div className="container top-bar__container">
        <p className="top-bar__text">{content.license}</p>

        <p className="top-bar__text top-bar__text-hide-mobile">{content.phoneInfo}</p>

        <a
          href="tel:+380663777908"
          className="top-bar__button"
          onClick={() => trackEvent('click_phone', { phone_place: 'top_bar' })}
        >
          {content.call}
        </a>
      </div>
    </div>
  )
}

export default TopBar
