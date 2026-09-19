import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, GripVertical, Save, Undo2 } from 'lucide-react'
import { schedulePhotoLibraryDeletion, undoPhotoLibraryDeletion, usePendingPhotoLibraryDeletion } from '@/lib/photoDeletionQueue'

interface EventPhoto {
  id: string
  photo_url: string
  photo_order: number
  caption?: string | null
  photo_date?: string | null
}

interface EventPhotoEditorProps {
  eventId: string
  eventName: string
  eventDate: string | null
  photos: EventPhoto[]
  onPhotosChange: (photos: EventPhoto[]) => void
  onEventChange: (name: string, date: string | null) => void
  onClose: () => void
  albumType?: 'event' | 'historical'
}

export function EventPhotoEditor({
  eventId,
  eventName,
  eventDate,
  photos,
  onPhotosChange,
  onEventChange,
  onClose,
  albumType = 'event',
}: EventPhotoEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDropping, setIsDropping] = useState(false)
  const [name, setName] = useState(eventName)
  const [date, setDate] = useState(eventDate || '')
  const [savingEvent, setSavingEvent] = useState(false)
  const [captions, setCaptions] = useState<Record<string, string>>(
    Object.fromEntries(photos.map((p) => [p.id, p.caption || '']))
  )
  const [photoDates, setPhotoDates] = useState<Record<string, string>>(
    Object.fromEntries(photos.map((p) => [p.id, p.photo_date || '']))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const pendingDeletion = usePendingPhotoLibraryDeletion()

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
        setCaptions((previous) => ({ ...previous, [newPhoto.id]: newPhoto.caption || '' }))
        setPhotoDates((previous) => ({ ...previous, [newPhoto.id]: newPhoto.photo_date || '' }))
        onPhotosChange(current)
      }
      toast({ title: 'Sucesso!', description: `${images.length} foto(s) adicionada(s).` })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao adicionar fotos.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = (photoId: string, photoUrl: string) => {
    schedulePhotoLibraryDeletion(
      { kind: 'photo', id: photoId, name: 'foto', photoUrl },
      () => toast({ title: 'Erro', description: 'Não foi possível apagar a foto.', variant: 'destructive' }),
    )
    toast({ title: 'Foto retirada', description: 'Use Desfazer durante os próximos 10 segundos.' })
  }

  const handleSaveMetadata = async (photoId: string) => {
    try {
      const caption = captions[photoId] ?? ''
      const photoDate = photoDates[photoId] || null
      const { error } = await supabase
        .from('event_photos')
        .update({ caption, photo_date: photoDate })
        .eq('id', photoId)
      if (error) throw error
      onPhotosChange(photos.map((p) => (p.id === photoId ? { ...p, caption, photo_date: photoDate } : p)))
      toast({ title: 'Sucesso!', description: 'Dados da foto salvos.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar os dados da foto.', variant: 'destructive' })
    }
  }

  const handleSaveEvent = async () => {
    if (!name.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do evento.', variant: 'destructive' })
      return
    }
    setSavingEvent(true)
    try {
      const { error } = await supabase
        .from('events')
        .update({ name: name.trim(), event_date: date || null, display_date: Boolean(date) })
        .eq('id', eventId)
      if (error) throw error
      onEventChange(name.trim(), date || null)
      toast({ title: 'Sucesso!', description: 'Dados do evento atualizados.' })
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar o evento.', variant: 'destructive' })
    } finally {
      setSavingEvent(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 pt-[100px]">
      <div className="bg-background text-foreground rounded-lg max-w-2xl w-full h-[45vh] min-h-[320px] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-xl font-semibold">Editar {albumType === 'historical' ? 'subálbum histórico' : 'álbum do evento'}</h2>
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
            <Label htmlFor="ev-date">Data do evento (opcional)</Label>
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
            {photos.filter((photo) => !(pendingDeletion?.kind === 'photo' && pendingDeletion.id === photo.id)).map((photo, index) => (
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
                <div className="mt-2 grid gap-2">
                  <Input
                    placeholder="Legenda da foto"
                    value={captions[photo.id] ?? photo.caption ?? ''}
                    onChange={(e) => setCaptions((previous) => ({ ...previous, [photo.id]: e.target.value }))}
                  />
                  <Input
                    aria-label="Data da foto"
                    type="date"
                    value={photoDates[photo.id] ?? photo.photo_date ?? ''}
                    onChange={(e) => setPhotoDates((previous) => ({ ...previous, [photo.id]: e.target.value }))}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleSaveMetadata(photo.id)}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar dados
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
        {pendingDeletion?.kind === 'photo' && (
          <div className="sticky bottom-4 ml-6 mt-4 w-fit z-10">
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
      </div>
    </div>
  )
}
