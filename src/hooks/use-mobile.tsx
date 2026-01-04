import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsSmallScreen(breakpoint: number = 820) {
  // Use function to get initial value correctly
  const getIsSmall = () => typeof window !== 'undefined' && window.innerWidth <= breakpoint
  
  const [isSmall, setIsSmall] = React.useState<boolean>(getIsSmall)

  React.useEffect(() => {
    const checkSize = () => {
      setIsSmall(window.innerWidth <= breakpoint)
    }
    
    // Check immediately on mount
    checkSize()
    
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [breakpoint])

  return isSmall
}
