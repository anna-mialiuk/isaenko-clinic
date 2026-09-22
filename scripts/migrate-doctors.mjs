/**
 * Разове перенесення лікарів із шести файлів проєкту в одну структуру.
 *
 * Зараз дані про лікаря розкидані так:
 *   src/data/directionDoctors.js      база українською: регалії, опис, ціни
 *   src/locales/directionDoctors.js   переклади uk / ru / en
 *   src/locales/doctors.js            короткі тексти для головної (position + about)
 *   src/data/doctorsCatalog.js        перевизначення фото, міст, стажу; засновниця
 *   src/data/directionDoctorsMap.js   хто на якій сторінці напряму
 *   HOME_MOBILE_DOCTOR_SLUGS          хто на головній у мобільному
 *
 * Результат — doctors.seed.json, який бекенд завантажить у базу.
 * Плюс звіт про розбіжності: їх треба бачити, а не мовчки виправляти.
 */

import { writeFileSync } from 'node:fs'

import { directionDoctors } from '../src/data/directionDoctors.js'
import { directionDoctorsMap } from '../src/data/directionDoctorsMap.js'
import { featuredDoctors, HOME_MOBILE_DOCTOR_SLUGS } from '../src/data/doctorsCatalog.js'
import directionTranslations from '../src/locales/directionDoctors.js'
import homeTranslations from '../src/locales/doctors.js'

const LANGS = ['uk', 'ru', 'en']

// Один лікар мав два ідентифікатори в різних файлах. Зводимо до одного.
const SLUG_ALIASES = {
  'kozhevnikova-viktoria': 'kozhevnikova-viktiriia',
}

const canonical = (slug) => SLUG_ALIASES[slug] || slug

const issues = []
const note = (slug, text) => issues.push(`${slug}: ${text}`)

const doctors = new Map()

const blank = (slug) => ({
  slug,
  image: '',
  cities: [],
  online: false,
  experience: '',
  isFounder: false,
  showInTeam: true,
  hasHover: true,
  showOnHomeMobile: false,
  directions: [],
  prices: [],
  i18n: Object.fromEntries(
    LANGS.map((lang) => [
      lang,
      {
        name: '',
        experienceText: '',
        position: '',
        description: '',
        // Короткий текст для карток на головній. Окремо від position,
        // бо там інша подача — маркетингова, а не регалії.
        homePosition: '',
        homeAbout: '',
      },
    ]),
  ),
})

const get = (slug) => {
  const key = canonical(slug)
  if (!doctors.has(key)) doctors.set(key, blank(key))
  return doctors.get(key)
}

// ── 1. База українською ───────────────────────────────
for (const source of directionDoctors) {
  const doctor = get(source.slug)

  doctor.image = source.image || ''
  doctor.online = Boolean(source.online)
  doctor.experience = source.experience || ''
  doctor.hasHover = source.hasHover !== false

  // Порожнє місто лишаємо як є — так було задумано в даних.
  doctor.cities = source.cities || []

  const uk = doctor.i18n.uk
  uk.name = source.name || ''
  uk.experienceText = source.experienceText || ''
  uk.position = source.position || ''
  uk.description = source.description || ''

  // Ціна від мови не залежить, назва послуги й тривалість — залежать.
  doctor.prices = (source.prices || []).map((price) => ({
    price: price.price || '',
    i18n: {
      uk: { service: price.service || '', duration: price.duration || '' },
      ru: { service: '', duration: '' },
      en: { service: '', duration: '' },
    },
  }))
}

// ── 2. Переклади повних текстів ──────────────────────
for (const lang of LANGS) {
  const block = directionTranslations[lang] || {}

  for (const [slug, translation] of Object.entries(block)) {
    const doctor = get(slug)
    const target = doctor.i18n[lang]

    if (translation.name) target.name = translation.name
    if (translation.experienceText) target.experienceText = translation.experienceText
    if (translation.position) target.position = translation.position
    if (translation.description) target.description = translation.description

    ;(translation.prices || []).forEach((price, index) => {
      if (!doctor.prices[index]) {
        note(slug, `${lang}: переклад ціни №${index + 1} без самої ціни — пропущено`)
        return
      }
      if (price.service) doctor.prices[index].i18n[lang].service = price.service
      if (price.duration) doctor.prices[index].i18n[lang].duration = price.duration
    })
  }
}

// ── 3. Короткі тексти для головної ───────────────────
for (const lang of LANGS) {
  const block = homeTranslations[lang] || {}

  for (const [slug, translation] of Object.entries(block)) {
    const doctor = get(slug)
    const target = doctor.i18n[lang]

    if (translation.position) target.homePosition = translation.position
    if (translation.about) target.homeAbout = translation.about

    // Засновниці немає в базовому списку — імʼя беремо звідси.
    if (!target.name && translation.name) target.name = translation.name
    if (!target.experienceText && translation.experienceText) {
      target.experienceText = translation.experienceText
    }
  }
}

// ── 4. Доповнення з каталогу ─────────────────────────
// Базовий файл головніший: каталог заповнює лише порожні поля.
// Раніше він перетирав базу, і для частини лікарів сайт показував
// застарілі фото, міста й стаж.
for (const featured of featuredDoctors) {
  const doctor = get(featured.slug)

  const isEmpty = (value) =>
    value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

  const fill = (field, value) => {
    if (value === undefined) return

    if (isEmpty(doctor[field])) {
      doctor[field] = value
      return
    }

    const before = JSON.stringify(doctor[field])
    const after = JSON.stringify(value)

    if (before !== after) {
      note(featured.slug, `${field}: лишаємо ${before}, каталог мав ${after}`)
    }
  }

  fill('image', featured.image)
  fill('cities', featured.cities)
  fill('experience', featured.experience)
  if (featured.isFounder) doctor.isFounder = true
  if (featured.showInTeam === false) doctor.showInTeam = false
  if (featured.hasHover !== undefined) doctor.hasHover = featured.hasHover
}

// ── 5. Напрями ───────────────────────────────────────
for (const [direction, slugs] of Object.entries(directionDoctorsMap)) {
  for (const slug of slugs) {
    const doctor = get(slug)
    if (!doctor.directions.includes(direction)) doctor.directions.push(direction)
  }
}

// ── 6. Головна, мобільна версія ──────────────────────
HOME_MOBILE_DOCTOR_SLUGS.forEach((slug) => {
  get(slug).showOnHomeMobile = true
})

// ── Перевірки ────────────────────────────────────────
const list = [...doctors.values()]

for (const doctor of list) {
  for (const lang of LANGS) {
    if (!doctor.i18n[lang].name) note(doctor.slug, `${lang}: немає імені`)
  }
  if (!doctor.image) note(doctor.slug, 'немає фото')
  if (!doctor.directions.length && !doctor.isFounder) {
    note(doctor.slug, 'не привʼязаний до жодного напряму')
  }
}

// Порядок як на сайті: засновниця першою, далі як у базовому файлі.
list.forEach((doctor, index) => {
  doctor.position = doctor.isFounder ? 0 : index + 1
})
list.sort((a, b) => a.position - b.position)

writeFileSync('doctors.seed.json', JSON.stringify(list, null, 2))

console.log(`Лікарів: ${list.length}`)
console.log(`Засновниця: ${list.find((d) => d.isFounder)?.slug || '—'}`)
console.log(`На головній (мобільна): ${list.filter((d) => d.showOnHomeMobile).length}`)
console.log('')
console.log(`Розбіжності (${issues.length}):`)
issues.forEach((line) => console.log('  ' + line))
