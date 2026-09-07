import { useEffect, useState } from 'react'

import { api } from './api'
import { formatDate } from './formatDate'

import './Team.sass'

function Team() {
  const [items, setItems] = useState(null)
  const [current, setCurrent] = useState(null)
  const [error, setError] = useState('')

  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ login: '', name: '', password: '' })
  const [busy, setBusy] = useState(false)

  // Зміна пароля відкривається для одного користувача за раз.
  const [resetFor, setResetFor] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  // Лічильник перезавантажень замість функції load(): виклик функції
  // зі стану всередині ефекту ESLint вважає синхронним setState.
  const [reloadKey, setReloadKey] = useState(0)

  const reload = () => setReloadKey((key) => key + 1)

  useEffect(() => {
    let ignore = false

    api
      .users()
      .then((data) => {
        if (ignore) return
        setItems(data.items)
        setCurrent(data.current)
      })
      .catch(() => {
        if (!ignore) setError('Не вдалося завантажити список')
      })

    return () => {
      ignore = true
    }
  }, [reloadKey])

  const create = async () => {
    setBusy(true)
    setError('')

    try {
      await api.createUser(form)
      setForm({ login: '', name: '', password: '' })
      setAdding(false)
      reload()
    } catch (err) {
      setError(err.message || 'Не вдалося створити')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (user) => {
    setError('')

    try {
      await api.updateUser(user.id, { is_active: user.is_active ? 0 : 1 })
      reload()
    } catch (err) {
      setError(err.message || 'Не вдалося змінити')
    }
  }

  const resetPassword = async () => {
    setBusy(true)
    setError('')

    try {
      await api.updateUser(resetFor, { password: newPassword })
      setResetFor(null)
      setNewPassword('')
    } catch (err) {
      setError(err.message || 'Не вдалося змінити пароль')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (user) => {
    setError('')

    try {
      await api.deleteUser(user.id)
      reload()
    } catch (err) {
      setError(err.message || 'Не вдалося видалити')
    }
  }

  if (error && !items) return <p className="page__error">{error}</p>
  if (!items) return <p className="page__empty">Завантаження…</p>

  return (
    <div className="team">
      <header className="team__header">
        <h1 className="page__title">Команда</h1>

        <button type="button" className="team__add" onClick={() => setAdding(!adding)}>
          {adding ? 'Скасувати' : 'Додати користувача'}
        </button>
      </header>

      {adding && (
        <section className="panel panel--wide team__form">
          <h2 className="panel__title">Новий користувач</h2>

          <div className="team__fields">
            <label className="team__field">
              Логін
              <input
                className="team__input"
                placeholder="latynytseiu"
                autoComplete="off"
                value={form.login}
                onChange={(event) => setForm({ ...form, login: event.target.value })}
              />
            </label>

            <label className="team__field">
              Імʼя
              <input
                className="team__input"
                placeholder="Як звертатись"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>

            <label className="team__field">
              Пароль
              <input
                className="team__input"
                type="text"
                placeholder="Не менше 8 символів"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
          </div>

          <p className="team__hint">
            Пароль показаний відкрито навмисно: його треба передати людині, а потім вона зможе
            змінити його сама. Після збереження побачити пароль буде неможливо — у базі лишається
            лише хеш.
          </p>

          <div className="team__actions">
            <button type="button" className="team__save" onClick={create} disabled={busy}>
              {busy ? 'Створення…' : 'Створити'}
            </button>
          </div>
        </section>
      )}

      {error && <p className="page__error team__error">{error}</p>}

      <section className="panel panel--wide">
        <ul className="users">
          {items.map((user) => (
            <li key={user.id} className={`users__row ${user.is_active ? '' : 'is-blocked'}`}>
              <div className="users__main">
                <span className="users__login">
                  {user.login}
                  {user.login === current && <span className="users__badge">це ви</span>}
                  {!user.is_active && <span className="users__badge is-warn">заблоковано</span>}
                </span>

                {user.name && <span className="users__name">{user.name}</span>}
              </div>

              <span className="users__meta">
                {user.last_login_at
                  ? `Останній вхід ${formatDate(user.last_login_at)}`
                  : 'Ще не заходив'}
              </span>

              <span className="users__actions">
                <button
                  type="button"
                  className="users__button"
                  onClick={() => {
                    setResetFor(resetFor === user.id ? null : user.id)
                    setNewPassword('')
                  }}
                >
                  Пароль
                </button>

                <button type="button" className="users__button" onClick={() => toggleActive(user)}>
                  {user.is_active ? 'Заблокувати' : 'Розблокувати'}
                </button>

                <button
                  type="button"
                  className="users__button is-danger"
                  onClick={() => remove(user)}
                >
                  Видалити
                </button>
              </span>

              {resetFor === user.id && (
                <div className="users__reset">
                  <input
                    className="team__input"
                    type="text"
                    placeholder="Новий пароль, не менше 8 символів"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />

                  <button
                    type="button"
                    className="team__save"
                    onClick={resetPassword}
                    disabled={busy}
                  >
                    Змінити
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="team__note">
        Усі користувачі поки мають однакові права. Ролі зʼявляться пізніше — місце під них у базі
        вже закладене.
        <br />
        Обліковий запис із конфігу сервера лишається аварійним входом: ним можна зайти, якщо забути
        пароль або випадково заблокувати всіх.
      </p>
    </div>
  )
}

export default Team
