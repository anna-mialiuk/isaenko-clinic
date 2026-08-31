export const DEFAULT_CITY_ID = 'kharkiv'

export const BOOKING_URL = '/go/booking'

const COMMON_SOCIALS = {
  instagram: 'https://www.instagram.com/dr.isaenko.clinic?igsh=aXNncTBnNHR1ZTVt',
  facebook: 'https://www.facebook.com/share/1ByK24umBX/?mibextid=wwXIfr',
  whatsapp: 'https://wa.me/+380978888911',
}

export const SOCIAL_LINKS = {
  kharkiv: {
    ...COMMON_SOCIALS,
    telegram: 'https://t.me/dr_isaenko_clinic_kharkiv',
  },
  kyiv: {
    ...COMMON_SOCIALS,
    telegram: 'https://t.me/Dr_IsaenkoClinic',
  },
}
