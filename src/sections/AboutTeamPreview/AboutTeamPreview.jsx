import { useLocale } from '../../hooks/useLocale'
import './AboutTeamPreview.sass'

function AboutTeamPreview() {
  const { aboutTeamPreview } = useLocale()

  return (
    <section className="about-team-preview">
      <div className="container about-team-preview__container">
        <h2 className="about-team-preview__title h1">{aboutTeamPreview.title}</h2>

        <img
          loading="lazy"
          decoding="async"
          src="/src/assets/images/team/our-team.webp"
          alt={aboutTeamPreview.imageAlt}
          className="about-team-preview__image"
        />
      </div>
    </section>
  )
}

export default AboutTeamPreview
