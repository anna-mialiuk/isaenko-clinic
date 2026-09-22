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
  login: (user, password, remember = false) =>
    request('login', { method: 'POST', body: { user, password, remember } }),
  logout: () => request('logout', { method: 'POST' }),

  leads: (filters = {}) => request('leads', { query: toQuery(filters) }),

  updateLead: (id, changes) => request('leads', { method: 'PATCH', body: { id, ...changes } }),

  // Повна картка з історією — окремим запитом, бо список її не тягне.
  lead: (id) => request('lead', { query: `&id=${id}` }),

  statuses: () => request('statuses'),

  saveStatuses: (items) => request('statuses', { method: 'POST', body: { items } }),

  users: () => request('users'),

  createUser: (data) => request('users', { method: 'POST', body: data }),

  updateUser: (id, changes) => request('users', { method: 'PATCH', body: { id, ...changes } }),

  deleteUser: (id) => request('users', { method: 'DELETE', query: `&id=${id}` }),

  stats: (days = 30) => request('stats', { query: `&days=${days}` }),

  events: (days = 30) => request('events', { query: `&days=${days}` }),

  exportUrl: (filters = {}) => `${BASE}?action=export${toQuery(filters)}`,

  errors: (filters = {}) => request('errors', { query: toQuery(filters) }),

  resolveError: (id, resolved) => request('errors', { method: 'PATCH', body: { id, resolved } }),

  doctors: () => request('doctors'),

  doctor: (id) => request('doctor', { query: `&id=${id}` }),

  saveDoctor: (data) => request('doctors', { method: 'POST', body: data }),

  setDoctorActive: (id, active) =>
    request('doctors', { method: 'PATCH', body: { id, is_active: active } }),

  reorderDoctors: (ids) => request('doctors', { method: 'PATCH', body: { order: ids } }),

  // Файл іде multipart, тому не через request(): той шле JSON.
  uploadDoctorPhoto: async (file, slug) => {
    const form = new FormData()
    form.append('photo', file)
    form.append('slug', slug)

    const response = await fetch(`${BASE}?action=doctor_photo`, {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    })

    // 413 віддає nginx, а не PHP: відповідь буде HTML, не JSON.
    if (response.status === 413) throw new Error('Файл завеликий для сервера')

    const data = await response.json().catch(() => null)

    if (!response.ok) throw new Error(data?.error || 'Не вдалося завантажити фото')

    return data
  },
}
