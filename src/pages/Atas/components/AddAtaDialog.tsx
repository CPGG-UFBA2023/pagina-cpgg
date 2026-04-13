import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { Upload } from 'lucide-react'

interface AddAtaDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, pdfUrl: string, meetingDate: string, meetingType: string, yearGroup: string) => Promise<void>
  defaultYearGroup: string
}

const MEETING_TYPES = ['Conselho Científico', 'Conselho Deliberativo', 'Geral']

const isValidYearGroup = (value: string): boolean => {
  const trimmed = value.trim()
  if (!trimmed) return false
  return /^\d{4}(?:-\d{4})?$/.test(trimmed)
}

export function AddAtaDialog({ isOpen, onClose, onAdd, defaultYearGroup }: AddAtaDialogProps) {
  const [name, setName] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingType, setMeetingType] = useState('')
  const [yearGroup, setYearGroup] = useState(defaultYearGroup)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const trimmedYearGroup = yearGroup.trim()
  const yearValid = isValidYearGroup(trimmedYearGroup)
  const canSubmit = Boolean(trimmedName && selectedFile && meetingDate && meetingType && yearValid)

  useEffect(() => {
    if (isOpen) {
      setYearGroup(defaultYearGroup)
      setSubmitError('')
    }
  }, [defaultYearGroup, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setSelectedFile(null)
      setSubmitError('Selecione um arquivo PDF válido.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    setSubmitError('')
  }

  const handleSubmit = async () => {
    if (!trimmedName) {
      setSubmitError('Informe o nome da ata.')
      return
    }

    if (!meetingDate) {
      setSubmitError('Informe a data da reunião.')
      return
    }

    if (!meetingType) {
      setSubmitError('Selecione o tipo de reunião.')
      return
    }

    if (!yearValid) {
      setSubmitError('Use um período válido, como 2025 ou 2010-2020.')
      return
    }

    if (!selectedFile) {
      setSubmitError('Selecione um arquivo PDF.')
      return
    }

    setIsLoading(true)
    setSubmitError('')

    let uploadedPath: string | null = null

    try {
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]+/g, '_')
      const safeYearFolder = trimmedYearGroup.replace(/[\\/]+/g, '-')
      const fileName = `${safeYearFolder}/${Date.now()}_${sanitizedFileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('atas')
        .upload(fileName, selectedFile, { contentType: 'application/pdf' })

      if (uploadError) {
        throw new Error(uploadError.message || 'Não foi possível enviar o PDF.')
      }

      uploadedPath = uploadData.path

      const { data: urlData } = supabase.storage.from('atas').getPublicUrl(uploadedPath)
      await onAdd(trimmedName, urlData.publicUrl, meetingDate, meetingType, trimmedYearGroup)
      handleClose()
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage.from('atas').remove([uploadedPath])
      }

      console.error('Erro ao adicionar ata:', error)
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível adicionar a ata.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setSelectedFile(null)
    setMeetingDate('')
    setMeetingType('')
    setYearGroup(defaultYearGroup)
    setSubmitError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose()
    }}>
      <DialogContent className="sm:max-w-md max-h-[85vh]" style={{ marginTop: '80px', overflowY: 'auto', overflowX: 'hidden' }}>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Ata</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para adicionar uma nova ata.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome/Título da Ata:</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ata da reunião ordinária" />
          </div>
          <div>
            <label className="text-sm font-medium">Data da Reunião:</label>
            <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Tipo de Reunião:</label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[200]">
                {MEETING_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Período/Ano:</label>
            <Input value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} placeholder="Ex: 2025, 2010-2020" className={yearGroup && !yearValid ? 'border-destructive' : ''} />
            {yearGroup && !yearValid && (
              <p className="text-xs text-destructive mt-1">Formato inválido. Use: 2025 ou 2010-2020</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Arquivo PDF:</label>
            <div
              className="mt-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-6 w-6 mb-2 opacity-60" />
              {selectedFile ? (
                <p className="text-sm font-medium">{selectedFile.name}</p>
              ) : (
                <p className="text-sm opacity-60">Clique para selecionar o PDF</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit}>
            {isLoading ? 'Enviando...' : 'Adicionar'}
          </Button>
          {!canSubmit && !submitError && (
            <p className="text-xs text-muted-foreground w-full text-center mt-1">
              Preencha todos os campos obrigatórios
              {!selectedFile && ' • Selecione um PDF'}
              {!meetingType && ' • Escolha o tipo'}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
