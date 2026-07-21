import { useMemo } from 'react'

import { doctorsCatalog, HOME_MOBILE_DOCTOR_SLUGS } from '../data/doctorsCatalog'
import { useLocale } from './useLocale'
import { translateDoctors } from '../utils/translateDoctors'

export function useDoctorsCatalog() {
  const { doctorsTranslations, directionDoctors: directionTranslations } = useLocale()

  return useMemo(() => {
    const translations = {
      ...directionTranslations,
      ...doctorsTranslations,
    }

    const translatedDoctors = translateDoctors(doctorsCatalog, translations)
    const allDoctors = translatedDoctors.filter((doctor) => doctor.showInTeam !== false)
    const bySlug = new Map(allDoctors.map((doctor) => [doctor.slug, doctor]))

    return {
      allDoctors,
      mobileDoctors: HOME_MOBILE_DOCTOR_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean),
    }
  }, [directionTranslations, doctorsTranslations])
}
