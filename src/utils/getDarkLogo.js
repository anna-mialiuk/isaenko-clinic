import logoUk from '../assets/images/logos/logo-dark-uk.webp'
import logoRu from '../assets/images/logos/logo-dark-ru.webp'
import logoEn from '../assets/images/logos/logo-dark-en.webp'

export const darkLogos = {
  uk: logoUk,
  ru: logoRu,
  en: logoEn,
}

export const getDarkLogo = (language) => darkLogos[language] || darkLogos.uk
