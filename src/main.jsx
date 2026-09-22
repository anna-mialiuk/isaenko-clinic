import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { LanguageProvider } from './context/LanguageContext.jsx'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx'

import { loadDoctors } from './data/doctorsSource.js'

import './styles/index.sass'

loadDoctors()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <App />
        </ErrorBoundary>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
