import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { AdminLoginEventPhotos } from './components/AdminLoginEventPhotos'
import { EventPhotoEditor } from './components/EventPhotoEditor'
import { Edit3 } from 'lucide-react'
import { BackButtonPhotos } from '@/components/BackButtonPhotos'
import styles from './EventPhotos.module.css'

interface EventPhoto {
  id: string
  photo_url: string
  photo_order: number
  caption?: string | null
}

interface Event {
  id: string
  name: string
  event_date: string
  category: string
  display_date: boolean
}

export function EventPhotos() {
  const { id } = useParams<{ id: string }>()
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
      setIsAuthenticated(role === 'coordenacao' || role === 'ti' || role === 'secretaria')
    })
  }, [id])

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
          Carregando...
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
          Evento não encontrado
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
          {event.name}{event.display_date ? ` — ${new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
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
                  alt={photo.caption || `Foto ${index + 1} do evento ${event.name}`}
                />
                {photo.caption && <figcaption className={styles.caption}>{photo.caption}</figcaption>}
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
