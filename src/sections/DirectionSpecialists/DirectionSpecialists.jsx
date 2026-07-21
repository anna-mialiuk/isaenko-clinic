import { useState } from 'react'

import DirectionDoctorColumn from '../../components/DirectionDoctorColumn/DirectionDoctorColumn'
import TreatmentsGrid from '../../components/Treatments/TreatmentsGrid'

import { getDoctorsByDirection } from '../../data/getDoctorsByDirection'
import { useLocale } from '../../hooks/useLocale'
import { translateDoctors } from '../../utils/translateDoctors'

import './DirectionSpecialists.sass'

function DirectionSpecialists({ directionSlug }) {
  const [activeTab, setActiveTab] = useState('doctors')

  const { directionDoctors, directionSpecialists, directionTreatments } = useLocale()

  const doctors = translateDoctors(getDoctorsByDirection(directionSlug), directionDoctors)

  return (
    <section className="direction-specialists">
      <div className="container direction-specialists__container">
        <div className="direction-specialists__tabs">
          <button
            type="button"
            className={`direction-specialists__tab ${
              activeTab === 'doctors' ? 'direction-specialists__tab--active' : ''
            }`}
            onClick={() => setActiveTab('doctors')}
          >
            {directionSpecialists.doctors}
          </button>

          <button
            type="button"
            className={`direction-specialists__tab ${
              activeTab === 'treatments' ? 'direction-specialists__tab--active' : ''
            }`}
            onClick={() => setActiveTab('treatments')}
          >
            {directionSpecialists.treatments}
          </button>
        </div>

        <div className="direction-specialists__content">
          {activeTab === 'doctors' && (
            <div className="direction-specialists__doctors">
              {doctors.map((doctor) => (
                <DirectionDoctorColumn key={doctor.slug} doctor={doctor} />
              ))}
            </div>
          )}

          {activeTab === 'treatments' && <TreatmentsGrid treatments={directionTreatments} />}
        </div>
      </div>
    </section>
  )
}

export default DirectionSpecialists
