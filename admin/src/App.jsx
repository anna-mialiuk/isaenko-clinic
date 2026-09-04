import { useCallback, useEffect, useState } from 'react'

import { api } from './api'
import Login from './Login'
import Dashboard from './Dashboard'
import Kanban from './Kanban'
import Analytics from './Analytics'
import Errors from './Errors'
import CrmSettings from './CrmSettings'
import Placeholder from './Placeholder'

import './Layout.sass'

/**
 * Дворівнева навігація. Розділ без підпунктів (Блог) лишається простим
 * пунктом — вкладати його заради однорідності немає сенсу.
 */
const MENU = [
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { id: 'crm.clients', label: 'Клієнти' },
      { id: 'crm.settings', label: 'Налаштування' },
      { id: 'crm.notifications', label: 'Сповіщення' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналітика',
    items: [
      { id: 'analytics.overview', label: 'Огляд' },
      { id: 'analytics.events', label: 'Події' },
    ],
  },
  {
    id: 'settings',
    label: 'Налаштування',
    items: [
      { id: 'settings.integrations', label: 'Інтеграції' },
      { id: 'settings.team', label: 'Команда' },
      { id: 'settings.server', label: 'Життя серверу' },
    ],
  },
  { id: 'blog', label: 'Блог' },
]

const DEFAULT_SECTION = 'crm.clients'

function App() {
  const [authorised, setAuthorised] = useState(null)
  const [section, setSection] = useState(DEFAULT_SECTION)

  // Розгорнута група — одна за раз: розділів небагато,
  // і так завжди видно, де ти зараз.
  const [openGroup, setOpenGroup] = useState('crm')

  // Меню на вузьких екранах. На десктопі клас не впливає ні на що —
  // там сайдбар видно завжди.
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Після вибору розділу меню закривається: інакше на телефоні воно
  // лишається розгорнутим і перекриває те, заради чого його відкривали.
  const select = (id) => {
    setSection(id)
    setMenuOpen(false)
  }

  if (authorised === null) return <div className="boot">Завантаження…</div>

  if (!authorised) return <Login onSuccess={() => setAuthorised(true)} />

  return (
    <div className="layout">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sidebar__bar">
          <div className="sidebar__logo">Dr. Isaenko</div>

          <button
            type="button"
            className="sidebar__burger"
            aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sidebar__burger-line" />
            <span className="sidebar__burger-line" />
            <span className="sidebar__burger-line" />
          </button>
        </div>

        <div className={`sidebar__panel ${menuOpen ? 'is-open' : ''}`}>
          <div className="sidebar__panel-inner">
            <nav className="sidebar__nav">
              {MENU.map((group) =>
                group.items ? (
                  <div key={group.id} className="sidebar__group">
                    <button
                      type="button"
                      className={`sidebar__group-title ${openGroup === group.id ? 'is-open' : ''}`}
                      onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
                    >
                      {group.label}
                      <span className="sidebar__chevron" aria-hidden="true" />
                    </button>

                    <div className={`sidebar__sub ${openGroup === group.id ? 'is-open' : ''}`}>
                      <div className="sidebar__sub-inner">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`sidebar__link sidebar__link--sub ${
                              section === item.id ? 'is-active' : ''
                            }`}
                            // Згорнута група не має ловити фокус із клавіатури.
                            tabIndex={openGroup === group.id ? 0 : -1}
                            onClick={() => select(item.id)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    key={group.id}
                    type="button"
                    className={`sidebar__link ${section === group.id ? 'is-active' : ''}`}
                    onClick={() => select(group.id)}
                  >
                    {group.label}
                  </button>
                ),
              )}
            </nav>

            <button type="button" className="sidebar__logout" onClick={handleLogout}>
              Вийти
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        {section === 'crm.clients' && <Kanban />}
        {section === 'analytics.overview' && <Dashboard />}
        {section === 'analytics.events' && <Analytics />}
        {section === 'settings.server' && <Errors />}

        {section === 'crm.settings' && <CrmSettings />}

        {section === 'crm.notifications' && (
          <Placeholder
            title="Сповіщення"
            note="Зараз заявки йдуть у спільний Telegram-чат. Персональні сповіщення
                  й правила — кому, про що, коли — робляться після того, як зʼявиться
                  команда з ролями."
          />
        )}

        {section === 'settings.integrations' && (
          <Placeholder
            title="Інтеграції"
            note="Тут будуть підключення зовнішніх сервісів. Зараз працюють Telegram
                  для заявок і Measurement Protocol для GA4 — обидва налаштовані
                  через конфіг сервера."
          />
        )}

        {section === 'settings.team' && (
          <Placeholder
            title="Команда"
            note="Зараз один спільний логін на всіх. Розділ додасть окремі облікові
                  записи з ролями — і тоді запрацює поле «відповідальний менеджер»
                  у картці заявки."
          />
        )}

        {section === 'blog' && (
          <Placeholder
            title="Блог"
            note="Розділу блогу на сайті ще немає: потрібні маршрути, сторінка статті,
                  список, SEO-теги і додавання в sitemap. Панель для нього робиться
                  після того, як зʼявиться сам блог."
          />
        )}
      </main>
    </div>
  )
}

export default App
