export const darkLogos = {
  uk: '/images/logos/logo-dark-uk.webp?v=3',
  ru: '/images/logos/logo-dark-ru.webp?v=3',
  en: '/images/logos/logo-dark-en.webp?v=3',
}

export const getDarkLogo = (language) => darkLogos[language] || darkLogos.uk
