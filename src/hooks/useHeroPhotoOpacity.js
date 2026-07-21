import { useEffect } from 'react'

function useHeroPhotoOpacity(heroRef) {
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return

      const heroHeight = heroRef.current.offsetHeight
      const currentScrollY = window.scrollY
      const progress = Math.min(currentScrollY / heroHeight, 1)

      heroRef.current.style.setProperty('--hero-photo-opacity', 1 - progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [heroRef])
}

export default useHeroPhotoOpacity
