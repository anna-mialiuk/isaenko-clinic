const isFilled = (value) => value !== undefined && value !== null && value !== ''

const mergeTextFields = (base, translation) => {
  if (!translation) return base

  return Object.fromEntries(Object.entries(translation).filter(([, value]) => isFilled(value)))
}

export function translateDoctors(doctors, translations = {}) {
  return doctors.map((doctor) => {
    const doctorTranslation = translations[doctor.slug]

    if (!doctorTranslation) return doctor

    return {
      ...doctor,
      ...mergeTextFields(doctor, doctorTranslation),

      prices: doctor.prices?.map((price, index) => {
        const translatedPrice = doctorTranslation.prices?.[index]

        if (!translatedPrice) return price

        return {
          ...price,
          ...mergeTextFields(price, translatedPrice),
        }
      }),
    }
  })
}
