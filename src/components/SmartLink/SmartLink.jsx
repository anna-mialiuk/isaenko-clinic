import { Link } from 'react-router-dom'

function isInternalPath(to) {
  return typeof to === 'string' && to.startsWith('/')
}

function SmartLink({ to, href, children, ...props }) {
  const target = to || href

  if (isInternalPath(target)) {
    return (
      <Link to={target} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={target} {...props}>
      {children}
    </a>
  )
}

export default SmartLink
