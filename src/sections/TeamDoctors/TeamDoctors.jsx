import { useState } from 'react'

import DirectionDoctorColumn from '../../components/DirectionDoctorColumn/DirectionDoctorColumn'

import { directionDoctors } from '../../data/directionDoctors'
import { directionDoctorsMap } from '../../data/directionDoctorsMap'
import { getDirectionsNavigation } from '../../data/navigation'
import { useLanguage } from '../../hooks/useLanguage'
import { useLocale } from '../../hooks/useLocale'
import { translateDoctors } from '../../utils/translateDoctors'

import './TeamDoctors.sass'

function TeamDoctors({ variant = 'kharkiv' }) {
  const [cityFilter, setCityFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('')
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false)

  const { language } = useLanguage()
  const { directionDoctors: directionDoctorsLocale, teamDoctors } = useLocale()

  const directionsNavigation = getDirectionsNavigation(variant, language)
  const translatedDoctors = translateDoctors(directionDoctors, directionDoctorsLocale)

  const cityFilters = [
    { id: 'all', label: teamDoctors.filters.all },
    { id: 'kyiv', label: teamDoctors.filters.kyiv },
    { id: 'kharkiv', label: teamDoctors.filters.kharkiv },
    { id: 'online', label: teamDoctors.filters.online },
  ]

  const activeDirection = directionsNavigation.find(
    (direction) => direction.slug === directionFilter,
  )

  let filteredDoctors = [...translatedDoctors]

  if (cityFilter === 'online') {
    filteredDoctors = filteredDoctors.filter((doctor) => doctor.online)
  } else if (cityFilter !== 'all') {
    filteredDoctors = filteredDoctors.filter((doctor) => doctor.cities?.includes(cityFilter))
  }

  if (directionFilter) {
    const doctorSlugs = directionDoctorsMap[directionFilter] || []

    filteredDoctors = filteredDoctors.filter((doctor) => doctorSlugs.includes(doctor.slug))
  }

  return (
    <section className="team-doctors">
      <div className="container team-doctors__container">
        <h1 className="team-doctors__title h1">{teamDoctors.title}</h1>

        <div className="team-doctors__filters">
          {cityFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`team-doctors__filter ${
                cityFilter === filter.id && !directionFilter ? 'team-doctors__filter--active' : ''
              }`}
              onClick={() => {
                setCityFilter(filter.id)

                if (filter.id === 'all') {
                  setDirectionFilter('')
                }
              }}
            >
              {filter.label}
            </button>
          ))}

          <div className="team-doctors__dropdown">
            <button
              type="button"
              className={`team-doctors__dropdown-button ${
                isDirectionsOpen || directionFilter ? 'team-doctors__dropdown-button--active' : ''
              }`}
              onClick={() => setIsDirectionsOpen(!isDirectionsOpen)}
            >
              {activeDirection ? activeDirection.label : teamDoctors.filters.directions}

              <span className="team-doctors__dropdown-arrow"></span>
            </button>

            {isDirectionsOpen && (
              <div className="team-doctors__dropdown-list">
                {directionsNavigation.map((direction) => (
                  <button
                    key={direction.slug}
                    type="button"
                    className="team-doctors__dropdown-item"
                    onClick={() => {
                      setDirectionFilter(direction.slug)
                      setCityFilter('all')
                      setIsDirectionsOpen(false)
                    }}
                  >
                    {direction.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="team-doctors__grid">
          {filteredDoctors.map((doctor) => (
            <DirectionDoctorColumn key={doctor.slug} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamDoctors
