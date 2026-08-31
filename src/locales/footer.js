import { offerAgreementUrl } from '../data/legal'

const license = {
  uk: "Ліцензії: затверджено Наказ Міністерства охорони здоров'я України від 20.12.2018 №2373; затверджено Наказ Міністерства охорони здоров'я України від 20.11.2020 №2696",
  ru: 'Лицензии: утверждено Приказом Министерства здравоохранения Украины от 20.12.2018 N2373; утверждено Приказом Министерства здравоохранения Украины от 20.11.2020 N2696',
  en: 'Licenses: approved by the Order of the Ministry of Health of Ukraine dated 20.12.2018 N2373; approved by the Order of the Ministry of Health of Ukraine dated 20.11.2020 N2696',
}

const labels = {
  uk: {
    navigation: 'Навігація',
    directions: 'Напрями',
    workSchedule: 'Графік роботи',
    supportChats: 'Чати підтримки',
  },
  ru: {
    navigation: 'Навигация',
    directions: 'Направления',
    workSchedule: 'График работы',
    supportChats: 'Чаты поддержки',
  },
  en: {
    navigation: 'Navigation',
    directions: 'Directions',
    workSchedule: 'Working Hours',
    supportChats: 'Support Chats',
  },
}

export const footer = {
  kharkiv: {
    uk: {
      licenseText: license.uk,
      labels: labels.uk,
      rights: '«Dr. Isaenko» 2012 - 2026. Всі права захищені',
      stationaryText: 'Стаціонар м. Харків працює цілодобово',
      workSchedule: [
        { day: 'Пн-Пт', time: '10:00 - 20:00' },
        { day: 'Сб', time: '10:00 - 18:00' },
        { day: 'Нд', time: '11:00 - 16:00' },
      ],
      documents: [
        { label: 'Договір Оферти', href: offerAgreementUrl, underlined: true },
        { label: 'Користувацька угода', href: '/' },
        { label: 'Публічна угода про надання медичних послуг', href: '/' },
      ],
    },
    ru: {
      licenseText: license.ru,
      labels: labels.ru,
      rights: '«Dr. Isaenko» 2012 - 2026. Все права защищены',
      stationaryText: 'Стационар в Харькове работает круглосуточно',
      workSchedule: [
        { day: 'Пн-Пт', time: '10:00 - 20:00' },
        { day: 'Сб', time: '10:00 - 18:00' },
        { day: 'Вс', time: '11:00 - 16:00' },
      ],
      documents: [
        { label: 'Договор оферты', href: offerAgreementUrl, underlined: true },
        { label: 'Пользовательское соглашение', href: '/' },
        {
          label: 'Публичное соглашение об оказании медицинских услуг',
          href: '/',
        },
      ],
    },
    en: {
      licenseText: license.en,
      labels: labels.en,
      rights: '© Dr. Isaenko 2012–2026. All rights reserved.',
      stationaryText: 'Inpatient treatment in Kharkiv operates 24/7',
      workSchedule: [
        { day: 'Mon-Fri', time: '10:00 - 20:00' },
        { day: 'Sat', time: '10:00 - 18:00' },
        { day: 'Sun', time: '11:00 - 16:00' },
      ],
      documents: [
        { label: 'Offer Agreement', href: offerAgreementUrl, underlined: true },
        { label: 'User Agreement', href: '/' },
        {
          label: 'Public Agreement on the Provision of Medical Services',
          href: '/',
        },
      ],
    },
  },
  kyiv: {
    uk: {
      licenseText: license.uk,
      labels: labels.uk,
      rights: '«Dr. Isaenko» 2012 - 2026. Всі права захищені',
      stationaryText: '',
      workSchedule: [
        { day: 'Пн-Пт', time: '10:00 - 20:00' },
        { day: 'Сб', time: '10:00 - 18:00' },
        { day: 'Нд', time: 'Вихідний' },
      ],
      documents: [
        { label: 'Договір Оферти', href: offerAgreementUrl, underlined: true },
        { label: 'Користувацька угода', href: '/' },
        { label: 'Публічна угода про надання медичних послуг', href: '/' },
      ],
    },
    ru: {
      licenseText: license.ru,
      labels: labels.ru,
      rights: '«Dr. Isaenko» 2012 - 2026. Все права защищены',
      stationaryText: '',
      workSchedule: [
        { day: 'Пн-Пт', time: '10:00 - 20:00' },
        { day: 'Сб', time: '10:00 - 18:00' },
        { day: 'Вс', time: 'Выходной' },
      ],
      documents: [
        { label: 'Договор оферты', href: offerAgreementUrl, underlined: true },
        { label: 'Пользовательское соглашение', href: '/' },
        {
          label: 'Публичный договор об оказании медицинских услуг',
          href: '/',
        },
      ],
    },
    en: {
      licenseText: license.en,
      labels: labels.en,
      rights: '© Dr. Isaenko 2012–2026. All rights reserved.',
      stationaryText: '',
      workSchedule: [
        { day: 'Mon-Fri', time: '10:00 - 20:00' },
        { day: 'Sat', time: '10:00 - 18:00' },
        { day: 'Sun', time: 'Closed' },
      ],
      documents: [
        { label: 'Offer Agreement', href: offerAgreementUrl, underlined: true },
        { label: 'User Agreement', href: '/' },
        { label: 'Public Medical Services Agreement', href: '/' },
      ],
    },
  },
}
