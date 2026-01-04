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
  // Usar matchMedia para detecção mais confiável
  const mediaQuery = `(max-width: ${breakpoint}px)`
  
  const [isSmall, setIsSmall] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(mediaQuery).matches
  })

  React.useEffect(() => {
    const mql = window.matchMedia(mediaQuery)
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSmall(e.matches)
    }
    
    // Verificar imediatamente
    handleChange(mql)
    
    // Adicionar listener
    mql.addEventListener("change", handleChange)
    
    return () => {
      mql.removeEventListener("change", handleChange)
    }
  }, [mediaQuery])

  return isSmall
}