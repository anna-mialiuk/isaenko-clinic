import { useEffect, useRef, useState } from 'react'

function useStickyHeaderVisibility({ threshold = 300, disabled = false } = {}) {
  const lastScrollY = useRef(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingUp = currentScrollY < lastScrollY.current

      setIsVisible(currentScrollY > threshold && isScrollingUp)
      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return disabled ? false : isVisible
}

export default useStickyHeaderVisibility
