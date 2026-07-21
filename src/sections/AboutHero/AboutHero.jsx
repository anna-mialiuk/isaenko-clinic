import ContentSection from '../ContentSection/ContentSection'
import { useLocale } from '../../hooks/useLocale'

function AboutHero() {
  const { aboutHero } = useLocale()

  return (
    <ContentSection
      image="/src/assets/images/about/about-hero.webp"
      imageAlt="Dr. Isaenko"
      imageHeight="50rem"
      imagePosition="center top"
      title={aboutHero.title}
      subtitle={aboutHero.subtitle}
      text={<p>{aboutHero.text}</p>}
    />
  )
}

export default AboutHero
