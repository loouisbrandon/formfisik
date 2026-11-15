import { useEffect, useState } from "react"

export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const handleResize = () => setIsMobile(mediaQuery.matches)

    handleResize()
    mediaQuery.addEventListener("change", handleResize)

    return () => mediaQuery.removeEventListener("change", handleResize)
  }, [breakpoint])

  return isMobile
}
