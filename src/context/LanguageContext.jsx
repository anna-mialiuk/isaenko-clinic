import { useCallback, useEffect, useState } from 'react'

import { LanguageContext } from './LanguageContext'

const DEFAULT_LANGUAGE = 'uk'
const STORAGE_KEY = 'language'
const SUPPORTED_LANGUAGES = ['uk', 'ru', 'en']

const getSavedLanguage = () => {
  const savedLanguage = localStorage.getItem(STORAGE_KEY)

  return SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage)

  const setLanguage = useCallback((newLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) return

    setLanguageState(newLanguage)
    localStorage.setItem(STORAGE_KEY, newLanguage)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
