import logoUk from '../assets/images/logos/logo-uk.png'
import logoRu from '../assets/images/logos/logo-ru.webp'
import logoEn from '../assets/images/logos/logo-en.webp'

export const logos = {
  uk: logoUk,
  ru: logoRu,
  en: logoEn,
}

export const getLogo = (language) => logos[language] || logos.uk
