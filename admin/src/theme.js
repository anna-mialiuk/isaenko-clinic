const KEY = 'admin_theme'

/** Збережений вибір, інакше — системна тема. */
export const getInitialTheme = () => {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(KEY, theme)
}
