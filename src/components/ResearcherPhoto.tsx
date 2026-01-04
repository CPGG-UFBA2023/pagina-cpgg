import { useResearcherProfile } from './ResearcherProfileContext'
import { useEffect, useState } from 'react'

interface ResearcherPhotoProps {
  researcherName: string
}

export function ResearcherPhoto({ researcherName }: ResearcherPhotoProps) {
  const { photoUrl, belowPhoto } = useResearcherProfile()
  
  // Verificação direta e síncrona do tamanho da tela
  const [shouldHide, setShouldHide] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth <= 820
  })

  useEffect(() => {
    const checkSize = () => {
      setShouldHide(window.innerWidth <= 820)
    }
    
    // Verificar imediatamente
    checkSize()
    
    // Listeners para mudanças
    window.addEventListener('resize', checkSize)
    window.addEventListener('orientationchange', checkSize)
    
    return () => {
      window.removeEventListener('resize', checkSize)
      window.removeEventListener('orientationchange', checkSize)
    }
  }, [])

  // Não renderiza NADA em telas <= 820px - verificação dupla
  if (shouldHide || (typeof window !== 'undefined' && window.innerWidth <= 820)) {
    return null
  }

  if (!photoUrl && !belowPhoto) {
    return null
  }

  return (
    <>
      {photoUrl && (
        <div 
          className="researcher-photo-container"
          data-researcher-photo="true"
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            top: '3%',
            left: '2%',
            border: '2px solid rgba(255,255,255,.2)',
            borderRadius: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255,255,255, 0.2)',
            zIndex: 10
          }}
        >
          <img 
            src={photoUrl} 
            alt={`Foto de ${researcherName}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '10px'
            }}
            loading="lazy"
          />
        </div>
      )}
      {belowPhoto && (
        <div 
          style={{
            position: 'absolute',
            width: '180px',
            top: 'calc(3% + 200px)',
            left: '2%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          {belowPhoto}
        </div>
      )}
    </>
  )
}
