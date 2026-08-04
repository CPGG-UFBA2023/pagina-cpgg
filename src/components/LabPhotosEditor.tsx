import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, RotateCcw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AdminAuthDialog } from '@/components/AdminAuthDialog'

export type LabPhotos = Record<string, string | null>

/** Busca as fotos personalizadas do laboratório (sobrescrevem as fotos padrão da página). */
export function useLabPhotos(acronym: string) {
  const [photos, setPhotos] = useState<LabPhotos>({})

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('laboratories')
      .select('photo1_url, photo2_url, photo3_url, photo4_url')
      .eq('acronym', acronym)
      .maybeSingle()
    setPhotos((data as LabPhotos) || {})
  }, [acronym])

  useEffect(() => { refetch() }, [refetch])

  return { photos, refetch }
}

interface LabPhotosEditorProps {
  acronym: string
  slots: { index: number; label: string }[]
  onSaved: () => void
}

export function LabPhotosEditor({ acronym, slots, onSaved }: LabPhotosEditorProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const inputs = useRef<Record<number, HTMLInputElement | null>>({})
  const { toast } = useToast()

  const handleClick = () => {
    if (isAdmin) setShowPanel(true)
    else setShowLogin(true)
  }

  const handleSuccess = (role: string) => {
    if (role === 'coordenacao' || role === 'secretaria') {
      setIsAdmin(true)
      setShowLogin(false)
      setShowPanel(true)
    } else {
      toast({ title: 'Acesso negado', description: 'Você não tem permissão para editar as fotos.', variant: 'destructive' })
    }
  }

  const saveUrl = async (index: number, url: string | null) => {
    const { data, error } = await supabase.rpc('set_laboratory_photo', {
      _acronym: acronym,
      _index: index,
      _url: url,
    })
    if (error) throw new Error(`Erro ao salvar no banco: ${error.message}`)
    const res = data as { success: boolean; error?: string } | null
    if (res && res.success === false) throw new Error(res.error || 'Sem permissão para editar fotos')
  }

  const handleFile = async (index: number, file: File) => {
    setUploading(index)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${acronym.toLowerCase()}/photo${index}-${Date.now()}.${ext}`
      const { error: upError } = await supabase.storage
        .from('laboratory-photos')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upError) throw new Error(`Erro no envio do arquivo: ${upError.message}`)

      const { data } = supabase.storage.from('laboratory-photos').getPublicUrl(path)
      await saveUrl(index, data.publicUrl)

      onSaved()
      toast({ title: 'Foto atualizada', description: 'A nova foto já está sendo exibida na página.' })
    } catch (e: any) {
      console.error('Erro ao enviar foto:', e)
      toast({ title: 'Erro', description: e.message || 'Não foi possível enviar a foto.', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }


  const handleReset = async (index: number) => {
    setUploading(index)
    try {
      await saveUrl(index, null)
      onSaved()
      toast({ title: 'Foto restaurada', description: 'A foto padrão foi restabelecida.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Não foi possível restaurar a foto.', variant: 'destructive' })
    } finally {
      setUploading(null)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '96px',
          zIndex: 2147483000,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          background: 'linear-gradient(90deg, #592cbb 0%, #7c4dff 100%)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
        }}
      >
        <ImagePlus size={16} />
        Editar fotos
      </button>

      <AdminAuthDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleSuccess}
        requiredRole="any"
        title={`Login Administrativo - Fotos do ${acronym}`}
      />

      <Dialog open={showPanel} onOpenChange={setShowPanel}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fotos do {acronym}</DialogTitle>
            <DialogDescription>
              Escolha uma nova imagem para cada posição. A troca é imediata na página.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {slots.map(slot => (
              <div key={slot.index} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="text-sm">{slot.label}</span>
                <div className="flex shrink-0 gap-2">
                  <input
                    ref={el => (inputs.current[slot.index] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFile(slot.index, file)
                      e.target.value = ''
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={uploading !== null}
                    onClick={() => inputs.current[slot.index]?.click()}
                  >
                    {uploading === slot.index ? <Loader2 className="animate-spin" size={16} /> : 'Trocar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={uploading !== null}
                    onClick={() => handleReset(slot.index)}
                    title="Restaurar foto padrão"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
