import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Star, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import logocpgg from '@/assets/cpgg-logo.jpg'
import styles from './pesquisadores.module.css'
import { getOrderedResearchersData } from '@/data/researchers'

interface Researcher {
  id: string
  name: string
  email: string
  program: string
  is_chief: boolean
  description: string | null
  lattes_link: string | null
}

interface AdminUser {
  id: string
  email: string
  role: string
}

const programMapping = {
  'oil': 'Exploração de Petróleo',
  'environment': 'Recursos Hídricos e Ambientais',
  'mineral': 'Petrologia, Metalogênese e Exp. Mineral',
  'oceanography': 'Oceanografia Física',
  'coast': 'Geologia Marinha e Costeira'
}

export function PesquisadoresAdmin() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [researchers, setResearchers] = useState<Researcher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [researcherToDelete, setResearcherToDelete] = useState<Researcher | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editProgram, setEditProgram] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const userData = sessionStorage.getItem('admin_user')
    if (userData) {
      setAdminUser(JSON.parse(userData))
      loadResearchers()
    } else {
      navigate('/adm/coordenacao')
    }
  }, [navigate])

  const loadResearchers = async () => {
    try {
      const { data, error } = await supabase
        .from('researchers')
        .select('*')
        .order('program')
        .order('name')

      if (error) throw error

      setResearchers(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar pesquisadores:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pesquisadores.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMigrateAll = async () => {
    setIsMigrating(true)
    
    try {
      const { oil, environment, mineral, oceanography, coast } = getOrderedResearchersData()
      const allStaticResearchers = [
        ...oil.map(r => ({ ...r, program: 'oil' })),
        ...environment.map(r => ({ ...r, program: 'environment' })),
        ...mineral.map(r => ({ ...r, program: 'mineral' })),
        ...oceanography.map(r => ({ ...r, program: 'oceanography' })),
        ...coast.map(r => ({ ...r, program: 'coast' }))
      ]

      let successCount = 0
      let skipCount = 0
      
      for (const researcher of allStaticResearchers) {
        // Verifica se já existe no banco
        const { data: existing } = await supabase
          .from('researchers')
          .select('id')
          .eq('name', researcher.name)
          .eq('program', researcher.program)
          .maybeSingle()

        if (existing) {
          skipCount++
          continue
        }

        // Insere no banco
        const { error } = await supabase
          .from('researchers')
          .insert({
            name: researcher.name,
            email: `${researcher.name.toLowerCase().replace(/\s+/g, '.')}@ufba.br`,
            program: researcher.program,
            is_chief: researcher.chief || false,
            description: `Pesquisador do programa de ${programMapping[researcher.program as keyof typeof programMapping]}`
          })

        if (error) {
          console.error(`Erro ao migrar ${researcher.name}:`, error)
        } else {
          successCount++
        }
      }

      await loadResearchers()
      
      toast({ 
        title: 'Migração concluída', 
        description: `${successCount} pesquisadores migrados, ${skipCount} já existiam no banco.` 
      })
    } catch (error: any) {
      toast({ 
        title: 'Erro na migração', 
        description: error.message, 
        variant: 'destructive' 
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleSetChief = async (researcherId: string, program: string) => {
    try {
      const current = researchers.find((r: any) => r.id === researcherId)
      const isCurrentlyChief = !!current?.is_chief

      if (isCurrentlyChief) {
        const { error } = await supabase
          .from('researchers')
          .update({ is_chief: false })
          .eq('id', researcherId)
        if (error) throw error
        await loadResearchers()
        toast({
          title: 'Atualizado',
          description: 'Programa agora está sem coordenador.'
        })
      } else {
        const { error } = await supabase.rpc('set_researcher_as_chief', {
          _researcher_id: researcherId,
          _program: program
        })
        if (error) throw error
        await loadResearchers()
        toast({
          title: 'Atualizado',
          description: 'Coordenador do programa definido com sucesso.'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao definir coordenador',
        description: error.message,
        variant: 'destructive'
      })
    }
  }


  const handleEdit = (researcher: Researcher) => {
    setEditingId(researcher.id)
    setEditName(researcher.name)
    setEditProgram(researcher.program)
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('researchers')
        .update({
          name: editName,
          program: editProgram
        })
        .eq('id', id)

      if (error) throw error

      await loadResearchers()
      setEditingId(null)
      toast({ 
        title: 'Atualizado', 
        description: 'Pesquisador atualizado com sucesso.' 
      })
    } catch (error: any) {
      toast({ 
        title: 'Erro ao atualizar', 
        description: error.message, 
        variant: 'destructive' 
      })
    }
  }

  const handleDelete = async () => {
    if (!researcherToDelete) return

    try {
      const { error } = await supabase
        .from('researchers')
        .delete()
        .eq('id', researcherToDelete.id)

      if (error) throw error

      await loadResearchers()
      toast({ 
        title: 'Excluído', 
        description: 'Pesquisador removido com sucesso.' 
      })
      setDeleteDialogOpen(false)
      setResearcherToDelete(null)
    } catch (error: any) {
      toast({ 
        title: 'Erro ao excluir', 
        description: error.message, 
        variant: 'destructive' 
      })
    }
  }

  if (!adminUser) {
    return <div>Carregando...</div>
  }

  const groupedResearchers = researchers.reduce((acc, r) => {
    if (!acc[r.program]) acc[r.program] = []
    acc[r.program].push(r)
    return acc
  }, {} as Record<string, Researcher[]>)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        <Button
          onClick={() => navigate('/adm/coordenacao/dashboard')}
          variant="outline"
          className={styles.backButton}
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Button>
      </div>

      <h1 className={styles.title}>Gerenciar Pesquisadores</h1>


      {isLoading ? (
        <div className={styles.loading}>Carregando pesquisadores...</div>
      ) : (
        <div className={styles.programsContainer}>
          {Object.entries(programMapping).map(([programKey, programName]) => {
            const programResearchers = groupedResearchers[programKey] || []
            
            return (
              <div key={programKey} className={styles.programCard}>
                <h2 className={styles.programTitle}>{programName}</h2>
                
                {programResearchers.length === 0 ? (
                  <p className={styles.emptyMessage}>Nenhum pesquisador cadastrado</p>
                ) : (
                  <div className={styles.researchersList}>
                    {programResearchers.map((researcher) => (
                      <div key={researcher.id} className={styles.researcherItem}>
                        {editingId === researcher.id ? (
                          <div className={styles.editForm}>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Nome"
                              className={styles.editInput}
                            />
                            <Select value={editProgram} onValueChange={setEditProgram}>
                              <SelectTrigger className={styles.editSelect}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(programMapping).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className={styles.editActions}>
                              <Button size="sm" onClick={() => handleSaveEdit(researcher.id)}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.researcherInfo}>
                              <div className={styles.researcherName}>
                                {researcher.is_chief && (
                                  <Star className={styles.chiefIcon} size={16} />
                                )}
                                <strong>{researcher.name}</strong>
                                {researcher.is_chief && <span className={styles.chiefBadge}>(Coordenador)</span>}
                              </div>
                            </div>
                            <div className={styles.researcherActions}>
                              <Button
                                size="sm"
                                variant={researcher.is_chief ? "default" : "outline"}
                                onClick={() => handleSetChief(researcher.id, researcher.program)}
                                title="Definir como coordenador"
                                className={researcher.is_chief ? styles.chiefButton : ''}
                              >
                                <Star size={16} className={researcher.is_chief ? styles.starFilled : ''} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(researcher)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setResearcherToDelete(researcher)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-h-[200px] py-4">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza de que deseja excluir o pesquisador{' '}
              <strong>{researcherToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setResearcherToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
