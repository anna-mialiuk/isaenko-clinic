import { useState } from 'react'

import { api } from './api'

import './Login.sass'

function Login({ onSuccess }) {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      await api.login(user, password, remember)
      onSuccess()
    } catch (err) {
      // Сервер навмисно не каже, логін чи пароль невірний.
      setError(
        err.message === 'too many attempts, try again in 15 minutes'
          ? 'Забагато спроб. Спробуйте за 15 хвилин.'
          : 'Невірний логін або пароль',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit}>
        <h1 className="login__title">Панель Dr. Isaenko</h1>

        <input
          className="login__input"
          placeholder="Логін"
          autoComplete="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          className="login__input"
          type="password"
          placeholder="Пароль"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="login__remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Запамʼятати цей пристрій на 30 днів
        </label>

        {error && <p className="login__error">{error}</p>}

        <button className="login__submit" type="submit" disabled={busy}>
          {busy ? 'Вхід…' : 'Увійти'}
        </button>
      </form>
    </div>
  )
}

export default Login
