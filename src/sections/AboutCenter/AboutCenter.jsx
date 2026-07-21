import ContentSection from '../ContentSection/ContentSection'

import { useLocale } from '../../hooks/useLocale'

function AboutCenter() {
  const { aboutCenter: content } = useLocale()

  return (
    <ContentSection
      id="about"
      image="/src/assets/images/about/about-center.webp"
      imageAlt="Dr. Isaenko clinic"
      imageHeight="80rem"
      title={content.title}
      text={content.text}
      button={{
        href: '/about',
        label: content.button,
      }}
    />
  )
}

export default AboutCenter
