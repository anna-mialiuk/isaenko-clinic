export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://dr-isaenko.com'

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.webp`

export const CLINIC_SCHEMA_BASE = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Dr. Isaenko',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  image: DEFAULT_OG_IMAGE,
  medicalSpecialty: ['Psychiatry', 'Psychotherapy', 'Psychology', 'Neurology', 'AddictionMedicine'],
  telephone: '+380663777908',
  sameAs: ['https://www.instagram.com/dr.isaenko.clinic'],
}
