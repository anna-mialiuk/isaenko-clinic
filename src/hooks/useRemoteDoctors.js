import { useMemo, useSyncExternalStore } from 'react'

import { getDoctorsSnapshot, subscribeDoctors } from '../data/doctorsSource'
import { localizeDoctor } from '../utils/localizeDoctor'
import { useLanguage } from './useLanguage'

/**
 * Лікарі з панелі на поточній мові — або null, якщо файл ще не
 * завантажився чи недоступний. Компоненти на null показують дані
 * зі збірки, тож сторінка не буває порожньою.
 */
export function useRemoteDoctors() {
  const { language } = useLanguage()
  const raw = useSyncExternalStore(subscribeDoctors, getDoctorsSnapshot, () => null)

  return useMemo(
    () => (raw ? raw.map((doctor) => localizeDoctor(doctor, language)) : null),
    [raw, language],
  )
}
