import { useEffect, useRef, useState } from 'react'

function useScrollCTAVisibility() {
  const lastScrollY = useRef(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY.current
      const firstScreenPassed = currentScrollY > window.innerHeight

      setIsVisible(isScrollingDown && firstScreenPassed && !isFooterVisible)
      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isFooterVisible])

  useEffect(() => {
    const footer = document.querySelector('.footer')

    if (!footer) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting)

        if (entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { threshold: 0.05 },
    )

    observer.observe(footer)

    return () => observer.disconnect()
  }, [])

  return isVisible
}

export default useScrollCTAVisibility
