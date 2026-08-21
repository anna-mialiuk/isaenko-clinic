import { useState } from 'react'
import { BOOKING_URL } from '../data/site'
import { setNextBookingPlace } from '../utils/clickTracking'

function useBookingAgreement(initialValue = true, place = 'unknown') {
  const [isChecked, setIsChecked] = useState(initialValue)

  const toggleAgreement = () => {
    setIsChecked((currentValue) => !currentValue)
  }

  const openBooking = () => {
    if (!isChecked) return

    setNextBookingPlace(place)
    window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')
  }

  const preventIfUnchecked = (event) => {
    if (!isChecked) {
      event.preventDefault()
      return
    }
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
