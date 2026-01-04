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
  // Verifica o tamanho inicial diretamente
  const getInitialSize = () => {
    if (typeof window === 'undefined') return true
    return window.innerWidth <= breakpoint
  }

  const [isSmall, setIsSmall] = React.useState<boolean>(getInitialSize)

  React.useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      setIsSmall(width <= breakpoint)
    }
    
    // Verificar imediatamente
    checkSize()
    
    window.addEventListener("resize", checkSize)
    window.addEventListener("orientationchange", () => {
      setTimeout(checkSize, 100)
    })
    
    return () => {
      window.removeEventListener("resize", checkSize)
      window.removeEventListener("orientationchange", checkSize)
    }
  }, [breakpoint])

  return isSmall
}
