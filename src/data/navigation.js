import { directionRoutes } from './directionRoutes'
import { getRoute } from '../utils/getRoute'

const directionLabels = {
  uk: {
    psychiatry: 'Психіатр',
    pathopsychology: 'Патопсихолог',
    psychotherapy: 'Психотерапевт',
    psychologist: 'Психолог',
    childpsychiatry: 'Дитяча психіатрія',
    neurologist: 'Невролог',
    neurophysiologist: 'Нейрофізіолог',
    therapist: 'Терапевт',
    sexologist: 'Сексолог',
    narcologist: 'Нарколог',
    ultrasound: 'УЗД',
  },

  ru: {
    psychiatry: 'Психиатр',
    pathopsychology: 'Патопсихолог',
    psychotherapy: 'Психотерапевт',
    psychologist: 'Психолог',
    childpsychiatry: 'Детская психиатрия',
    neurologist: 'Невролог',
    neurophysiologist: 'Нейрофизиолог',
    therapist: 'Терапевт',
    sexologist: 'Сексолог',
    narcologist: 'Нарколог',
    ultrasound: 'УЗИ',
  },

  en: {
    psychiatry: 'Psychiatrist',
    pathopsychology: 'Pathopsychologist',
    psychotherapy: 'Psychotherapist',
    psychologist: 'Psychologist',
    childpsychiatry: 'Child Psychiatry',
    neurologist: 'Neurologist',
    neurophysiologist: 'Neurophysiologist',
    therapist: 'Therapist',
    sexologist: 'Sexologist',
    narcologist: 'Addiction Specialist',
    ultrasound: 'Ultrasound',
  },
}

export const getDirectionsNavigation = (variant = 'kharkiv', language = 'uk') =>
  directionRoutes.map((route) => ({
    ...route,
    path: getRoute(variant, route.path),
    label: directionLabels[language][route.slug],
  }))

export const getMainNavigation = (variant = 'kharkiv', language = 'uk') => {
  const labels = {
    uk: {
      about: 'Про нас',
      team: 'Наша команда',
      hospital: variant === 'kyiv' ? 'Клініка у Києві' : 'Стаціонар у Харкові',
      contacts: 'Контакти',
    },

    ru: {
      about: 'О нас',
      team: 'Наша команда',
      hospital: variant === 'kyiv' ? 'Клиника в Киеве' : 'Стационар в Харькове',
      contacts: 'Контакты',
    },

    en: {
      about: 'About',
      team: 'Our Team',
      hospital: variant === 'kyiv' ? 'Kyiv Clinic' : 'Kharkiv Hospital',
      contacts: 'Contacts',
    },
  }

  return [
    {
      id: 'about',
      label: labels[language].about,
      path: getRoute(variant, '/about'),
    },
    {
      id: 'team',
      label: labels[language].team,
      path: getRoute(variant, '/team'),
    },
    {
      id: 'hospital',
      label: labels[language].hospital,
      path: getRoute(variant, '/hospital'),
    },
    {
      id: 'contacts',
      label: labels[language].contacts,
      path: getRoute(variant, '/contacts'),
    },
  ]
}

// Тимчасові експорти для сумісності зі старими компонентами
export const directionsNavigation = getDirectionsNavigation('kharkiv', 'uk')
export const mainNavigation = getMainNavigation('kharkiv', 'uk')
