import TopBar from '../components/TopBar/TopBar'
import Hero from '../sections/Hero/Hero'
import AboutCenter from '../sections/AboutCenter/AboutCenter'
import TrustBlock from '../sections/TrustBlock/TrustBlock'
import Founder from '../sections/Founder/Founder'
import OurTeamImg from '../sections/OurTeamImg/OurTeamImg'
import Doctors from '../sections/Doctors/Doctors'
import Methodology from '../sections/Methodology/Methodology'
import Hospital from '../sections/Hospital/Hospital'
import StatsSection from '../sections/StatsSection/StatsSection'
import FAQ from '../sections/FAQ/FAQ'
import Footer from '../sections/Footer/Footer'
import ScrollCTA from '../components/ScrollCTA/ScrollCTA'

import { useLocale } from '../hooks/useLocale'
import { getRoute } from '../utils/getRoute'

function HomePage({ variant = 'kharkiv' }) {
  const { pages, trustBlock, stats } = useLocale()

  return (
    <>
      <TopBar />
      <Hero variant={variant} />
      <AboutCenter />
      <ScrollCTA />

      <TrustBlock
        title={trustBlock.title}
        subtitle={trustBlock.subtitle}
        items={trustBlock.items}
      />

      <Founder />
      <OurTeamImg />

      <StatsSection
        stats={stats.generalStats}
        buttonText={pages.statsHospitalButton}
        buttonLink={getRoute(variant, '/hospital')}
      />

      <Doctors variant={variant} />
      <Methodology variant={variant} />
      <Hospital />

      <StatsSection
        stats={stats.hospitalStats}
        buttonText={pages.statsHospitalButton}
        buttonLink={getRoute(variant, '/hospital')}
      />

      <FAQ />
      <Footer variant={variant} />
    </>
  )
}

export default HomePage
