import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'
import DirectionIntro from '../../sections/DirectionIntro/DirectionIntro'
import DirectionSpecialists from '../../sections/DirectionSpecialists/DirectionSpecialists'
import QuestionForm from '../../sections/QuestionForm/QuestionForm'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import NotFoundPage from '../NotFoundPage'

import { useLocale } from '../../hooks/useLocale'

function DirectionPage({ directionSlug, variant = 'kharkiv' }) {
  const { directionsContent } = useLocale()

  const direction = directionsContent?.[directionSlug]

  if (!direction) return <NotFoundPage />

  return (
    <>
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <DirectionIntro title={direction.title} text={direction.text} />
      <DirectionSpecialists directionSlug={directionSlug} />
      <QuestionForm />
      <FAQ />
      <Footer variant={variant} />
    </>
  )
}

export default DirectionPage
