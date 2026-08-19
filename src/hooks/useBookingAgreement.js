import { useState } from 'react'
import { BOOKING_URL } from '../data/site'
import { trackEvent } from '../utils/gaEvent'

function useBookingAgreement(initialValue = true, place = 'unknown') {
  const [isChecked, setIsChecked] = useState(initialValue)

  const toggleAgreement = () => {
    setIsChecked((currentValue) => !currentValue)
  }

  const trackBookingClick = () => {
    trackEvent('click_booking', { booking_place: place })
  }

  const openBooking = () => {
    if (!isChecked) return

    trackBookingClick()
    window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')
  }

  const preventIfUnchecked = (event) => {
    if (!isChecked) {
      event.preventDefault()
      return
    }

    trackBookingClick()
  }

  return {
    bookingUrl: BOOKING_URL,
    isChecked,
    toggleAgreement,
    openBooking,
    preventIfUnchecked,
  }
}

export default useBookingAgreement
