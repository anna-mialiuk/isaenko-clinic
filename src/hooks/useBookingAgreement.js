import { useState } from 'react'
import { BOOKING_URL } from '../data/site'

function useBookingAgreement(initialValue = true) {
  const [isChecked, setIsChecked] = useState(initialValue)

  const toggleAgreement = () => {
    setIsChecked((currentValue) => !currentValue)
  }

  const openBooking = () => {
    if (!isChecked) return

    window.open(BOOKING_URL, '_blank', 'noopener,noreferrer')
  }

  const preventIfUnchecked = (event) => {
    if (!isChecked) {
      event.preventDefault()
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
