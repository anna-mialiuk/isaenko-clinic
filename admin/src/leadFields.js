/**
 * Людські назви полів картки. Технічні ключі на кшталт utm_source
 * менеджеру нічого не кажуть — у картці мають бути слова з його роботи.
 */
export const FORM_LABELS = {
  callback_footer: 'Форма в футері',
  callback_widget: 'Віджет дзвінка',
  question_form: 'Форма запитання',
}

export const formLabel = (formName) => FORM_LABELS[formName] || formName || ''

export const leadTitle = (lead) => lead.name || formLabel(lead.form_name) || 'Без імені'

/** Мітки реклами: те, що замовник називає «звідки прийшов лід». */
export const TRAFFIC_FIELDS = [
  ['Байер', 'utm_source'],
  ['Канал', 'utm_medium'],
  ['Платформа', 'src_pl'],
  ['Кампанія', 'cmp_name', 'cmp_id', 'utm_campaign'],
  ['Група оголошень', 'grp_name', 'grp_id'],
  ['Оголошення', 'ad_name', 'ad_id'],
  ['Ключ', 'kw', 'utm_term'],
  ['Місце показу', 'plc', 'utm_content'],
]

/**
 * Значення з запасними полями: спершу назва, потім ID.
 * Google і Meta заповнюють різні набори, тому шукаємо по черзі.
 */
export const fieldValue = (lead, keys) => {
  for (const key of keys) {
    if (lead[key]) return lead[key]
  }

  return ''
}

/** Telegram і WhatsApp приймають номер без плюса й розділювачів. */
export const digitsOnly = (phone) => String(phone || '').replace(/\D+/g, '')
