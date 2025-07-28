"use client"

import { useEffect, useState } from "react"

export function useIsMobile(query = "(max-width: 768px)") {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleResize = () => setIsMobile(mediaQuery.matches)

    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [query])

  return isMobile
}
