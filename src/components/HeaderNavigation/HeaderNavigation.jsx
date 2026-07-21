import { NavLink } from 'react-router-dom'

import { getMainNavigation } from '../../data/navigation'
import { useLanguage } from '../../hooks/useLanguage'

function HeaderNavigation({ className = '', variant = 'kharkiv' }) {
  const { language } = useLanguage()

  const navigation = getMainNavigation(variant, language)

  return (
    <nav className={className}>
      {navigation.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default HeaderNavigation
