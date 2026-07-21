import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'
import TeamDoctors from '../../sections/TeamDoctors/TeamDoctors'
import QuestionForm from '../../sections/QuestionForm/QuestionForm'
import AboutTeamPreview from '../../sections/AboutTeamPreview/AboutTeamPreview'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import './TeamPage.sass'

function TeamPage({ variant = 'kharkiv' }) {
  return (
    <div className="team-page">
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <TeamDoctors variant={variant} />

      <AboutTeamPreview />
      <QuestionForm />
      <FAQ />

      <Footer variant={variant} />
    </div>
  )
}

export default TeamPage
