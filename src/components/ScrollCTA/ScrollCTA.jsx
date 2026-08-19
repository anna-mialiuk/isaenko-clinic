import AgreementCheckbox from '../AgreementCheckbox/AgreementCheckbox'
import useBookingAgreement from '../../hooks/useBookingAgreement'
import useScrollCTAVisibility from '../../hooks/useScrollCTAVisibility'
import { useLocale } from '../../hooks/useLocale'

import './ScrollCTA.sass'

function ScrollCTA() {
  const isVisible = useScrollCTAVisibility()
  const { common, footer } = useLocale()
  const { bookingUrl, isChecked, toggleAgreement, preventIfUnchecked } = useBookingAgreement(
    true,
    'scroll_cta',
  )

  return (
    <div className={`scroll-cta ${isVisible ? 'scroll-cta--visible' : ''}`}>
      <a
        href={bookingUrl}
        className={`scroll-cta__button ${!isChecked ? 'scroll-cta__button--disabled' : ''}`}
        aria-disabled={!isChecked}
        onClick={preventIfUnchecked}
      >
        {common.scrollCta}
      </a>

      <AgreementCheckbox block="scroll-cta" isChecked={isChecked} onToggle={toggleAgreement} />

      <p className="scroll-cta__license">{footer.kharkiv.licenseText}</p>
    </div>
  )
}

export default ScrollCTA
