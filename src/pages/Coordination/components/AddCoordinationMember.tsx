import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Save } from 'lucide-react'

interface AddCoordinationMemberProps {
  withTitle?: boolean
  onAdd: (name: string, title?: string) => void
}

export function AddCoordinationMember({ withTitle = false, onAdd }: AddCoordinationMemberProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')

  const reset = () => {
    setName('')
    setTitle('')
    setOpen(false)
  }

  const handleSave = () => {
    if (!name.trim()) return
    onAdd(name, withTitle ? title : undefined)
    reset()
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="mt-2 w-full"
      >
        <Plus className="h-3 w-3 mr-1" />
        Adicionar membro
      </Button>
    )
  }

  return (
    <div className="coordination-member editing space-y-2 p-3 border border-border rounded-lg bg-card mt-2">
      {withTitle && (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título/Cargo (opcional)"
          className="font-bold"
        />
      )}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do membro"
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} className="flex-1">
          <Save className="h-3 w-3 mr-1" />
          Adicionar
        </Button>
        <Button size="sm" variant="outline" onClick={reset} className="flex-1">
          <X className="h-3 w-3 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
