"use client"
import { useEffect, useState, useRef } from "react"

interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(options?: IntersectionObserverOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (options?.freezeOnceVisible) {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsIntersecting(true)
          setHasBeenVisible(true)
        }
      } else {
        setIsIntersecting(entry.isIntersecting)
      }
    }, options)

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref, options, hasBeenVisible])

  return [ref, isIntersecting] as const
}