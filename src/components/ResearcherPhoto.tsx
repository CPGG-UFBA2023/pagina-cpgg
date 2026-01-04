import { useResearcherProfile } from './ResearcherProfileContext'
import { useIsSmallScreen } from '@/hooks/use-mobile'

interface ResearcherPhotoProps {
  researcherName: string
}

export function ResearcherPhoto({ researcherName }: ResearcherPhotoProps) {
  const { photoUrl, belowPhoto } = useResearcherProfile()
  const isSmallScreen = useIsSmallScreen(820)

  // Debug log - será visível nos console logs
  console.log('[ResearcherPhoto] isSmallScreen:', isSmallScreen, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'N/A')

  // Não renderiza foto em telas <= 820px
  if (isSmallScreen) {
    console.log('[ResearcherPhoto] Hiding photo because screen is small')
    return null
  }

  if (!photoUrl && !belowPhoto) {
    return null
  }

  return (
    <>
      {photoUrl && (
        <div 
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
