export const logos = {
  uk: '/images/logos/logo-uk.png',
  ru: '/images/logos/logo-ru.webp',
  en: '/images/logos/logo-en.webp',
}

export const getLogo = (language) => logos[language] || logos.uk
