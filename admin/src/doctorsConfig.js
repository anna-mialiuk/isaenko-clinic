/** Мови сайту. Порядок = порядок вкладок у формі. */
export const LANGS = [
  { id: 'uk', label: 'Українська', short: 'UA' },
  { id: 'ru', label: 'Російська', short: 'RU' },
  { id: 'en', label: 'Англійська', short: 'EN' },
]

export const CITIES = [
  { id: 'kharkiv', label: 'Харків' },
  { id: 'kyiv', label: 'Київ' },
]

/** Ті самі id і назви, що в src/data/directionRoutes.js сайту. */
export const DIRECTIONS = [
  { id: 'psychiatry', label: 'Психіатр' },
  { id: 'pathopsychology', label: 'Патопсихолог' },
  { id: 'psychotherapy', label: 'Психотерапевт' },
  { id: 'psychologist', label: 'Психолог' },
  { id: 'childpsychiatry', label: 'Дитяча психіатрія' },
  { id: 'neurologist', label: 'Невролог' },
  { id: 'neurophysiologist', label: 'Нейрофізіолог' },
  { id: 'therapist', label: 'Терапевт' },
  { id: 'sexologist', label: 'Сексолог' },
  { id: 'narcologist', label: 'Нарколог' },
  { id: 'ultrasound', label: 'УЗД' },
]

const emptyTexts = () => ({
  lastName: '',
  firstName: '',
  middleName: '',
  experienceText: '',
  position: '',
  description: '',
  homePosition: '',
  homeAbout: '',
})

export const emptyPrice = () => ({
  price: '',
  i18n: Object.fromEntries(LANGS.map(({ id }) => [id, { service: '', duration: '' }])),
})

export const emptyDoctor = () => ({
  id: null,
  slug: '',
  image: '',
  cities: [],
  online: true,
  experience: '',
  isFounder: false,
  showInTeam: true,
  hasHover: true,
  showOnHomeMobile: false,
  directions: [],
  prices: [],
  i18n: Object.fromEntries(LANGS.map(({ id }) => [id, emptyTexts()])),
})

/**
 * Транслітерація для ідентифікатора: із «Іваненко Олена» робимо
 * ivanenko-olena. Ідентифікатор потрапляє в URL і звʼязки з напрямами,
 * тому лише латиниця.
 */
const TRANSLIT = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',
  ʼ: '',
  "'": '',
}

export const slugFromName = (lastName, firstName) =>
  `${lastName} ${firstName}`
    .toLowerCase()
    .split('')
    .map((char) => (char in TRANSLIT ? TRANSLIT[char] : char))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 2)
    .join('-')

/** Мови, де не заповнені прізвище чи імʼя — для позначки на вкладці. */
export const missingLangs = (doctor) =>
  LANGS.filter(({ id }) => {
    const texts = doctor.i18n?.[id] || {}
    return !texts.lastName?.trim() || !texts.firstName?.trim()
  }).map(({ id }) => id)
