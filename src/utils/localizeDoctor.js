/**
 * Перетворює лікаря з doctors.json у той «плаский» вигляд, до якого
 * звикли компоненти сайту: імʼя, посада, опис і ціни вже на поточній мові.
 *
 * Якщо на ru чи en поле порожнє — беремо українське, як і раніше робив
 * translateDoctors: краще текст іншою мовою, ніж порожнє місце на картці.
 */

const pick = (i18n, lang, field) => i18n?.[lang]?.[field] || i18n?.uk?.[field] || ''

export function localizeDoctor(doctor, lang) {
  const { i18n } = doctor

  return {
    // id — ключ для мобільної каруселі на головній.
    id: doctor.slug,
    slug: doctor.slug,
    image: doctor.image,
    cities: doctor.cities || [],
    online: doctor.online,
    experience: doctor.experience,
    hasHover: doctor.hasHover !== false,
    isFounder: Boolean(doctor.isFounder),
    showInTeam: doctor.showInTeam !== false,
    showOnHomeMobile: Boolean(doctor.showOnHomeMobile),
    directions: doctor.directions || [],

    name: pick(i18n, lang, 'name'),
    experienceText: pick(i18n, lang, 'experienceText'),
    position: pick(i18n, lang, 'position'),
    description: pick(i18n, lang, 'description'),
    homePosition: pick(i18n, lang, 'homePosition'),
    homeAbout: pick(i18n, lang, 'homeAbout'),

    prices: (doctor.prices || []).map((price) => ({
      service: pick(price.i18n, lang, 'service'),
      duration: pick(price.i18n, lang, 'duration'),
      price: price.price,
    })),
  }
}

/**
 * Варіант для карток на головній: там короткий маркетинговий текст
 * замість повних регалій. Порожні короткі поля — показуємо повні.
 */
export function toHomeCard(doctor) {
  return {
    ...doctor,
    position: doctor.homePosition || doctor.position,
    about: doctor.homeAbout,
  }
}
