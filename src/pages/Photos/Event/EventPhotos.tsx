import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { AdminLoginEventPhotos } from './components/AdminLoginEventPhotos'
import { EventPhotoEditor } from './components/EventPhotoEditor'
import { Edit3 } from 'lucide-react'
import { BackButtonPhotos } from '@/components/BackButtonPhotos'
import styles from './EventPhotos.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface EventPhoto {
  id: string
  photo_url: string
  photo_order: number
  caption?: string | null
  photo_date?: string | null
}

interface Event {
  id: string
  name: string
  event_date: string | null
  category: string
  display_date: boolean
}

export function EventPhotos() {
  const { t, language } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<EventPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEventData()
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: role } = await supabase.rpc('get_admin_role')
      const canEdit = role === 'coordenacao' || role === 'ti' || role === 'secretaria'
      setIsAuthenticated(canEdit)
      if (canEdit && searchParams.get('edit') === '1') {
        setShowEditor(true)
        setSearchParams({}, { replace: true })
      }
    })
  }, [id, searchParams, setSearchParams])

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (eventError) throw eventError

      const { data: photosData, error: photosError } = await supabase
        .from('event_photos')
        .select('*')
        .eq('event_id', id)
        .order('photo_order')

      if (photosError) throw photosError

      setEvent(eventData)
      setPhotos(photosData || [])
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    setShowLoginDialog(false)
    setShowEditor(true)
  }

  const handleEditClick = () => {
    if (isAuthenticated) {
      setShowEditor(true)
    } else {
      setShowLoginDialog(true)
    }
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div style={{ padding: '150px 20px', textAlign: 'center' }}>
          {t('photos.loading')}
        </div>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div style={{ padding: '150px 20px', textAlign: 'center' }}>
          {t('photos.notFound')}
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <BackButtonPhotos to={event.category === 'historical' ? '/Photos/HistoricalPhotos' : '/Photos'} />
      <div className={styles.Years}>
        <ul>
          {event.name}{event.display_date && event.event_date ? ` — ${new Date(event.event_date + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}` : ''}
        </ul>
        <div 
          className="absolute top-4 right-4 z-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Button
            onClick={handleEditClick}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90 shadow-md"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          {isHovered && (
            <div className="absolute bottom-full right-0 mb-2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg border">
              Editar álbum
            </div>
          )}
        </div>
        <div className={styles.box}>
          <div className={styles.gallery}>
            {photos.map((photo, index) => (
              <figure key={photo.id} className={styles.photoItem}>
                <img 
                  src={photo.photo_url} 
                  alt={photo.caption || `${t('photos.photoAlt')} ${index + 1} — ${event.name}`}
                />
                {(photo.caption || photo.photo_date) && (
                  <figcaption className={styles.caption}>
                    {photo.caption && <span>{photo.caption}</span>}
                    {photo.photo_date && (
                      <time dateTime={photo.photo_date}>
                        {new Date(photo.photo_date + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}
                      </time>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>
      
      <AdminLoginEventPhotos
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLogin}
      />
      
      {showEditor && id && (
        <EventPhotoEditor
          eventId={id}
          eventName={event.name}
          eventDate={event.event_date}
          photos={photos}
          onPhotosChange={setPhotos}
          onEventChange={(name, event_date) => setEvent({ ...event, name, event_date })}
          onClose={() => setShowEditor(false)}
          albumType={event.category === 'historical' ? 'historical' : 'event'}
        />
      )}
      
      <Footer />
    </div>
  )
}
