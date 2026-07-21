import { useMemo } from 'react'

import { featuredDoctors } from '../data/doctorsCatalog'
import { useLocale } from './useLocale'
import { translateDoctors } from '../utils/translateDoctors'

export function useDoctors() {
  const { doctorsTranslations } = useLocale()

  return useMemo(
    () => translateDoctors(featuredDoctors, doctorsTranslations),
    [doctorsTranslations],
  )
}
