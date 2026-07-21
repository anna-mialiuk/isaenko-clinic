import { directionDoctors } from '../src/data/directionDoctors.js'
import { featuredDoctors } from '../src/data/doctorsCatalog.js'
import directionTranslations from '../src/locales/directionDoctors.js'
import doctorsTranslations from '../src/locales/doctors.js'

const languages = ['uk', 'ru', 'en']
const doctors = new Map(
  [...directionDoctors, ...featuredDoctors].map((doctor) => [doctor.slug, doctor]),
)
const requiredFields = ['name', 'experienceText', 'position']
const problems = []

for (const language of languages) {
  const translations = {
    ...directionTranslations[language],
    ...doctorsTranslations[language],
  }

  for (const slug of doctors.keys()) {
    const translation = translations[slug]

    if (!translation) {
      problems.push(`${language}: відсутній переклад для ${slug}`)
      continue
    }

    for (const field of requiredFields) {
      if (!translation[field]?.trim()) {
        problems.push(`${language}: ${slug} не має поля ${field}`)
      }
    }
  }
}

if (problems.length) {
  console.error('Doctor translation check failed:\n' + problems.join('\n'))
  process.exit(1)
}

console.log(
  `Checked ${doctors.size} doctor profiles in ${languages.length} languages. Problems: 0.`,
)
