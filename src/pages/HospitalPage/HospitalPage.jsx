import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'
import HospitalIntro from '../../sections/HospitalIntro/HospitalIntro'
import TrustBlock from '../../sections/TrustBlock/TrustBlock'
import FeatureCards from '../../sections/FeatureCards/FeatureCards'
import ScheduleSection from '../../sections/ScheduleSection/ScheduleSection'
import HighlightCard from '../../sections/HighlightCard/HighlightCard'
import HospitalDoctors from '../../sections/HospitalDoctors/HospitalDoctors'
import Methodology from '../../sections/Methodology/Methodology'
import StatsSection from '../../sections/StatsSection/StatsSection'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import { useLocale } from '../../hooks/useLocale'

function HospitalPage({ variant = 'kharkiv' }) {
  const { hospitalConditions, hospitalServices, pages, stats } = useLocale()

  return (
    <div className="hospital-page">
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <HospitalIntro />

      <TrustBlock
        title={hospitalConditions.title}
        subtitle=""
        text={hospitalConditions.text}
        items={hospitalConditions.items}
        withBullets
      />

      <FeatureCards
        title={pages.hospitalServices.title}
        description={pages.hospitalServices.description}
        cards={hospitalServices}
      />

      <ScheduleSection items={stats.hospitalSchedule} />

      <HighlightCard value={stats.hospitalTherapy.value} text={stats.hospitalTherapy.text} />

      <ScheduleSection items={stats.hospitalEveningSchedule} showHeader={false} />

      <HospitalDoctors />
      <Methodology variant={variant} />

      <StatsSection stats={stats.hospitalStats} className="stats-section--hospital" />

      <FAQ />
      <Footer variant={variant} />
    </div>
  )
}

export default HospitalPage
