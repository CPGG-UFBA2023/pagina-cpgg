import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface HistoryPdfUploadProps {
  onUpdated: (newUrl: string) => void
}

export function HistoryPdfUpload({ onUpdated }: HistoryPdfUploadProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleClose = () => {
    if (loading) return
    setFile(null)
    setError(null)
    setOpen(false)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Selecione um arquivo PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('O arquivo deve ser um PDF.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const path = `cpgg-history/PDF_history_${Date.now()}.pdf`
      const { error: upErr } = await supabase.storage
        .from('history-pdf')
        .upload(path, file, { contentType: 'application/pdf', upsert: true })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('history-pdf').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const { error: updErr } = await supabase
        .from('history_documents')
        .update({ pdf_url: publicUrl })
        .eq('slug', 'cpgg-history')
      if (updErr) throw updErr

      toast({ title: 'PDF atualizado', description: 'O documento de história foi substituído com sucesso.' })
      onUpdated(publicUrl)
      handleClose()
    } catch (e: any) {
      setError(e?.message || 'Falha ao enviar o PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: '170px',
          right: '20px',
          zIndex: 100,
          backgroundColor: '#592cbb',
          color: 'white',
        }}
      >
        <Upload className="w-4 h-4 mr-2" />
        Substituir PDF
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Substituir PDF da História do CPGG</DialogTitle>
            <DialogDescription>
              Selecione um novo arquivo PDF para substituir o documento atual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {file && <p className="text-xs opacity-70">Selecionado: {file.name}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading || !file}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
