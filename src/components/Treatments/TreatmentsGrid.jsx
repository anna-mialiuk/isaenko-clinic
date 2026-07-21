import TreatmentCard from './TreatmentCard'
import './TreatmentsGrid.sass'

function TreatmentsGrid({ treatments }) {
  return (
    <div className="treatments-grid">
      {treatments.map((treatment) => (
        <TreatmentCard key={treatment.slug} treatment={treatment} />
      ))}
    </div>
  )
}

export default TreatmentsGrid
