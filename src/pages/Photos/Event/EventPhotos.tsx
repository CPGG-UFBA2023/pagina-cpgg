import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { AdminLoginEventPhotos } from './components/AdminLoginEventPhotos'
import { EventPhotoEditor } from './components/EventPhotoEditor'
import { Edit3, Trash2, Undo2 } from 'lucide-react'
import { BackButtonPhotos } from '@/components/BackButtonPhotos'
import styles from './EventPhotos.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import { schedulePhotoLibraryDeletion, undoPhotoLibraryDeletion, usePendingPhotoLibraryDeletion } from '@/lib/photoDeletionQueue'

interface EventPhoto {
  id: string
  photo_url: string
  photo_order: number
  title?: string | null
  caption?: string | null
  photo_date?: string | null
}

interface Event {
  id: string
  name: string
  event_date: string | null
  category: string
  display_date: boolean
  parent_id?: string | null
}

interface SubAlbum {
  id: string
  name: string
  event_date: string | null
  display_date: boolean
  cover?: string | null
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
  const [subAlbums, setSubAlbums] = useState<SubAlbum[]>([])
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [subForm, setSubForm] = useState({ name: '', event_date: '' })
  const [editingSub, setEditingSub] = useState<SubAlbum | null>(null)
  const [savingSub, setSavingSub] = useState(false)
  const pendingDeletion = usePendingPhotoLibraryDeletion()
  const navigate = useNavigate()
  const { toast } = useToast()

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

      const { data: childrenData } = await supabase
        .from('events')
        .select('id,name,event_date,display_date')
        .eq('parent_id', id)
        .order('event_date', { ascending: false })

      setEvent(eventData)
      setPhotos(photosData || [])
      setSubAlbums(childrenData || [])
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

  const parentPath = event?.parent_id
    ? `/Photos/Event/${event.parent_id}`
    : event?.category === 'historical' ? '/Photos/HistoricalPhotos' : '/Photos'

  const openSubDialog = (sub?: SubAlbum) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setEditingSub(sub || null)
    setSubForm({ name: sub?.name || '', event_date: sub?.event_date || '' })
    setShowSubDialog(true)
  }

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !subForm.name.trim()) return
    setSavingSub(true)
    try {
      if (editingSub) {
        const { error } = await supabase
          .from('events')
          .update({ name: subForm.name.trim(), event_date: subForm.event_date || null, display_date: Boolean(subForm.event_date) })
          .eq('id', editingSub.id)
        if (error) throw error
        setShowSubDialog(false)
        setEditingSub(null)
        toast({ title: 'Sub-álbum atualizado' })
        fetchEventData()
        return
      }
      const { data: created, error } = await supabase
        .from('events')
        .insert([{
          name: subForm.name.trim(),
          event_date: subForm.event_date || null,
          display_date: Boolean(subForm.event_date),
          category: event.category,
          parent_id: event.id,
        }])
        .select('id')
        .single()
      if (error) throw error
      setShowSubDialog(false)
      toast({ title: 'Sub-álbum criado', description: 'Agora adicione as fotos deste evento.' })
      navigate(`/Photos/Event/${created.id}?edit=1`)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar o sub-álbum.', variant: 'destructive' })
    } finally {
      setSavingSub(false)
    }
  }

  const handleDeleteSub = async (sub: SubAlbum) => {
    if (!confirm(`Apagar o sub-álbum “${sub.name}” e todas as fotos dele?`)) return
    const { data: subPhotos, error } = await supabase
      .from('event_photos')
      .select('photo_url')
      .eq('event_id', sub.id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível apagar o sub-álbum.', variant: 'destructive' })
      return
    }
    schedulePhotoLibraryDeletion(
      { kind: 'album', id: sub.id, name: sub.name, photoUrls: (subPhotos || []).map((photo) => photo.photo_url) },
      () => toast({ title: 'Erro', description: 'Não foi possível apagar o sub-álbum.', variant: 'destructive' }),
    )
    toast({ title: 'Sub-álbum retirado', description: 'Use Desfazer durante os próximos 10 segundos.' })
  }

  const handleDeleteAlbum = async () => {
    if (!event || !isAuthenticated) return
    if (!confirm(`Apagar o álbum “${event.name}” e todas as fotos dele?`)) return

    schedulePhotoLibraryDeletion(
      { kind: 'album', id: event.id, name: event.name, photoUrls: photos.map((photo) => photo.photo_url) },
      () => toast({ title: 'Erro', description: 'Não foi possível apagar o álbum.', variant: 'destructive' }),
    )
    toast({ title: 'Álbum retirado', description: 'Use Desfazer durante os próximos 10 segundos.' })
    navigate(parentPath)
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
      <BackButtonPhotos to={parentPath} />
      <div className={styles.Years}>
        <ul>
          {event.name}{event.display_date && event.event_date ? ` — ${new Date(event.event_date + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}` : ''}
        </ul>
        <div
          className="absolute top-4 right-4 z-10 flex gap-2"
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
          {isAuthenticated && (
            <Button
              aria-label="Apagar álbum"
              onClick={handleDeleteAlbum}
              size="sm"
              variant="destructive"
              className="w-10 h-10 p-0 shadow-md"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isHovered && (
            <div className="absolute bottom-full right-0 mb-2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg border">
              Editar álbum
            </div>
          )}
        </div>
        <div className={styles.box}>
          <div className={styles.gallery}>
            {photos.filter((photo) => !(pendingDeletion?.kind === 'photo' && pendingDeletion.id === photo.id)).map((photo, index) => (
              <figure key={photo.id} className={styles.photoItem}>
                <img 
                  src={photo.photo_url} 
                  alt={photo.title || photo.caption || `${t('photos.photoAlt')} ${index + 1} — ${event.name}`}
                />
                {(photo.title || photo.caption || photo.photo_date) && (
                  <figcaption className={styles.caption}>
                    {photo.title && <strong>{photo.title}</strong>}
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

      {pendingDeletion?.kind === 'photo' && !showEditor && (
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            variant="secondary"
            className="gap-2 shadow-lg"
            disabled={pendingDeletion.committing}
            onClick={() => {
              if (undoPhotoLibraryDeletion()) toast({ title: 'Desfeito', description: 'A foto foi restaurada.' })
            }}
          >
            <Undo2 className="h-4 w-4" />
            {pendingDeletion.committing ? 'Apagando...' : 'Desfazer exclusão'}
          </Button>
        </div>
      )}
      
      <Footer />
    </div>
  )
}
