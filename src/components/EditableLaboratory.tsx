import { useState } from 'react'
import { Trash2, Edit, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Laboratory {
  id: string
  name: string
  acronym: string
  chief_name: string
  description?: string
  pnipe_address?: string
  photo1_url?: string
  photo2_url?: string
  photo3_url?: string
}

interface EditableLaboratoryProps {
  laboratory: Laboratory
  isEditing: boolean
  onUpdate: (updated: Laboratory, previous: Laboratory) => void
  onDelete: (lab: Laboratory) => void
}

export function EditableLaboratory({ laboratory, isEditing, onUpdate, onDelete }: EditableLaboratoryProps) {
  const [editData, setEditData] = useState({
    name: laboratory.name,
    acronym: laboratory.acronym,
    chief_name: laboratory.chief_name,
    description: laboratory.description || '',
    pnipe_address: laboratory.pnipe_address || ''
  })
  const [isEditingThis, setIsEditingThis] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!editData.name || !editData.acronym || !editData.chief_name) {
      toast({
        title: "Erro",
        description: "Nome, sigla e coordenador são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('laboratories')
        .update(editData)
        .eq('id', laboratory.id)

      if (error) throw error

      onUpdate({ ...laboratory, ...editData }, { ...laboratory })
      setIsEditingThis(false)
      toast({
        title: "Sucesso",
        description: "Laboratório atualizado com sucesso!",
      })
    } catch (error: any) {
      console.error('Erro ao atualizar laboratório:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar laboratório",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o laboratório ${laboratory.name}?`)) {
      setIsLoading(true)
      try {

        const { error } = await supabase
          .from('laboratories')
          .delete()
          .eq('id', laboratory.id)

        if (error) throw error

        onDelete(laboratory)
        toast({
          title: "Sucesso",
          description: "Laboratório excluído com sucesso!",
        })
      } catch (error: any) {
        console.error('Erro ao excluir laboratório:', error)
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir laboratório",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditData({
      name: laboratory.name,
      acronym: laboratory.acronym,
      chief_name: laboratory.chief_name,
      description: laboratory.description || '',
      pnipe_address: laboratory.pnipe_address || ''
    })
    setIsEditingThis(false)
  }

  if (!isEditing) {
    return (
      <div className="laboratory-card">
        <h3>{laboratory.acronym}</h3>
        <p>{laboratory.name}</p>
      </div>
    )
  }

  return (
    <div className="laboratory-card-editable p-4 border rounded-lg bg-white shadow-sm">
      {!isEditingThis ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{laboratory.acronym}</h3>
            <p className="text-sm text-gray-600">{laboratory.name}</p>
            <p className="text-xs text-gray-500">Coordenador: {laboratory.chief_name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingThis(true)}
              disabled={isLoading}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nome:</label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do laboratório"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sigla:</label>
            <Input
              value={editData.acronym}
              onChange={(e) => setEditData(prev => ({ ...prev, acronym: e.target.value }))}
              placeholder="Sigla"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Coordenador:</label>
            <Input
              value={editData.chief_name}
              onChange={(e) => setEditData(prev => ({ ...prev, chief_name: e.target.value }))}
              placeholder="Nome do coordenador"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição:</label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do laboratório"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço PNIPE:</label>
            <Input
              value={editData.pnipe_address}
              onChange={(e) => setEditData(prev => ({ ...prev, pnipe_address: e.target.value }))}
              placeholder="Endereço PNIPE"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
            >
              <Check size={16} />
              Salvar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X size={16} />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}