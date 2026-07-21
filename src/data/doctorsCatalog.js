import { directionDoctors } from './directionDoctors.js'

export const HOME_MOBILE_DOCTOR_SLUGS = [
  'matsiuk-anna',
  'heorhievska-natalia',
  'tsebriuk-kateryna',
  'marchenko-maryna',
  'kozhevnikova-viktoria',
  'rudenko-tetiana',
]

// Налаштування карток, які використовуються на головній сторінці.
// Тексти лікарів зберігаються лише в src/locales/doctors.js та
// src/locales/directionDoctors.js.
const featuredDoctorSettings = [
  {
    id: 1,
    slug: 'isaenko-svitlana',
    isFounder: true,
    showInTeam: false,
    hasHover: true,
    directions: ['psychiatrist', 'psychotherapist'],
    cities: ['kharkiv', 'kyiv'],
    experience: '10+',
    image: '/src/assets/images/doctors/doctor-1.webp',
  },
  {
    id: 2,
    slug: 'matsiuk-anna',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '5+',
    image: '/src/assets/images/doctors/doctor-2.webp',
  },
  {
    id: 3,
    slug: 'heorhievska-natalia',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '20+',
    image: '/src/assets/images/doctors/doctor-3.webp',
  },
  {
    id: 4,
    slug: 'tsebriuk-kateryna',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '3+',
    image: '/src/assets/images/doctors/doctor-4.webp',
  },
  {
    id: 5,
    slug: 'marchenko-maryna',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '14+',
    image: '/src/assets/images/doctors/doctor-5.webp',
  },
  {
    id: 6,
    slug: 'kozhevnikova-viktoria',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '30+',
    image: '/src/assets/images/doctors/doctor-6.webp',
  },
  {
    id: 7,
    slug: 'rudenko-tetiana',
    showInTeam: true,
    hasHover: true,
    cities: ['kharkiv'],
    experience: '15+',
    image: '/src/assets/images/doctors/doctor-7.webp',
  },
]

const featuredBySlug = new Map(featuredDoctorSettings.map((doctor) => [doctor.slug, doctor]))

const directionDoctorSlugs = new Set(directionDoctors.map((doctor) => doctor.slug))

export const doctorsCatalog = [
  ...directionDoctors.map((doctor) => ({
    ...doctor,
    ...featuredBySlug.get(doctor.slug),
  })),
  ...featuredDoctorSettings.filter((doctor) => !directionDoctorSlugs.has(doctor.slug)),
]

export const featuredDoctors = featuredDoctorSettings
