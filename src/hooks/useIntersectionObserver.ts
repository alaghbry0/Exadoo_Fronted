import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { freezeOnceVisible = true, ...observerOptions } = options
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // إذا كان العنصر قد ظهر من قبل ونريد تجميده، لا نفعل شيء
    if (freezeOnceVisible && hasBeenVisible) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting

        setIsVisible(isIntersecting)

        if (isIntersecting) {
          setHasBeenVisible(true)
          if (freezeOnceVisible) {
            observer.disconnect()
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...observerOptions,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [freezeOnceVisible, hasBeenVisible, observerOptions])

  return { ref, isVisible, hasBeenVisible }
}
