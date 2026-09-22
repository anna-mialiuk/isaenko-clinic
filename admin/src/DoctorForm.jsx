import { useEffect, useRef, useState } from 'react'

import { api } from './api'
import {
  CITIES,
  DIRECTIONS,
  LANGS,
  emptyDoctor,
  emptyPrice,
  missingLangs,
  slugFromName,
} from './doctorsConfig'

import './DoctorForm.sass'

function DoctorForm({ doctorId, onClose, onSaved }) {
  const isNew = doctorId === null

  const [doctor, setDoctor] = useState(isNew ? emptyDoctor() : null)
  const [lang, setLang] = useState('uk')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Для нового лікаря ідентифікатор підставляється з імені, доки
  // його не відредагували вручну.
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const fileInput = useRef(null)

  useEffect(() => {
    if (isNew) return

    let ignore = false

    api
      .doctor(doctorId)
      .then((data) => {
        if (!ignore) setDoctor(data)
      })
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити картку')
      })

    return () => {
      ignore = true
    }
  }, [doctorId, isNew])

  if (!doctor) {
    return error ? (
      <p className="page__error">{error}</p>
    ) : (
      <p className="page__empty">Завантаження…</p>
    )
  }

  const set = (patch) => setDoctor((current) => ({ ...current, ...patch }))

  const setText = (field, value) => {
    setDoctor((current) => {
      const next = {
        ...current,
        i18n: { ...current.i18n, [lang]: { ...current.i18n[lang], [field]: value } },
      }

      if ((field === 'lastName' || field === 'firstName') && lang === 'uk' && !slugTouched) {
        const uk = next.i18n.uk
        next.slug = slugFromName(uk.lastName, uk.firstName)
      }

      return next
    })
  }

  const toggleIn = (field, value) => {
    const list = doctor[field] || []
    set({
      [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    })
  }

  // ── Ціни ─────────────────────────────────────────
  const updatePrice = (index, patch) => {
    set({
      prices: doctor.prices.map((price, i) => (i === index ? { ...price, ...patch } : price)),
    })
  }

  const updatePriceText = (index, field, value) => {
    const price = doctor.prices[index]
    updatePrice(index, {
      i18n: { ...price.i18n, [lang]: { ...price.i18n[lang], [field]: value } },
    })
  }

  const movePrice = (index, delta) => {
    const target = index + delta
    if (target < 0 || target >= doctor.prices.length) return

    const next = [...doctor.prices]
    ;[next[index], next[target]] = [next[target], next[index]]
    set({ prices: next })
  }

  // ── Фото ─────────────────────────────────────────
  const upload = async (file) => {
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const result = await api.uploadDoctorPhoto(file, doctor.slug)
      set({ image: result.url })
    } catch (err) {
      setError(err.message || 'Не вдалося завантажити фото')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const save = async () => {
    setBusy(true)
    setError('')

    try {
      await api.saveDoctor(doctor)
      onSaved()
    } catch (err) {
      setError(err.message || 'Не вдалося зберегти')
      setBusy(false)
    }
  }

  const texts = doctor.i18n[lang]
  const missing = missingLangs(doctor)
  const onlineOnly = doctor.cities.filter(Boolean).length === 0

  return (
    <div className="doctor-form">
      <header className="doctor-form__header">
        <button type="button" className="doctor-form__back" onClick={onClose}>
          ← До списку
        </button>

        <h1 className="page__title">
          {isNew
            ? 'Новий лікар'
            : [doctor.i18n.uk.lastName, doctor.i18n.uk.firstName].filter(Boolean).join(' ') ||
              doctor.slug}
        </h1>
      </header>

      <div className="doctor-form__grid">
        {/* ── Фото й стаж: те, що на картці незалежно від мови ── */}
        <aside className="doctor-form__side">
          <section className="panel">
            <h2 className="panel__title">Фото</h2>

            <div className="photo">
              <span className="photo__preview">
                {doctor.image ? <img src={doctor.image} alt="" /> : <span>Немає фото</span>}
              </span>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="photo__input"
                onChange={(event) => upload(event.target.files?.[0])}
              />

              <button
                type="button"
                className="button"
                disabled={uploading || !doctor.slug}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? 'Завантаження…' : doctor.image ? 'Замінити фото' : 'Завантажити фото'}
              </button>

              {!doctor.slug && (
                <p className="photo__hint">
                  Спершу заповніть прізвище й імʼя — від них залежить назва файлу.
                </p>
              )}

              <p className="photo__hint">
                JPG, PNG або WEBP до 8 МБ. Великі фото автоматично стискаються.
              </p>
            </div>
          </section>

          <section className="panel">
            <h2 className="panel__title">Стаж</h2>

            <input
              className="input"
              placeholder="10+"
              value={doctor.experience}
              onChange={(event) => set({ experience: event.target.value })}
            />

            <p className="form-note">Число однакове для всіх мов, підпис — на вкладках праворуч.</p>
          </section>
        </aside>

        {/* ── Тексти картки на трьох мовах ── */}
        <div className="doctor-form__main">
          <section className="panel">
            <div className="langs" role="tablist">
              {LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={lang === item.id}
                  className={`langs__tab ${lang === item.id ? 'is-active' : ''}`}
                  onClick={() => setLang(item.id)}
                >
                  {item.label}
                  {missing.includes(item.id) && (
                    <span className="langs__dot" title="Не заповнені прізвище чи імʼя" />
                  )}
                </button>
              ))}
            </div>

            <div className="fields-grid fields-grid--name">
              <label className="field">
                Прізвище <span className="field__required">обовʼязково</span>
                <input
                  className="input"
                  value={texts.lastName}
                  onChange={(event) => setText('lastName', event.target.value)}
                />
              </label>

              <label className="field">
                Імʼя <span className="field__required">обовʼязково</span>
                <input
                  className="input"
                  value={texts.firstName}
                  onChange={(event) => setText('firstName', event.target.value)}
                />
              </label>

              <label className="field">
                По батькові
                <input
                  className="input"
                  value={texts.middleName}
                  onChange={(event) => setText('middleName', event.target.value)}
                />
              </label>
            </div>

            <div className="fields-grid">
              <label className="field">
                Підпис до стажу
                <input
                  className="input"
                  placeholder="років досвіду"
                  value={texts.experienceText}
                  onChange={(event) => setText('experienceText', event.target.value)}
                />
              </label>

              <label className="field field--wide">
                Регалії й спеціалізація
                <textarea
                  className="input"
                  rows={2}
                  value={texts.position}
                  onChange={(event) => setText('position', event.target.value)}
                />
              </label>

              <label className="field field--wide">
                Опис
                <textarea
                  className="input"
                  rows={4}
                  value={texts.description}
                  onChange={(event) => setText('description', event.target.value)}
                />
              </label>
            </div>

            <details className="home-texts">
              <summary className="home-texts__summary">Короткий текст для головної</summary>

              <p className="form-note">
                На головній картки коротші. Якщо поля порожні, там показуються регалії й опис
                звідси.
              </p>

              <div className="fields-grid">
                <label className="field field--wide">
                  Коротко про спеціалізацію
                  <input
                    className="input"
                    value={texts.homePosition}
                    onChange={(event) => setText('homePosition', event.target.value)}
                  />
                </label>

                <label className="field field--wide">
                  Короткий опис
                  <textarea
                    className="input"
                    rows={2}
                    value={texts.homeAbout}
                    onChange={(event) => setText('homeAbout', event.target.value)}
                  />
                </label>
              </div>
            </details>
          </section>

          <section className="panel">
            <h2 className="panel__title">
              Послуги й ціни
              <span className="panel__subtitle">
                назви — {LANGS.find((item) => item.id === lang).label.toLowerCase()}, ціна спільна
                для всіх мов
              </span>
            </h2>

            <ul className="prices">
              {doctor.prices.map((price, index) => (
                <li key={index} className="prices__row">
                  <input
                    className="input prices__service"
                    placeholder="Послуга"
                    value={price.i18n[lang].service}
                    onChange={(event) => updatePriceText(index, 'service', event.target.value)}
                  />
                  <input
                    className="input prices__duration"
                    placeholder="Тривалість"
                    value={price.i18n[lang].duration}
                    onChange={(event) => updatePriceText(index, 'duration', event.target.value)}
                  />
                  <input
                    className="input prices__price"
                    placeholder="Ціна"
                    value={price.price}
                    onChange={(event) => updatePrice(index, { price: event.target.value })}
                  />

                  <span className="prices__actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Вище"
                      disabled={index === 0}
                      onClick={() => movePrice(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Нижче"
                      disabled={index === doctor.prices.length - 1}
                      onClick={() => movePrice(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-button is-danger"
                      aria-label="Прибрати"
                      onClick={() => set({ prices: doctor.prices.filter((_, i) => i !== index) })}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="button button--dashed"
              onClick={() => set({ prices: [...doctor.prices, emptyPrice()] })}
            >
              Додати послугу
            </button>
          </section>
        </div>
      </div>

      {/* ── Де показувати: на картці не видно, але від цього залежить,
             на яких сторінках сайту лікар зʼявиться ── */}
      <section className="panel placement">
        <h2 className="panel__title">Де показувати на сайті</h2>

        <p className="form-note placement__intro">
          На картці цього не видно, але без напрямів лікар не потрапить на сторінки спеціальностей,
          а без міста — у фільтр Харкова чи Києва.
        </p>

        <div className="placement__grid">
          <div className="placement__group">
            <h3 className="placement__title">Місто</h3>

            <div className="checks">
              {CITIES.map((city) => (
                <label key={city.id} className="check">
                  <input
                    type="checkbox"
                    checked={doctor.cities.includes(city.id)}
                    onChange={() => {
                      // Позначку «тільки онлайн» (порожній рядок) прибираємо,
                      // щойно обрано місто, — інакше вони суперечать.
                      const cities = doctor.cities.filter(Boolean)
                      set({
                        cities: cities.includes(city.id)
                          ? cities.filter((item) => item !== city.id)
                          : [...cities, city.id],
                      })
                    }}
                  />
                  {city.label}
                </label>
              ))}

              <label className="check">
                <input
                  type="checkbox"
                  checked={Boolean(doctor.online)}
                  onChange={() => set({ online: !doctor.online })}
                />
                Онлайн-консультації
              </label>
            </div>

            {onlineOnly && (
              <p className="form-note">Жодне місто не обране — лікар працює лише онлайн.</p>
            )}
          </div>

          <div className="placement__group placement__group--wide">
            <h3 className="placement__title">Напрями</h3>

            <div className="checks checks--columns">
              {DIRECTIONS.map((direction) => (
                <label key={direction.id} className="check">
                  <input
                    type="checkbox"
                    checked={doctor.directions.includes(direction.id)}
                    onChange={() => toggleIn('directions', direction.id)}
                  />
                  {direction.label}
                </label>
              ))}
            </div>
          </div>

          <div className="placement__group">
            <h3 className="placement__title">Сторінки</h3>

            <div className="checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={doctor.showInTeam}
                  onChange={() => set({ showInTeam: !doctor.showInTeam })}
                />
                «Наша команда»
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={doctor.showOnHomeMobile}
                  onChange={() => set({ showOnHomeMobile: !doctor.showOnHomeMobile })}
                />
                Головна, мобільна версія
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={doctor.isFounder}
                  onChange={() => set({ isFounder: !doctor.isFounder })}
                />
                Засновниця клініки
              </label>
            </div>
          </div>
        </div>

        <details className="placement__tech">
          <summary className="home-texts__summary">Ідентифікатор</summary>

          <input
            className="input input--mono placement__slug"
            value={doctor.slug}
            onChange={(event) => {
              setSlugTouched(true)
              set({ slug: event.target.value.toLowerCase() })
            }}
          />

          <p className="form-note">
            Складається з прізвища й імені автоматично.
            {!isNew && ' Змінювати без потреби не варто: за ним лікар привʼязаний до сторінок.'}
          </p>
        </details>
      </section>

      <footer className="doctor-form__footer">
        {error && <p className="page__error doctor-form__error">{error}</p>}

        <button type="button" className="button" onClick={onClose}>
          Скасувати
        </button>

        <button type="button" className="button button--primary" onClick={save} disabled={busy}>
          {busy ? 'Збереження…' : 'Зберегти'}
        </button>
      </footer>
    </div>
  )
}

export default DoctorForm
