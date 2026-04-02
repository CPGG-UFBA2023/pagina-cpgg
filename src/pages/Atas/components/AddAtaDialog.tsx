import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddAtaDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, pdfUrl: string, meetingDate: string, meetingType: string, yearGroup: string) => Promise<void>
  defaultYearGroup: string
}

const MEETING_TYPES = ['Conselho Científico', 'Conselho Deliberativo', 'Geral']
const YEAR_GROUPS = ['2010-2020', '2023', '2024', '2025']

export function AddAtaDialog({ isOpen, onClose, onAdd, defaultYearGroup }: AddAtaDialogProps) {
  const [name, setName] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingType, setMeetingType] = useState('')
  const [yearGroup, setYearGroup] = useState(defaultYearGroup)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setYearGroup(defaultYearGroup)
    }
  }, [defaultYearGroup, isOpen])

  const handleSubmit = async () => {
    if (!name || !pdfUrl || !meetingDate || !meetingType || !yearGroup) return
    setIsLoading(true)
    try {
      await onAdd(name, pdfUrl, meetingDate, meetingType, yearGroup)
      handleClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setPdfUrl('')
    setMeetingDate('')
    setMeetingType('')
    setYearGroup(defaultYearGroup)
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
            <Select value={yearGroup} onValueChange={setYearGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_GROUPS.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Link do PDF:</label>
            <Input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://..." type="url" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name || !pdfUrl || !meetingDate || !meetingType}>
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
