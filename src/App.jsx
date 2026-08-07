import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

import SeoManager from './components/SeoManager/SeoManager'

import HomePage from './pages/HomePage'

const DirectionPage = lazy(() => import('./pages/DirectionPage/DirectionPage'))
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage'))
const TeamPage = lazy(() => import('./pages/TeamPage/TeamPage'))
const HospitalPage = lazy(() => import('./pages/HospitalPage/HospitalPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage/ContactsPage'))
const MultimodalPage = lazy(() => import('./pages/MultimodalPage/MultimodalPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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

      <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<HomePage variant="kharkiv" />} />
          <Route path="/kyiv" element={<HomePage variant="kyiv" />} />

          {renderCityPageRoutes('kharkiv')}
          {renderCityPageRoutes('kyiv')}

          {renderDirectionRoutes('kharkiv')}
          {renderDirectionRoutes('kyiv')}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
