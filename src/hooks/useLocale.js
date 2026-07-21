import { locales } from '../locales'
import { useLanguage } from './useLanguage'

export function useLocale() {
  const { language } = useLanguage()
  const currentLocale = locales[language] || {}

  return {
    ...locales.uk,
    ...currentLocale,
    language,
  }
}
