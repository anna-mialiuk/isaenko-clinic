import { useLocale } from '../../hooks/useLocale'
import { useLanguage } from '../../hooks/useLanguage'
import { formatPrice } from '../../utils/formatPrice'

function DirectionDoctorPriceList({ doctor }) {
  const { common } = useLocale()
  const { language } = useLanguage()

  return (
    <div className="direction-doctor-column__prices">
      <h4>{common.servicePrices}</h4>

      {doctor.prices.map((item) => (
        <div key={`${doctor.slug}-${item.service}`} className="direction-doctor-column__price">
          <div>
            <p>{item.service}</p>
            {item.duration && <span>{item.duration}</span>}
          </div>

          <strong>{formatPrice(item.price, language)}</strong>
        </div>
      ))}
    </div>
  )
}

export default DirectionDoctorPriceList
