/**
 * Лікарі з панелі керування.
 *
 * Сайт читає /data/doctors.json — файл, який панель перегенеровує при
 * кожному збереженні. Поки він вантажиться (або якщо не завантажився),
 * компоненти показують лікарів зі збірки сайту — тих самих, що були
 * до переїзду. Порожній розділ «Наша команда» на медичному сайті
 * гірший за трохи застарілі дані.
 */

const SOURCE_URL = '/data/doctors.json'
const TIMEOUT_MS = 8000

let doctors = null
let request = null
const listeners = new Set()

const notify = () => listeners.forEach((listener) => listener())

/** Перевірка, що файл справді схожий на список лікарів. */
const isValid = (payload) =>
  Array.isArray(payload?.doctors) &&
  payload.doctors.length > 0 &&
  payload.doctors.every((doctor) => doctor?.slug && doctor?.i18n?.uk)

export function loadDoctors() {
  if (request) return request

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  request = fetch(SOURCE_URL, { signal: controller.signal })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      // Порожній або битий файл — лишаємося на даних зі збірки,
      // а не показуємо сторінку без лікарів.
      if (!isValid(payload)) return

      doctors = payload.doctors
      notify()
    })
    .catch(() => {
      // Мережа, таймаут, CORS — не страшно: є запасні дані.
    })
    .finally(() => clearTimeout(timer))

  return request
}

export const subscribeDoctors = (listener) => {
  listeners.add(listener)
  loadDoctors()

  return () => listeners.delete(listener)
}

export const getDoctorsSnapshot = () => doctors
