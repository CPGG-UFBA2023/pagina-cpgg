import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, GripVertical, Save } from 'lucide-react'

interface EventPhoto {
  id: string
  photo_url: string
  photo_order: number
  caption?: string | null
}

interface EventPhotoEditorProps {
  eventId: string
  eventName: string
  eventDate: string
  photos: EventPhoto[]
  onPhotosChange: (photos: EventPhoto[]) => void
  onEventChange: (name: string, date: string) => void
  onClose: () => void
}

export function EventPhotoEditor({
  eventId,
  eventName,
  eventDate,
  photos,
  onPhotosChange,
  onEventChange,
  onClose,
}: EventPhotoEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDropping, setIsDropping] = useState(false)
  const [name, setName] = useState(eventName)
  const [date, setDate] = useState(eventDate)
  const [savingEvent, setSavingEvent] = useState(false)
  const [captions, setCaptions] = useState<Record<string, string>>(
    Object.fromEntries(photos.map((p) => [p.id, p.caption || '']))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const persistOrder = async (ordered: EventPhoto[]) => {
    const updated = ordered.map((photo, index) => ({ ...photo, photo_order: index + 1 }))
    try {
      await Promise.all(
        updated.map((photo) =>
          supabase.from('event_photos').update({ photo_order: photo.photo_order }).eq('id', photo.id)
        )
      )
      onPhotosChange(updated)
    } catch {
      toast({ title: 'Erro', description: 'Erro ao reordenar fotos.', variant: 'destructive' })
    }
  }

  const handleDropReorder = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return
    const newPhotos = [...photos]
    const [moved] = newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(dropIndex, 0, moved)
    setDraggedIndex(null)
    await persistOrder(newPhotos)
  }

  const uploadFiles = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) {
      toast({ title: 'Erro', description: 'Selecione apenas arquivos de imagem.', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    let current = [...photos]
    try {
      for (const file of images) {
        const fileName = `${eventId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`
        const { error: storageError } = await supabase.storage.from('event-photos').upload(fileName, file)
        if (storageError) throw storageError

        const { data } = supabase.storage.from('event-photos').getPublicUrl(fileName)
        const nextOrder = Math.max(...current.map((p) => p.photo_order), 0) + 1

        const { data: newPhoto, error: dbError } = await supabase
          .from('event_photos')
          .insert([{ event_id: eventId, photo_url: data.publicUrl, photo_order: nextOrder }])
          .select()
          .single()

        if (dbError) throw dbError
        current = [...current, newPhoto as EventPhoto]
        onPhotosChange(current)
      }
      toast({ title: 'Sucesso!', description: `${images.length} foto(s) adicionada(s).` })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao adicionar fotos.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      const marker = '/event-photos/'
      const path = photoUrl.includes(marker) ? photoUrl.split(marker)[1] : null
      if (path) await supabase.storage.from('event-photos').remove([decodeURIComponent(path)])
      await supabase.from('event_photos').delete().eq('id', photoId)
      onPhotosChange(photos.filter((p) => p.id !== photoId))
      toast({ title: 'Sucesso!', description: 'Foto removida.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao remover foto.', variant: 'destructive' })
    }
  }

  const handleSaveCaption = async (photoId: string) => {
    try {
      const caption = captions[photoId] ?? ''
      const { error } = await supabase.from('event_photos').update({ caption }).eq('id', photoId)
      if (error) throw error
      onPhotosChange(photos.map((p) => (p.id === photoId ? { ...p, caption } : p)))
      toast({ title: 'Sucesso!', description: 'Legenda salva.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar legenda.', variant: 'destructive' })
    }
  }

  const handleSaveEvent = async () => {
    if (!name.trim() || !date) {
      toast({ title: 'Erro', description: 'Informe o nome e a data do evento.', variant: 'destructive' })
      return
    }
    setSavingEvent(true)
    try {
      const { error } = await supabase
        .from('events')
        .update({ name: name.trim(), event_date: date })
        .eq('id', eventId)
      if (error) throw error
      onEventChange(name.trim(), date)
      toast({ title: 'Sucesso!', description: 'Dados do evento atualizados.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar o evento.', variant: 'destructive' })
    } finally {
      setSavingEvent(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-background text-foreground rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-xl font-semibold">Editar álbum do evento</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Plus className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Adicionar fotos'}
            </Button>
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </div>

        <div className="p-6 border-b grid gap-4 md:grid-cols-[1fr_200px_auto] items-end">
          <div>
            <Label htmlFor="ev-name">Nome do evento</Label>
            <Input id="ev-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ev-date">Data do evento</Label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button onClick={handleSaveEvent} disabled={savingEvent}>
            <Save className="w-4 h-4 mr-2" />
            {savingEvent ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDropping(true) }}
          onDragLeave={() => setIsDropping(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDropping(false)
            const files = Array.from(e.dataTransfer.files || [])
            if (files.length > 0) uploadFiles(files)
          }}
          className={`m-6 rounded-lg border-2 border-dashed p-6 text-center text-sm ${isDropping ? 'border-primary bg-primary/10' : 'border-muted-foreground/40'}`}
        >
          Arraste fotos para cá para adicioná-las ao álbum
        </div>

        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropReorder(e, index)}
                className="border rounded-lg p-2 bg-card"
              >
                <div className="relative">
                  <img src={photo.photo_url} alt={photo.caption || `Foto ${index + 1}`} className="w-full h-40 object-cover rounded" />
                  <GripVertical className="w-5 h-5 absolute top-2 left-2 text-white drop-shadow cursor-move" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Legenda da foto"
                    value={captions[photo.id] ?? photo.caption ?? ''}
                    onChange={(e) => setCaptions({ ...captions, [photo.id]: e.target.value })}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleSaveCaption(photo.id)}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length > 0) uploadFiles(files)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
