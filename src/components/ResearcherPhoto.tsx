import { useResearcherProfile } from './ResearcherProfileContext'

interface ResearcherPhotoProps {
  researcherName: string
}

// Função que verifica IMEDIATAMENTE se deve esconder
// Executada ANTES do React renderizar qualquer coisa
const shouldHidePhoto = (): boolean => {
  if (typeof window === 'undefined') return true
  return window.innerWidth <= 820
}

export function ResearcherPhoto({ researcherName }: ResearcherPhotoProps) {
  // Verificação SÍNCRONA e IMEDIATA - antes de qualquer hook
  // Se tela <= 820px, retorna null IMEDIATAMENTE
  if (shouldHidePhoto()) {
    return null
  }

  const { photoUrl, belowPhoto } = useResearcherProfile()

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
