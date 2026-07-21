import { Component } from 'react'

import { getHomeRoute } from '../../utils/getRoute'

import './ErrorBoundary.sass'

const errorContent = {
  uk: {
    title: 'Щось пішло не так',
    text: 'Оновіть сторінку або поверніться трохи пізніше.',
    reload: 'Оновити сторінку',
    home: 'На головну',
  },
  ru: {
    title: 'Что-то пошло не так',
    text: 'Обновите страницу или вернитесь немного позже.',
    reload: 'Обновить страницу',
    home: 'На главную',
  },
  en: {
    title: 'Something went wrong',
    text: 'Refresh the page or come back a little later.',
    reload: 'Refresh page',
    home: 'Go home',
  },
}

const getCurrentLanguage = () => {
  const language = localStorage.getItem('language')

  return errorContent[language] ? language : 'uk'
}

const getCurrentVariant = () => (window.location.pathname.startsWith('/kyiv') ? 'kyiv' : 'kharkiv')

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('React error boundary caught an error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = getHomeRoute(getCurrentVariant())
  }

  render() {
    if (this.state.hasError) {
      const content = errorContent[getCurrentLanguage()]

      return (
        <main className="error-boundary">
          <div className="error-boundary__card">
            <p className="error-boundary__label">Dr. Isaenko</p>
            <h1 className="error-boundary__title">{content.title}</h1>
            <p className="error-boundary__text">{content.text}</p>

            <div className="error-boundary__actions">
              <button type="button" className="error-boundary__button" onClick={this.handleReload}>
                {content.reload}
              </button>

              <button
                type="button"
                className="error-boundary__button error-boundary__button--ghost"
                onClick={this.handleHome}
              >
                {content.home}
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
