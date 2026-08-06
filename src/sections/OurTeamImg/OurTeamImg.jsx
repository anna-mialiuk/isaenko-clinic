import './OurTeamImg.sass'

function OurTeamImg() {
  return (
    <section className="our-team-img">
      <div className="our-team-img__container">
        <img
          loading="lazy"
          decoding="async"
          className="our-team-img__img"
          src="/images/team/our-team.webp"
          alt="Our team"
        />
      </div>
    </section>
  )
}
export default OurTeamImg
