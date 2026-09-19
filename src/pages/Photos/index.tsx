import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { supabase } from '../../integrations/supabase/client'
import { AdminLoginEvents } from './EventManager/components/AdminLoginEvents'
import styles from './Photos.module.css'

interface Event {
  id: string
  name: string
  event_date: string
  created_at: string
}

export function Photos() {
  const [events, setEvents] = useState<Event[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState({ name: '', event_date: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
    const savedAuth = localStorage.getItem('eventManagerAuth') || localStorage.getItem('eventPhotosAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('category', 'event')
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
    setForm({ name: event.name, event_date: event.event_date })
    setShowDialog(true)
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.event_date) {
      toast({ title: 'Erro', description: 'Informe o nome e a data do evento.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase
          .from('events')
          .update({ name: form.name.trim(), event_date: form.event_date })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ name: form.name.trim(), event_date: form.event_date }])
        if (error) throw error
      }
      toast({ title: 'Sucesso!', description: editing ? 'Evento atualizado.' : 'Evento criado. Abra o álbum para adicionar fotos.' })
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
      await supabase.from('event_photos').delete().eq('event_id', event.id)
      const { error } = await supabase.from('events').delete().eq('id', event.id)
      if (error) throw error
      toast({ title: 'Sucesso!', description: 'Evento removido.' })
      fetchEvents()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao remover o evento.', variant: 'destructive' })
    }
  })

  return (
    <div className={styles.pageContainer}>
      <Header/>
      <main className={`${styles.photos} photos`}>
        <h1 className={styles.title}>Fotos de eventos</h1>

        <div className={styles.adminBar}>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Novo evento
          </Button>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.buttonsGrid}>
            <Link to="/Photos/HistoricalPhotos" className={styles.historical}>
              <h2>Históricas</h2>
            </Link>

            <Link to="/Photos/Years" className={styles.fifthy}>
              <h2>50 anos - Pós-Graduação em Geofísica</h2>
            </Link>

            <Link to="/Photos/FirstMeeting" className={styles.reopen}>
              <h2>Primeira reunião geral- retorno das atividades do CPGG</h2>
            </Link>

            {events.map((event) => (
              <div key={event.id} style={{ position: 'relative' }}>
                <Link to={`/Photos/Event/${event.id}`} className={styles.eventCard}>
                  <div>
                    <h2>{event.name}</h2>
                    <p>Evento realizado em {new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </Link>
                {isAuthenticated && (
                  <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => openEdit(event)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => handleDelete(event)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

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
              <Label htmlFor="ev-date">Data do evento</Label>
              <Input id="ev-date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
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
          localStorage.setItem('eventManagerAuth', 'true')
        }}
      />

      <Footer/>
    </div>
  )
}
