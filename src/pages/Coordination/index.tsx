import { useState, useEffect } from 'react'
import styles from './Coordination.module.css'
import { Header } from '../../components/Header'
import { EditButtonCoordination } from './components/EditButtonCoordination'
import { AdminLoginCoordination } from './components/AdminLoginCoordination'
import { EditableCoordinationMember } from './components/EditableCoordinationMember'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface CoordinationMember {
  name: string
  title?: string
  section: 'coordination' | 'scientific' | 'deliberative'
}

export function Coordination() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [members, setMembers] = useState<CoordinationMember[]>([
    // Coordenação
    { name: 'Marcos Alberto Rodrigues Vasconcelos', title: 'Coordenador', section: 'coordination' },
    { name: 'Simone Cerqueira Pereira Cruz', title: 'Coordenadora Adjunta', section: 'coordination' },
    
    // Conselho Científico
    { name: 'Camila Brasil da Silveira', section: 'scientific' },
    { name: 'Edson Starteri Sampaio', section: 'scientific' },
    { name: 'José Maria Landin Dominguez', section: 'scientific' },
    { name: 'Luiz César Gomes Corrêa (rep. dos pesquisadores)', section: 'scientific' },
    { name: 'Marcos Alberto Rodrigues Vasconcelos', section: 'scientific' },
    { name: 'Milton José Porsani', section: 'scientific' },
    { name: 'Simone Cerqueira Pereira Cruz', section: 'scientific' },
    { name: 'Reynam da Cruz Pestana (rep. pesquisadores sêniores)', section: 'scientific' },
    
    // Conselho Deliberativo
    { name: 'Cristóvão de Cássio da Trindade de Brito (presidente)', section: 'deliberative' },
    { name: 'Frederico Vasconcelos Prudente', section: 'deliberative' },
    { name: 'Luiz Rogério Bastos Leal (rep. dos pesquisadores)', section: 'deliberative' },
    { name: 'Marcos Alberto Rodrigues Vasconcelos', section: 'deliberative' },
    { name: 'Simone Cerqueira Pereira Cruz', section: 'deliberative' },
    { name: 'Onofre H. D. J. das Flores (rep. estudantil)', section: 'deliberative' },
    { name: 'Leonardo Moreira Batista (suplente estudantil)', section: 'deliberative' },
  ])
  const [lastAction, setLastAction] = useState<{
    type: 'delete' | 'update'
    data: CoordinationMember
    timestamp: number
  } | null>(null)
  const [showUndo, setShowUndo] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    // Carrega dados do localStorage
    const savedMembers = localStorage.getItem('coordinationMembers')
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
    }
  }, [])

  const saveToStorage = (newMembers: CoordinationMember[]) => {
    localStorage.setItem('coordinationMembers', JSON.stringify(newMembers))
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      // Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast({ 
          title: 'Acesso negado', 
          description: 'Email ou senha incorretos.', 
          variant: 'destructive' 
        })
        return
      }

      // Verificar se é coordenação ou secretaria
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', authData.user.id)
        .in('role', ['coordenacao', 'secretaria'])
        .maybeSingle()

      if (error) throw error

      if (data) {
        setIsEditMode(true)
        setShowLogin(false)
        toast({ title: 'Login realizado', description: 'Modo de edição ativado.' })
      } else {
        await supabase.auth.signOut()
        toast({ 
          title: 'Acesso negado', 
          description: 'Apenas coordenação e secretaria podem editar.', 
          variant: 'destructive' 
        })
      }
    } catch (err: any) {
      toast({ title: 'Erro ao validar acesso', description: err.message ?? 'Tente novamente.', variant: 'destructive' })
    }
  }

  const handleLogout = () => {
    setIsEditMode(false)
    setLastAction(null)
    setShowUndo(false)
    toast({ title: 'Logout realizado', description: 'Modo de edição desativado.' })
  }

  const showUndoButton = (action: typeof lastAction) => {
    setLastAction(action)
    setShowUndo(true)
    // Auto-hide após 10 segundos
    setTimeout(() => setShowUndo(false), 10000)
  }

  const handleUndo = () => {
    if (!lastAction) return

    if (lastAction.type === 'delete') {
      // Restaura membro excluído
      const newMembers = [...members, lastAction.data]
      setMembers(newMembers)
      saveToStorage(newMembers)
      toast({ title: 'Desfeito', description: 'Membro restaurado com sucesso.' })
    } else if (lastAction.type === 'update') {
      // Restaura nome anterior (implementar se necessário)
      toast({ title: 'Desfazer', description: 'Funcionalidade de desfazer edição em desenvolvimento.' })
    }

    setLastAction(null)
    setShowUndo(false)
  }

  const handleUpdateMember = (oldName: string, newName: string, newTitle?: string) => {
    const newMembers = members.map(member => 
      member.name === oldName 
        ? { ...member, name: newName, title: newTitle || member.title }
        : member
    )
    setMembers(newMembers)
    saveToStorage(newMembers)
    toast({ title: 'Atualizado', description: 'Nome atualizado com sucesso.' })
  }

  const handleDeleteMember = (name: string) => {
    const memberToDelete = members.find(m => m.name === name)
    if (!memberToDelete) return

    const newMembers = members.filter(member => member.name !== name)
    setMembers(newMembers)
    saveToStorage(newMembers)

    // Salva ação para desfazer
    showUndoButton({
      type: 'delete',
      data: memberToDelete,
      timestamp: Date.now()
    })

    toast({ title: 'Excluído', description: 'Membro removido com sucesso.' })
  }

  const getMembersBySection = (section: CoordinationMember['section']) => {
    return members.filter(member => member.section === section)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
      <Header />
      <div className={`${styles.heads} coordination ${isEditMode ? styles.editMode : ''} hide-earth`} style={{ flex: 1, paddingBottom: '4rem' }}>
        <div className={styles.box1}>
          <div className={styles.coordination}>
            <ul>Coordenação</ul>
            <div className={styles.chief}>
              {getMembersBySection('coordination').map((member, index) => (
                <EditableCoordinationMember
                  key={`coordination-${index}`}
                  name={member.name}
                  title={member.title}
                  onUpdate={handleUpdateMember}
                  onDelete={handleDeleteMember}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          </div>
          
          <div className={styles.box2}>
            <h1>Conselho Científico</h1>
            <div className={styles.scientific}>
              {getMembersBySection('scientific').map((member, index) => (
                <EditableCoordinationMember
                  key={`scientific-${index}`}
                  name={member.name}
                  onUpdate={handleUpdateMember}
                  onDelete={handleDeleteMember}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          </div>
          
          <div className={styles.box3}>
            <h1>Conselho Deliberativo</h1>
            <div className={styles.deliberative}>
              {getMembersBySection('deliberative').map((member, index) => (
                <EditableCoordinationMember
                  key={`deliberative-${index}`}
                  name={member.name}
                  onUpdate={handleUpdateMember}
                  onDelete={handleDeleteMember}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditButtonCoordination 
        onClick={() => setShowLogin(true)}
        isEditMode={isEditMode}
        onLogout={handleLogout}
      />

      {/* Botão de Desfazer */}
      {isEditMode && showUndo && lastAction && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-card text-card-foreground border border-border rounded-lg p-3 shadow-lg flex items-center gap-3">
            <span className="text-sm">
              {lastAction.type === 'delete' ? 'Membro excluído' : 'Nome alterado'}
            </span>
            <button
              onClick={handleUndo}
              className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
            >
              Desfazer
            </button>
            <button
              onClick={() => setShowUndo(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <AdminLoginCoordination
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />
    </div>
  )
}
