import AgreementCheckbox from '../AgreementCheckbox/AgreementCheckbox'
import useBookingAgreement from '../../hooks/useBookingAgreement'
import { useLocale } from '../../hooks/useLocale'

function HeroActions() {
  const { common } = useLocale()
  const { isChecked, toggleAgreement, openBooking } = useBookingAgreement(true, 'hero')

  return (
    <div className="hero__actions">
      <button
        type="button"
        className="hero__violet-button"
        disabled={!isChecked}
        onClick={openBooking}
      >
        {common.onlineBooking}
      </button>

      <AgreementCheckbox block="hero" isChecked={isChecked} onToggle={toggleAgreement} />
    </div>
  )
}

export default HeroActions
