export function getDoctorGroup(doctors, startIndex, count) {
  if (!Array.isArray(doctors) || doctors.length === 0 || count <= 0) return []

  const safeCount = Math.min(count, doctors.length)
  const safeStart = ((startIndex % doctors.length) + doctors.length) % doctors.length

  return Array.from(
    { length: safeCount },
    (_, index) => doctors[(safeStart + index) % doctors.length],
  )
}
