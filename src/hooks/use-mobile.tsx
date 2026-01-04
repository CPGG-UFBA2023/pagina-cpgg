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
  // Inicializa como true para mobile-first (esconder foto por padrão)
  const [isSmall, setIsSmall] = React.useState<boolean>(true)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    // Verificar tamanho imediatamente no mount
    const checkSize = () => {
      const width = window.innerWidth
      setIsSmall(width <= breakpoint)
    }
    
    checkSize()
    setHasMounted(true)
    
    window.addEventListener("resize", checkSize)
    // Também ouvir orientationchange para dispositivos móveis
    window.addEventListener("orientationchange", () => {
      setTimeout(checkSize, 100)
    })
    
    return () => {
      window.removeEventListener("resize", checkSize)
      window.removeEventListener("orientationchange", checkSize)
    }
  }, [breakpoint])

  // Se ainda não montou, retorna true (mobile-first, esconde foto)
  if (!hasMounted) {
    return true
  }

  return isSmall
}
