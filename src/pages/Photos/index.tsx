import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Undo2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { supabase } from '../../integrations/supabase/client'
import { AdminLoginEvents } from './EventManager/components/AdminLoginEvents'
import styles from './Photos.module.css'
import { useLanguage } from '@/contexts/LanguageContext'
import { schedulePhotoLibraryDeletion, undoPhotoLibraryDeletion, usePendingPhotoLibraryDeletion } from '@/lib/photoDeletionQueue'

interface Event {
  id: string
  name: string
  event_date: string | null
  created_at: string
}

export function Photos() {
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState({ name: '', event_date: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const pendingDeletion = usePendingPhotoLibraryDeletion()
  const [manageMode, setManageMode] = useState(false)
  const visibleEvents = events.filter((event) => !(pendingDeletion?.kind === 'album' && pendingDeletion.id === event.id))

  useEffect(() => {
    fetchEvents()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: role } = await supabase.rpc('get_admin_role')
      setIsAuthenticated(role === 'coordenacao' || role === 'ti' || role === 'secretaria')
    })
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('category', 'event')
        .is('parent_id', null)
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    action()
  }

  const openCreate = () => requireAuth(() => {
    setEditing(null)
    setForm({ name: '', event_date: '' })
    setShowDialog(true)
  })

  const openEdit = (event: Event) => requireAuth(() => {
    setEditing(event)
    setForm({ name: event.name, event_date: event.event_date || '' })
    setShowDialog(true)
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do evento.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase
          .from('events')
          .update({ name: form.name.trim(), event_date: form.event_date || null, display_date: Boolean(form.event_date) })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { data: createdEvent, error } = await supabase
          .from('events')
          .insert([{ name: form.name.trim(), event_date: form.event_date || null, display_date: Boolean(form.event_date) }])
          .select('id')
          .single()
        if (error) throw error
        if (!createdEvent) throw new Error('Evento não retornado após a criação.')
        toast({ title: 'Sucesso!', description: 'Evento criado. Agora adicione as fotos.' })
        setShowDialog(false)
        navigate(`/Photos/Event/${createdEvent.id}?edit=1`)
        return
      }
      toast({ title: 'Sucesso!', description: 'Evento atualizado.' })
      setShowDialog(false)
      setEditing(null)
      fetchEvents()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar o evento.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (event: Event) => requireAuth(async () => {
    if (!confirm(`Apagar o evento "${event.name}" e todas as suas fotos?`)) return
    try {
      const { data: eventPhotos, error } = await supabase
        .from('event_photos')
        .select('photo_url')
        .eq('event_id', event.id)
      if (error) throw error
      schedulePhotoLibraryDeletion(
        { kind: 'album', id: event.id, name: event.name, photoUrls: (eventPhotos || []).map((photo) => photo.photo_url) },
        () => toast({ title: 'Erro', description: 'Não foi possível apagar o álbum.', variant: 'destructive' }),
      )
      toast({ title: 'Álbum retirado', description: 'Use Desfazer durante os próximos 10 segundos.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao remover o evento.', variant: 'destructive' })
    }
  })

  return (
    <div className={styles.pageContainer}>
      <Header/>
      <main className={`${styles.photos} photos`}>
        <h1 className={styles.title}>{t('photos.events')}</h1>

        <div className={styles.adminBar}>
          <Button
            size="sm"
            variant={manageMode ? 'default' : 'secondary'}
            aria-label="Editar álbuns"
            onClick={() => requireAuth(() => setManageMode((previous) => !previous))}
          >
            <Pencil className="w-4 h-4 mr-1" /> {manageMode ? 'Concluir edição' : 'Editar álbuns'}
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Novo evento
          </Button>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.buttonsGrid}>
            <Link to="/Photos/HistoricalPhotos" className={styles.historical}>
              <h2>{t('photos.historical')}</h2>
            </Link>

            <Link to="/Photos/Years" className={styles.fifthy}>
              <h2>{t('photos.fiftyYears')}</h2>
            </Link>

            <Link to="/Photos/FirstMeeting" className={styles.reopen}>
              <h2>{t('photos.firstMeeting')}</h2>
            </Link>

            {visibleEvents.map((event) => (
              <div key={event.id} className={styles.eventCardWrapper}>
                <Link to={`/Photos/Event/${event.id}`} className={styles.eventCard}>
                  <div className={styles.eventCardContent}>
                    <h2>{event.name}</h2>
                    {event.event_date && <p>{t('photos.eventHeld')} {new Date(event.event_date + 'T12:00:00').toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}</p>}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {isAuthenticated && manageMode && (
            <div className={styles.managePanel}>
              <h3>Editar álbuns</h3>
              {visibleEvents.length === 0 && <p>Nenhum álbum de evento cadastrado.</p>}
              {visibleEvents.map((event) => (
                <div key={event.id} className={styles.manageRow}>
                  <span>{event.name}</span>
                  <div className={styles.manageRowActions}>
                    <Button aria-label={`Editar dados de ${event.name}`} size="sm" variant="secondary" onClick={() => openEdit(event)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Nome e data
                    </Button>
                    <Button aria-label={`Editar fotos de ${event.name}`} size="sm" variant="outline" onClick={() => navigate(`/Photos/Event/${event.id}?edit=1`)}>
                      Fotos
                    </Button>
                    <Button aria-label={`Apagar ${event.name}`} size="sm" variant="destructive" onClick={() => handleDelete(event)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {pendingDeletion?.kind === 'album' && (
        <div className="fixed bottom-4 left-4 z-50">
          <Button
            variant="secondary"
            className="gap-2 shadow-lg"
            disabled={pendingDeletion.committing}
            onClick={() => {
              if (undoPhotoLibraryDeletion()) toast({ title: 'Desfeito', description: `O álbum “${pendingDeletion.name}” foi restaurado.` })
            }}
          >
            <Undo2 className="h-4 w-4" />
            {pendingDeletion.committing ? 'Apagando...' : 'Desfazer exclusão'}
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm max-h-[45vh] top-[calc(50%+50px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar evento' : 'Novo evento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="ev-name">Nome do evento</Label>
              <Input id="ev-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="ev-date">Data do evento (opcional)</Label>
              <Input id="ev-date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminLoginEvents
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={() => {
          setIsAuthenticated(true)
          setShowLogin(false)
        }}
      />

      <Footer/>
    </div>
  )
}
