import { directionDoctors } from './directionDoctors'
import { directionDoctorsMap } from './directionDoctorsMap'

export const getDoctorsByDirection = (directionSlug) => {
  const doctorSlugs = directionDoctorsMap[directionSlug] || []

  return doctorSlugs
    .map((doctorSlug) => directionDoctors.find((doctor) => doctor.slug === doctorSlug))
    .filter(Boolean)
}
