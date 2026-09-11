export const logos = {
  uk: '/images/logos/logo-uk.png?v=3',
  ru: '/images/logos/logo-ru.webp?v=3',
  en: '/images/logos/logo-en.webp?v=3',
}

export const getLogo = (language) => logos[language] || logos.uk
