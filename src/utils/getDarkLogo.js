export const darkLogos = {
  uk: '/images/logos/logo-dark-uk.webp',
  ru: '/images/logos/logo-dark-ru.webp',
  en: '/images/logos/logo-dark-en.webp',
}

export const getDarkLogo = (language) => darkLogos[language] || darkLogos.uk
