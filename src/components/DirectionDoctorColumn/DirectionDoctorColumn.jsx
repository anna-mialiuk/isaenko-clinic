import DoctorCard from '../DoctorCard/DoctorCard'
import DirectionDoctorPriceList from '../DirectionDoctorPriceList/DirectionDoctorPriceList'
import { useLocale } from '../../hooks/useLocale'
import './DirectionDoctorColumn.sass'

function DirectionDoctorColumn({ doctor }) {
  const hasReels = Boolean(doctor.reelsLink)
  const { common } = useLocale()

  return (
    <article className="direction-doctor-column">
      <DoctorCard doctor={doctor} />

      {hasReels ? (
        <a
          href={doctor.reelsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="direction-doctor-column__reels"
        >
          {common.watchReels}
        </a>
      ) : (
        <button
          type="button"
          className="direction-doctor-column__reels direction-doctor-column__reels--disabled"
          disabled
        >
          {common.watchReels}
        </button>
      )}

      <DirectionDoctorPriceList doctor={doctor} />
    </article>
  )
}

export default DirectionDoctorColumn
