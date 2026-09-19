import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Edit3, Trash2, Plus, Calendar } from 'lucide-react'
import { AdminLoginEvents } from './components/AdminLoginEvents'
import { usePhotoAdminAuth } from '../usePhotoAdminAuth'
import styles from './EventManager.module.css'

interface Event {
  id: string
  name: string
  event_date: string | null
  created_at: string
}

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { isAuthenticated, setIsAuthenticated } = usePhotoAdminAuth()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    event_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    setShowLoginDialog(false)
  }

  const handleCreateEvent = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setEditingEvent(null)
    setFormData({ name: '', event_date: '' })
    setShowCreateDialog(true)
  }

  const handleEditEvent = (event: Event) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setEditingEvent(event)
    setFormData({
      name: event.name,
      event_date: event.event_date || ''
    })
    setShowCreateDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome do evento.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            name: formData.name.trim(),
            event_date: formData.event_date || null,
            display_date: Boolean(formData.event_date)
          })
          .eq('id', editingEvent.id)

        if (error) throw error

        toast({
          title: "Sucesso!",
          description: "Evento atualizado com sucesso.",
        })
      } else {
        // Create new event
        const { data: createdEvent, error } = await supabase
          .from('events')
          .insert([{
            name: formData.name.trim(),
            event_date: formData.event_date || null,
            display_date: Boolean(formData.event_date)
          }])
          .select('id')
          .single()

        if (error) throw error
        if (!createdEvent) throw new Error('Evento não retornado após a criação.')

        toast({
          title: "Sucesso!",
          description: "Evento criado. Agora adicione as fotos.",
        })
        setShowCreateDialog(false)
        navigate(`/Photos/Event/${createdEvent.id}?edit=1`)
        return
      }

      setShowCreateDialog(false)
      setFormData({ name: '', event_date: '' })
      setEditingEvent(null)
      fetchEvents()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar evento.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }

    if (!confirm(`Tem certeza que deseja deletar o evento "${eventName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      // First, delete all photos associated with this event
      const { error: photosError } = await supabase
        .from('event_photos')
        .delete()
        .eq('event_id', eventId)

      if (photosError) throw photosError

      // Then, delete the event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (eventError) throw eventError

      toast({
        title: "Sucesso!",
        description: "Evento deletado com sucesso.",
      })

      fetchEvents()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar evento.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.loading}>Carregando...</div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gerenciamento de Eventos</h1>
          {isAuthenticated ? (
            <Button onClick={handleCreateEvent} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar Novo Evento
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setShowLoginDialog(true)}>
              Entrar como administrador
            </Button>
          )}
        </div>

        <div className={styles.eventsGrid}>
          {events.map((event) => (
            <Card key={event.id} className={styles.eventCard}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{event.name}</span>
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  {event.event_date ? new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Evento sem data definida'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/Photos/Event/${event.id}`, '_blank')}
                >
                  Ver Álbum
                </Button>
              </CardContent>
            </Card>
          ))}

          {events.length === 0 && (
            <div className={styles.emptyState}>
              <p>Nenhum evento encontrado.</p>
              <Button onClick={handleCreateEvent}>
                Criar Primeiro Evento
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do evento"
                required
              />
            </div>
            <div>
              <Label htmlFor="event_date">Data do Evento (opcional)</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (editingEvent ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <AdminLoginEvents
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLogin}
      />

      <Footer />
    </>
  )
}