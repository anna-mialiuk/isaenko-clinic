import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'

import MultimodalWhy from '../../sections/MultimodalWhy/MultimodalWhy'
import MultimodalSpecialists from '../../sections/MultimodalSpecialists/MultimodalSpecialists'
import QuestionForm from '../../sections/QuestionForm/QuestionForm'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import './MultimodalPage.sass'

function MultimodalPage({ variant = 'kharkiv' }) {
  return (
    <div className="multimodal-page">
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <MultimodalWhy />
      <MultimodalSpecialists />
      <QuestionForm />
      <FAQ />

      <Footer variant={variant} />
    </div>
  )
}

export default MultimodalPage
