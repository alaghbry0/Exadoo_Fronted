'use client'

import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 768px)'

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    setIsMobile(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return isMobile
}
