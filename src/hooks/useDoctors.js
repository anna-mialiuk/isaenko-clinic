import { useMemo } from 'react'

import { featuredDoctors } from '../data/doctorsCatalog'
import { useLocale } from './useLocale'
import { translateDoctors } from '../utils/translateDoctors'
import { toHomeCard } from '../utils/localizeDoctor'
import { useRemoteDoctors } from './useRemoteDoctors'

export function useDoctors() {
  const { doctorsTranslations } = useLocale()
  const remoteDoctors = useRemoteDoctors()

  return useMemo(
    () =>
      remoteDoctors
        ? remoteDoctors.map(toHomeCard)
        : translateDoctors(featuredDoctors, doctorsTranslations),
    [doctorsTranslations, remoteDoctors],
  )
}
