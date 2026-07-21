import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import DoctorCard from '../../components/DoctorCard/DoctorCard'

import { useDoctorsCatalog } from '../../hooks/useDoctorsCatalog'
import { useLocale } from '../../hooks/useLocale'
import { getRoute } from '../../utils/getRoute'
import { getDoctorGroup } from '../../utils/getDoctorGroup'

import './Doctors.sass'

const DESKTOP_DOCTORS_COUNT = 6
const MOBILE_CHANGE_INTERVAL = 3000
const STORAGE_KEY = 'isaenko-desktop-doctors-group'

let cachedDesktopGroupIndex = null

function getNextDesktopDoctors(allDoctors) {
  if (allDoctors.length <= DESKTOP_DOCTORS_COUNT) return allDoctors

  const groupsCount = Math.ceil(allDoctors.length / DESKTOP_DOCTORS_COUNT)
  let previousGroup

  try {
    previousGroup = Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? '-1', 10)
  } catch {
    previousGroup = -1
  }

  if (cachedDesktopGroupIndex === null) {
    cachedDesktopGroupIndex = Number.isFinite(previousGroup)
      ? (previousGroup + 1) % groupsCount
      : Math.floor(Math.random() * groupsCount)
  }

  const startIndex = cachedDesktopGroupIndex * DESKTOP_DOCTORS_COUNT
  const selected = getDoctorGroup(allDoctors, startIndex, DESKTOP_DOCTORS_COUNT)

  try {
    localStorage.setItem(STORAGE_KEY, String(cachedDesktopGroupIndex))
  } catch {
    // Сайт працюватиме й без localStorage.
  }

  return selected
}

function Doctors({ variant = 'kharkiv' }) {
  const { doctors: content } = useLocale()
  const { allDoctors: desktopDoctorsPool, mobileDoctors } = useDoctorsCatalog()

  const desktopDoctors = useMemo(
    () => getNextDesktopDoctors(desktopDoctorsPool),
    [desktopDoctorsPool],
  )

  const [activeDoctorIndex, setActiveDoctorIndex] = useState(0)

  useEffect(() => {
    if (mobileDoctors.length <= 1) return undefined

    const interval = window.setInterval(() => {
      setActiveDoctorIndex((previousIndex) =>
        previousIndex === mobileDoctors.length - 1 ? 0 : previousIndex + 1,
      )
    }, MOBILE_CHANGE_INTERVAL)

    return () => window.clearInterval(interval)
  }, [mobileDoctors.length])

  return (
    <section className="doctors" id="team">
      <div className="doctors__container container">
        <h2 className="doctors__title h2">{content.title}</h2>

        <div className="doctors__grid">
          {desktopDoctors.map((doctor) => (
            <DoctorCard key={doctor.slug} doctor={doctor} />
          ))}
        </div>

        <div
          className="doctors__slider"
          aria-live="polite"
          aria-atomic="true"
          aria-label={content.title}
        >
          {mobileDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`doctors__slider-card ${
                index === activeDoctorIndex ? 'doctors__slider-card--active' : ''
              }`}
            >
              <DoctorCard doctor={doctor} isCurrent={index === activeDoctorIndex} />
            </div>
          ))}
        </div>

        <div className="doctors__actions">
          <Link to={getRoute(variant, '/team')} className="doctors__button">
            {content.button}
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Doctors
