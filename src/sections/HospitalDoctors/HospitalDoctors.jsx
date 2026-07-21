import DirectionDoctorColumn from '../../components/DirectionDoctorColumn/DirectionDoctorColumn'
import { directionDoctors } from '../../data/directionDoctors'
import { useLocale } from '../../hooks/useLocale'
import { translateDoctors } from '../../utils/translateDoctors'

import './HospitalDoctors.sass'

function HospitalDoctors() {
  const { directionDoctors: directionDoctorsLocale, hospitalDoctors } = useLocale()

  const doctors = translateDoctors(directionDoctors, directionDoctorsLocale)

  return (
    <section className="hospital-doctors">
      <div className="container hospital-doctors__container">
        <h2 className="hospital-doctors__title h1">{hospitalDoctors.title}</h2>

        <div className="hospital-doctors__grid">
          {doctors.map((doctor) => (
            <DirectionDoctorColumn key={doctor.slug} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HospitalDoctors
