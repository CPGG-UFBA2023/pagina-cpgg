import { useState } from 'react'
import { Minus, Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import styles from '../Atas.module.css'

interface EditableAtaProps {
  ata: {
    id: string;
    name: string;
    pdf_url: string;
    meeting_date: string;
    meeting_type: string;
  }
  isEditMode: boolean
  onUpdate: (id: string, name: string, pdfUrl: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function EditableAta({ ata, isEditMode, onUpdate, onDelete }: EditableAtaProps) {
  const [editedName, setEditedName] = useState(ata.name)
  const [editedPdfUrl, setEditedPdfUrl] = useState(ata.pdf_url)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formattedDate = new Date(ata.meeting_date + 'T00:00:00').toLocaleDateString('pt-BR')

  const handleUpdate = async () => {
    if (editedName === ata.name && editedPdfUrl === ata.pdf_url) {
      setShowEditDialog(false)
      return
    }
    setIsLoading(true)
    try {
      await onUpdate(ata.id, editedName, editedPdfUrl)
      setShowEditDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(ata.id)
      setShowDeleteConfirm(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditMode) {
    return (
      <a href={ata.pdf_url} download className={styles.card}>
        <div className={styles.ataCard}>
          <h2 style={{ fontSize: '16px', margin: 0 }}>{ata.name}</h2>
          <p className={styles.ataSubtitle}>{ata.meeting_type} — {formattedDate}</p>
        </div>
      </a>
    )
  }

  return (
    <>
      <div className={styles.card}>
        <div className={`${styles.ataCard} border-2 border-dashed border-primary`}>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-sm font-semibold">{ata.name}</h2>
            <p className="text-xs opacity-70">{ata.meeting_type} — {formattedDate}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowEditDialog(true)} disabled={isLoading}>
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => window.open(ata.pdf_url, '_blank')} disabled={isLoading}>
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="destructive" className="h-8 w-8 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading}>
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ata</DialogTitle>
            <DialogDescription>Altere os dados da ata abaixo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Ata:</label>
              <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Digite o nome da ata" />
            </div>
            <div>
              <label className="text-sm font-medium">Link do PDF:</label>
              <Input value={editedPdfUrl} onChange={(e) => setEditedPdfUrl(e.target.value)} placeholder="Digite o link do PDF" type="url" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isLoading || !editedName || !editedPdfUrl}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza de que quer apagar esta ata?<br /><strong>{ata.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>NÃO</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>{isLoading ? 'Excluindo...' : 'SIM'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
