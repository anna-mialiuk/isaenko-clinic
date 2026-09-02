import { useCallback, useEffect, useState } from 'react'

import { api } from './api'
import Login from './Login'
import Dashboard from './Dashboard'
import Kanban from './Kanban'
import Analytics from './Analytics'
import Placeholder from './Placeholder'

const SECTIONS = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'crm', label: 'a-CRM' },
  { id: 'analytics', label: 'Аналітика' },
  { id: 'team', label: 'Наша команда' },
  { id: 'blog', label: 'Блог' },
]

function App() {
  const [authorised, setAuthorised] = useState(null)
  const [section, setSection] = useState('crm')

  useEffect(() => {
    api
      .me()
      .then((data) => setAuthorised(Boolean(data.authorised)))
      .catch(() => setAuthorised(false))
  }, [])

  const handleLogout = useCallback(async () => {
    await api.logout().catch(() => {})
    setAuthorised(false)
  }, [])

  if (authorised === null) return <div className="boot">Завантаження…</div>

  if (!authorised) return <Login onSuccess={() => setAuthorised(true)} />

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__logo">Dr. Isaenko</div>

        <nav className="sidebar__nav">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar__link ${section === item.id ? 'is-active' : ''}`}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="sidebar__logout" onClick={handleLogout}>
          Вийти
        </button>
      </aside>

      <main className="content">
        {section === 'dashboard' && <Dashboard />}
        {section === 'crm' && <Kanban />}
        {section === 'analytics' && <Analytics />}

        {section === 'team' && (
          <Placeholder
            title="Наша команда"
            note="Лікарі зараз зберігаються у файлах проєкту і потрапляють на сайт при збірці.
                  Щоб редагувати їх звідси, потрібно перенести дані в базу і навчити сайт
                  читати їх через API — це переробка сторінок команди, напрямів і стаціонару,
                  плюс три мови на кожне поле."
          />
        )}

        {section === 'blog' && (
          <Placeholder
            title="Блог"
            note="Розділу блогу на сайті ще немає: потрібні маршрути, сторінка статті,
                  список, SEO-теги і додавання в sitemap. Панель для нього робиться після того,
                  як зʼявиться сам блог."
          />
        )}
      </main>
    </div>
  )
}

export default App
