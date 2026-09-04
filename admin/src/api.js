// admin.php напряму: так працює і локально через php -S, і на проді —
// шлях підпадає під наявне правило location ~ ^/api/.+\.php$ у nginx.
const BASE = '/api/admin.php'

async function request(action, options = {}) {
  const response = await fetch(`${BASE}?action=${action}${options.query || ''}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    // Сесія тримається на cookie, тому credentials обовʼязкові.
    credentials: 'same-origin',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) throw new Error('unauthorised')

  const data = await response.json().catch(() => null)

  if (!response.ok) throw new Error(data?.error || 'request failed')

  return data
}

/** Порожні значення у фільтрах не відправляємо — інакше сервер
 *  вважає їх заданими й повертає порожній результат. */
const toQuery = (filters) => {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== '' && value != null),
  ).toString()

  return params ? `&${params}` : ''
}

export const api = {
  me: () => request('me'),
  login: (user, password) => request('login', { method: 'POST', body: { user, password } }),
  logout: () => request('logout', { method: 'POST' }),

  leads: (filters = {}) => request('leads', { query: toQuery(filters) }),

  updateLead: (id, changes) => request('leads', { method: 'PATCH', body: { id, ...changes } }),

  // Повна картка з історією — окремим запитом, бо список її не тягне.
  lead: (id) => request('lead', { query: `&id=${id}` }),

  stats: (days = 30) => request('stats', { query: `&days=${days}` }),

  exportUrl: (filters = {}) => `${BASE}?action=export${toQuery(filters)}`,

  errors: (filters = {}) => request('errors', { query: toQuery(filters) }),

  resolveError: (id, resolved) => request('errors', { method: 'PATCH', body: { id, resolved } }),
}
