import { useEffect, useState } from 'react'

import { api } from './api'
import DoctorForm from './DoctorForm'
import { LANGS, missingLangs } from './doctorsConfig'

import './Doctors.sass'

function Doctors() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = () => setReloadKey((key) => key + 1)

  useEffect(() => {
    let ignore = false

    api
      .doctors()
      .then((data) => {
        if (!ignore) setItems(data.items)
      })
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити лікарів')
      })

    return () => {
      ignore = true
    }
  }, [reloadKey])

  // Перестановка стрілками, а не перетягуванням: HTML5 drag-and-drop
  // не працює на тачскрінах, а список правитимуть і з телефона.
  const move = async (index, delta) => {
    const target = index + delta

    if (target < 0 || target >= items.length) return

    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]

    setItems(next)

    try {
      await api.reorderDoctors(next.map((doctor) => doctor.id))
    } catch {
      setError('Не вдалося змінити порядок')
      reload()
    }
  }

  const toggleActive = async (doctor) => {
    const active = doctor.is_active ? 0 : 1

    setItems((list) =>
      list.map((item) => (item.id === doctor.id ? { ...item, is_active: active } : item)),
    )

    try {
      await api.setDoctorActive(doctor.id, active)
    } catch {
      setError('Не вдалося змінити видимість')
      reload()
    }
  }

  if (editing !== null) {
    return (
      <DoctorForm
        doctorId={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          reload()
        }}
      />
    )
  }

  if (error && !items) return <p className="page__error">{error}</p>
  if (!items) return <p className="page__empty">Завантаження…</p>

  return (
    <div className="doctors">
      <header className="doctors__header">
        <h1 className="page__title">Лікарі</h1>
        <span className="doctors__count">{items.length}</span>

        <button type="button" className="doctors__add" onClick={() => setEditing('new')}>
          Додати лікаря
        </button>
      </header>

      {error && <p className="page__error doctors__error">{error}</p>}

      <p className="doctors__hint">
        Порядок у списку — порядок на сайті. Прихований лікар зникає з сайту, але лишається тут:
        його можна повернути одним кліком.
      </p>

      <ul className="doctor-list">
        {items.map((doctor, index) => {
          const missing = missingLangs(doctor)

          return (
            <li
              key={doctor.id}
              className={`doctor-list__row ${doctor.is_active ? '' : 'is-hidden'}`}
            >
              <span className="doctor-list__order">
                <button
                  type="button"
                  className="doctor-list__arrow"
                  aria-label="Вище"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="doctor-list__arrow"
                  aria-label="Нижче"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
              </span>

              <span className="doctor-list__photo">
                {doctor.image ? <img src={doctor.image} alt="" loading="lazy" /> : null}
              </span>

              <button
                type="button"
                className="doctor-list__main"
                onClick={() => setEditing(doctor.id)}
              >
                <span className="doctor-list__name">{doctor.i18n?.uk?.name || doctor.slug}</span>

                <span className="doctor-list__meta">
                  {doctor.isFounder && <span className="tag tag--accent">Засновниця</span>}
                  {!doctor.is_active && <span className="tag">Прихований</span>}
                  {doctor.cities?.filter(Boolean).length === 0 && (
                    <span className="tag">Онлайн</span>
                  )}
                  {missing.length > 0 && (
                    <span className="tag tag--warn">
                      Немає імені: {missing.map((id) => id.toUpperCase()).join(', ')}
                    </span>
                  )}
                </span>
              </button>

              <span className="doctor-list__actions">
                <button
                  type="button"
                  className="doctor-list__button"
                  onClick={() => toggleActive(doctor)}
                >
                  {doctor.is_active ? 'Приховати' : 'Показати'}
                </button>

                <button
                  type="button"
                  className="doctor-list__button is-primary"
                  onClick={() => setEditing(doctor.id)}
                >
                  Редагувати
                </button>
              </span>
            </li>
          )
        })}
      </ul>

      <p className="doctors__note">
        Зміни зʼявляються на сайті протягом хвилини: стільки файл зі списком лікарів кешується.
        Мови: {LANGS.map(({ label }) => label.toLowerCase()).join(', ')}.
      </p>
    </div>
  )
}

export default Doctors
