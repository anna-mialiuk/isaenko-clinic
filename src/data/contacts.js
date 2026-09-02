export const contacts = [
  {
    id: 'kharkiv',
    city: {
      uk: 'Харків',
      ru: 'Харьков',
      en: 'Kharkiv',
    },
    schedule: [
      { day: 'Пн-Пт', time: '10:00 - 20:00' },
      { day: 'Сб', time: '10:00 - 18:00' },
      { day: 'Нд', time: '11:00 - 16:00' },
    ],
    phone: '+38 066 37-77-908',
    phoneHref: 'tel:+380663777908',
    email: 'dr.Isaenko.clinic@gmail.com',
    mapUrl: 'https://www.google.com/maps?q=Kharkiv%20Dr%20Isaenko&output=embed',
  },
  {
    id: 'kyiv',
    city: {
      uk: 'Київ',
      ru: 'Киев',
      en: 'Kyiv',
    },
    schedule: [
      { day: 'Пн-Пт', time: '10:00 - 20:00' },
      { day: 'Сб', time: '10:00 - 18:00' },
      { day: 'Нд', time: 'Вихідний' },
    ],
    phone: '+38 097 88-88-911',
    phoneHref: 'tel:+380978888911',
    email: 'dr.Isaenko.clinic@gmail.com',
    mapUrl: 'https://www.google.com/maps?q=Kyiv%20Dr%20Isaenko&output=embed',
  },
]
