import { Routes, Route } from 'react-router-dom'

import SeoManager from './components/SeoManager/SeoManager'

import HomePage from './pages/HomePage'
import DirectionPage from './pages/DirectionPage/DirectionPage'
import AboutPage from './pages/AboutPage/AboutPage'
import TeamPage from './pages/TeamPage/TeamPage'
import HospitalPage from './pages/HospitalPage/HospitalPage'
import ContactsPage from './pages/ContactsPage/ContactsPage'
import MultimodalPage from './pages/MultimodalPage/MultimodalPage'
import NotFoundPage from './pages/NotFoundPage'

import { directionRoutes } from './data/directionRoutes'
import { getRoute } from './utils/getRoute'

const pageRoutes = [
  { path: '/about', Component: AboutPage },
  { path: '/team', Component: TeamPage },
  { path: '/hospital', Component: HospitalPage },
  { path: '/contacts', Component: ContactsPage },
  { path: '/multimodal', Component: MultimodalPage },
]

function renderCityPageRoutes(variant) {
  return pageRoutes.map(({ path, Component }) => (
    <Route
      key={`${variant}${path}`}
      path={getRoute(variant, path)}
      element={<Component variant={variant} />}
    />
  ))
}

function renderDirectionRoutes(variant) {
  return directionRoutes.map((route) => (
    <Route
      key={`${variant}-${route.slug}`}
      path={getRoute(variant, route.path)}
      element={<DirectionPage variant={variant} directionSlug={route.slug} />}
    />
  ))
}

function App() {
  return (
    <>
      <SeoManager />

      <Routes>
        <Route path="/" element={<HomePage variant="kharkiv" />} />
        <Route path="/kyiv" element={<HomePage variant="kyiv" />} />

        {renderCityPageRoutes('kharkiv')}
        {renderCityPageRoutes('kyiv')}

        {renderDirectionRoutes('kharkiv')}
        {renderDirectionRoutes('kyiv')}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
