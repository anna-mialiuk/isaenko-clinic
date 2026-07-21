import { Link, useLocation } from 'react-router-dom'

import TopBar from '../components/TopBar/TopBar'
import DirectionHeader from '../sections/DirectionHeader/DirectionHeader'
import Footer from '../sections/Footer/Footer'
import { useLocale } from '../hooks/useLocale'
import { getHomeRoute } from '../utils/getRoute'

import './NotFoundPage.sass'

const getVariantFromPath = (pathname) => (pathname.startsWith('/kyiv') ? 'kyiv' : 'kharkiv')

function NotFoundPage() {
  const { common } = useLocale()
  const { pathname } = useLocation()
  const variant = getVariantFromPath(pathname)

  return (
    <div className="not-found-page">
      <TopBar />
      <DirectionHeader variant={variant} />

      <main className="not-found-page__main">
        <div className="container not-found-page__container">
          <p className="not-found-page__label">404</p>
          <h1 className="not-found-page__title h1">{common.notFoundTitle}</h1>
          <p className="not-found-page__text p">{common.notFoundText}</p>

          <Link to={getHomeRoute(variant)} className="not-found-page__button">
            {common.notFoundButton}
            <span>→</span>
          </Link>
        </div>
      </main>

      <Footer variant={variant} />
    </div>
  )
}

export default NotFoundPage
