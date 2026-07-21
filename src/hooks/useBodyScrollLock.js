import { useEffect } from 'react'

function useBodyScrollLock(isLocked) {
  useEffect(() => {
    document.body.style.overflow = isLocked ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isLocked])
}

export default useBodyScrollLock
