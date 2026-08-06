import ContentSection from '../ContentSection/ContentSection'
import { useLocale } from '../../hooks/useLocale'

import './HospitalIntro.sass'

function HospitalIntro() {
  const { hospitalIntro } = useLocale()

  return (
    <ContentSection
      className="hospital-intro"
      titleClass="hospital-intro__title"
      title={hospitalIntro.title}
      image="/images/hospital/hospital-intro.webp"
      imageAlt={hospitalIntro.imageAlt}
      imagePosition="center"
    >
      <div className="hospital-intro__content">
        <p>{hospitalIntro.intro}</p>

        <ul>
          {hospitalIntro.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </ContentSection>
  )
}

export default HospitalIntro
