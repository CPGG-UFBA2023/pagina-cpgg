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
  // Accepts: "2025", "2010-2020", "2024-2025"
  return /^\d{4}(-\d{4})?$/.test(trimmed)
}

export function AddAtaDialog({ isOpen, onClose, onAdd, defaultYearGroup }: AddAtaDialogProps) {
  const [name, setName] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingType, setMeetingType] = useState('')
  const [yearGroup, setYearGroup] = useState(defaultYearGroup)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const yearValid = isValidYearGroup(yearGroup)

  useEffect(() => {
    if (isOpen) {
      setYearGroup(defaultYearGroup)
    }
  }, [defaultYearGroup, isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (!name || !selectedFile || !meetingDate || !meetingType || !yearValid) return
    setIsLoading(true)
    try {
      // Upload PDF to Supabase Storage
      const fileName = `${yearGroup}/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('atas')
        .upload(fileName, selectedFile, { contentType: 'application/pdf' })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from('atas').getPublicUrl(uploadData.path)
      const pdfUrl = urlData.publicUrl

      await onAdd(name, pdfUrl, meetingDate, meetingType, yearGroup)
      handleClose()
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
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
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose()
    }}>
      <DialogContent className="sm:max-w-md">
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
              <SelectContent>
                {MEETING_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Período/Ano:</label>
            <Input value={yearGroup} onChange={(e) => setYearGroup(e.target.value)} placeholder="Ex: 2025, 2010-2020" className={yearGroup && !yearValid ? 'border-red-500' : ''} />
            {yearGroup && !yearValid && (
              <p className="text-xs text-red-500 mt-1">Formato inválido. Use: 2025 ou 2010-2020</p>
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
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name || !selectedFile || !meetingDate || !meetingType}>
            {isLoading ? 'Enviando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
