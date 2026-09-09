import { Suspense, lazy, useCallback, useEffect, useState } from 'react'

import { api } from './api'
import Login from './Login'
import Kanban from './Kanban'
import Errors from './Errors'
import CrmSettings from './CrmSettings'
import Team from './Team'
import Placeholder from './Placeholder'

// Графіки (recharts) важкі й потрібні тільки на дашборді —
// не тягнемо їх у бандл для тих, хто працює лише з заявками.
const Dashboard = lazy(() => import('./Dashboard'))
const Analytics = lazy(() => import('./Analytics'))
import { applyTheme, getInitialTheme } from './theme'
import {
  IconBell,
  IconChart,
  IconLogout,
  IconMoon,
  IconPen,
  IconPlug,
  IconPulse,
  IconServer,
  IconSliders,
  IconSun,
  IconTeam,
  IconUsers,
} from './Icons'

import './Layout.sass'

/**
 * Навігація плоска: група — це підпис над пунктами, а не згортка.
 * Розділів небагато, тому все видно одразу, без кліків по групах.
 */
const MENU = [
  {
    id: 'crm',
    label: 'CRM',
    items: [
      { id: 'crm.clients', label: 'Клієнти', icon: IconUsers },
      { id: 'crm.settings', label: 'Налаштування', icon: IconSliders },
      { id: 'crm.notifications', label: 'Сповіщення', icon: IconBell },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналітика',
    items: [
      { id: 'analytics.overview', label: 'Огляд', icon: IconChart },
      { id: 'analytics.events', label: 'Події', icon: IconPulse },
    ],
  },
  {
    id: 'settings',
    label: 'Налаштування',
    items: [
      { id: 'settings.integrations', label: 'Інтеграції', icon: IconPlug },
      { id: 'settings.team', label: 'Команда', icon: IconTeam },
      { id: 'settings.server', label: 'Життя серверу', icon: IconServer },
    ],
  },
  {
    id: 'other',
    label: 'Контент',
    items: [{ id: 'blog', label: 'Блог', icon: IconPen }],
  },
]

const DEFAULT_SECTION = 'crm.clients'

function App() {
  const [authorised, setAuthorised] = useState(null)
  const [section, setSection] = useState(DEFAULT_SECTION)

  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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
              {MENU.map((group) => (
                <div key={group.id} className="sidebar__group">
                  <span className="sidebar__caption">{group.label}</span>

                  {group.items.map((item) => {
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`sidebar__link ${section === item.id ? 'is-active' : ''}`}
                        aria-current={section === item.id ? 'page' : undefined}
                        onClick={() => select(item.id)}
                      >
                        <Icon className="sidebar__icon" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              ))}
            </nav>

            <div className="sidebar__footer">
              <button
                type="button"
                className="sidebar__theme"
                aria-label={theme === 'dark' ? 'Світла тема' : 'Темна тема'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
                {theme === 'dark' ? 'Світла' : 'Темна'}
              </button>

              <button type="button" className="sidebar__logout" onClick={handleLogout}>
                <IconLogout />
                Вийти
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        {section === 'crm.clients' && <Kanban />}
        {section === 'analytics.overview' && (
          <Suspense fallback={<p className="page__empty">Завантаження…</p>}>
            <Dashboard />
          </Suspense>
        )}
        {section === 'analytics.events' && (
          <Suspense fallback={<p className="page__empty">Завантаження…</p>}>
            <Analytics />
          </Suspense>
        )}
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

        {section === 'settings.team' && <Team />}

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
