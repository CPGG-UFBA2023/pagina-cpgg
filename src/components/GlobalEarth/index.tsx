import earth from '../../assets/earth-imgur.png'
import { useLocation } from 'react-router-dom'

export function GlobalEarth() {
  const location = useLocation()
  
  // Hide on specific pages
  const hideOnRoutes = [
    '/',
    '/researchers', 
    '/Researchers',
    '/technicians', 
    '/Technicians', 
    '/coordination', 
    '/Coordination',
    '/history',
    '/History',
    '/history/Former',
    '/History/Former',
    '/Map',
    '/map',
    '/production',
    '/Production',
    '/News/News1',
    '/News/News2',
    '/News/News3',
    '/News/Archive'
  ]
  
  // Also hide on photo subpages (but not /Photos root or /Photos/HistoricalPhotos root)
  const isPhotoSubPage = (location.pathname.includes('/Photos/') || 
                         location.pathname.includes('/photos/')) &&
                         location.pathname !== '/Photos/HistoricalPhotos'
  
  // Hide on any /News/* route (including dynamic /News/:archiveNumber)
  const isNewsPage = location.pathname.startsWith('/News/') || location.pathname.startsWith('/news/')

  // Hide on LAIGA repository pages
  const isLaigaRepo = location.pathname.startsWith('/labs/laiga/repositorio')
  const isLabMainPage = ['/labs/laiga', '/labs/lamod', '/labs/lemar', '/labs/ltm-rx', '/labs/lagep', '/labs/labfis'].includes(location.pathname)
  const isSpacePage = ['/spaces/auditory', '/spaces/meeting-room'].includes(location.pathname)
  const isRepairsPage = location.pathname === '/repairs-services'
  const isLabReservationPage = /\/labs\/[^/]+\/reservation-form$/i.test(location.pathname)
  const isCpggPage = location.pathname.toLowerCase() === '/cpgg'
  const isHistoryViewPage = location.pathname.toLowerCase() === '/history/view'

  const shouldHide = hideOnRoutes.includes(location.pathname) || isPhotoSubPage || isNewsPage || isLaigaRepo || isLabMainPage || isSpacePage || isRepairsPage || isLabReservationPage || isCpggPage || isHistoryViewPage

  
  if (shouldHide) {
    return null
  }
  
  // Hide on screens <= 1024px
  const shouldHideOnSmallScreen = window.innerWidth <= 1200

  if (shouldHideOnSmallScreen) {
    return null
  }

  // Calculate size based on screen width
  const getSize = () => {
    const width = window.innerWidth
    if (width <= 1440) return '450px' // -50px from original
    return '500px' // Default size for screens larger than 1440px
  }

  const size = getSize()

  return (
    <div 
      className="global-earth-container"
      style={{
        position: 'fixed !important' as any,
        top: '215px !important' as any,
        right: '50px !important' as any,
        zIndex: '1 !important' as any,
        width: `${size} !important` as any,
        height: `${size} !important` as any,
        display: 'block !important' as any,
        visibility: 'visible !important' as any,
        pointerEvents: 'none !important' as any
      }}
    >
      <img 
        src={earth} 
        alt='Terra Global CPGG' 
        className="global-earth-image"
        style={{
          width: `${size} !important` as any,
          height: `${size} !important` as any,
          objectFit: 'contain !important' as any,
          borderRadius: '50% !important' as any,
          margin: '0 !important' as any,
          padding: '0 !important' as any,
          display: 'block !important' as any,
          maxWidth: 'none !important' as any,
          maxHeight: 'none !important' as any
        }}
      />
    </div>
  )
}