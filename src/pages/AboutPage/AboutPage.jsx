import TopBar from '../../components/TopBar/TopBar'
import ScrollCTA from '../../components/ScrollCTA/ScrollCTA'

import DirectionHeader from '../../sections/DirectionHeader/DirectionHeader'
import AboutHero from '../../sections/AboutHero/AboutHero'
import TrustBlock from '../../sections/TrustBlock/TrustBlock'
import Founder from '../../sections/Founder/Founder'
import AboutTeamPreview from '../../sections/AboutTeamPreview/AboutTeamPreview'
import StatsSection from '../../sections/StatsSection/StatsSection'
import Methodology from '../../sections/Methodology/Methodology'
import FAQ from '../../sections/FAQ/FAQ'
import Footer from '../../sections/Footer/Footer'

import { useLocale } from '../../hooks/useLocale'

import './AboutPage.sass'

function AboutPage({ variant = 'kharkiv' }) {
  const { aboutPrinciples, pages, stats, founder } = useLocale()

  return (
    <div className="about-page">
      <TopBar />
      <DirectionHeader variant={variant} />
      <ScrollCTA />

      <AboutHero />

      <TrustBlock
        title={aboutPrinciples.title}
        subtitle=""
        items={aboutPrinciples.items}
        footerText={aboutPrinciples.footerText}
      />

      <Founder quote={founder.aboutQuote} />
      <AboutTeamPreview />

      <StatsSection
        stats={stats.generalStats}
        buttonText={pages.statsHospitalButton}
        buttonLink="#hospital"
      />

      <Methodology variant={variant} />

      <StatsSection
        stats={stats.hospitalStats}
        buttonText={pages.statsHospitalButton}
        buttonLink="#hospital"
      />

      <FAQ />
      <Footer variant={variant} />
    </div>
  )
}

export default AboutPage
