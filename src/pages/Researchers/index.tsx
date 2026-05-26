import styles from './Researchers.module.css'
import './researchers-scroll-fix.css'
import { Header } from '../../components/Header'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { EditButton } from './components/EditButton'
import { AdminLogin } from './components/AdminLogin'
import { EditableResearcher } from './components/EditableResearcher'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export function Researchers() {
  const { t } = useLanguage()
  const [dbResearchers, setDbResearchers] = useState<any[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [adminCreds, setAdminCreds] = useState<{ email: string; password: string } | null>(null)
  const [lastAction, setLastAction] = useState<{
    type: 'delete' | 'update'
    data: any
    timestamp: number
  } | null>(null)
  const [showUndo, setShowUndo] = useState(false)

  useEffect(() => {
    fetchDbResearchers()
  }, [])

  useEffect(() => {
    // Garantir que o scroll esteja desbloqueado quando em modo de edição
    if (isEditMode) {
      console.log('Modo de edição ativado, desbloqueando scroll...')
      
      // Forçar desbloqueio em múltiplos elementos
      const unlockScroll = () => {
        document.body.style.overflow = ''
        document.body.style.pointerEvents = ''
        document.body.removeAttribute('data-scroll-locked')
        document.documentElement.style.overflow = ''
        document.documentElement.style.pointerEvents = ''
        
        // Remover qualquer atributo de bloqueio de scroll
        const scrollLocked = document.querySelectorAll('[data-scroll-locked]')
        console.log('Elementos com scroll locked:', scrollLocked.length)
        scrollLocked.forEach(el => {
          el.removeAttribute('data-scroll-locked')
          if (el instanceof HTMLElement) {
            el.style.overflow = ''
            el.style.pointerEvents = ''
          }
        })
        
        // Remover spans com position fixed que podem estar bloqueando
        const fixedElements = document.querySelectorAll('[style*="position: fixed"][style*="overflow: hidden"]')
        console.log('Elementos fixed bloqueando:', fixedElements.length)
        fixedElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none'
          }
        })
        
        console.log('Body overflow:', document.body.style.overflow)
        console.log('Body data-scroll-locked:', document.body.getAttribute('data-scroll-locked'))
      }
      
      // Executar múltiplas vezes para garantir
      unlockScroll()
      setTimeout(unlockScroll, 100)
      setTimeout(unlockScroll, 300)
      setTimeout(unlockScroll, 500)
    }
  }, [isEditMode])

  const fetchDbResearchers = async () => {
    try {
      const { data, error } = await supabase
        .from('researchers')
        .select('*')
        .order('name')

      if (error) throw error

      setDbResearchers(data || [])
    } catch (error) {
      console.error('Erro ao buscar pesquisadores:', error)
    }
  }

  const { toast } = useToast()

  const handleLogin = async (email: string, password: string) => {
    console.log('=== HANDLELOGIN CHAMADO ===')
    
    try {
      // Autenticar no Supabase primeiro
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        toast({ 
          title: 'Erro ao fazer login', 
          description: signInError.message, 
          variant: 'destructive' 
        })
        return
      }

      setIsEditMode(true)
      setAdminCreds({ email, password })
      setShowLogin(false)
      
      toast({ title: 'Login realizado', description: 'Modo de edição ativado.' })
      
      // Debug completo
      setTimeout(() => {
        console.log('=== DEBUG DE SCROLL ===')
        console.log('Body overflow:', window.getComputedStyle(document.body).overflow)
        console.log('Body position:', window.getComputedStyle(document.body).position)
        console.log('Body height:', window.getComputedStyle(document.body).height)
        console.log('HTML overflow:', window.getComputedStyle(document.documentElement).overflow)
        console.log('Scroll height:', document.documentElement.scrollHeight)
        console.log('Client height:', document.documentElement.clientHeight)
        console.log('Pode rolar?', document.documentElement.scrollHeight > document.documentElement.clientHeight)
        
        // Verificar todos os elementos no caminho
        let el = document.body
        while (el) {
          const computed = window.getComputedStyle(el)
          if (computed.overflow !== 'visible' || computed.position === 'fixed') {
            console.log('Elemento com overflow/position especial:', el.tagName, {
              overflow: computed.overflow,
              position: computed.position,
              height: computed.height
            })
          }
          el = el.parentElement as HTMLElement
        }
        
        console.log('=== FIM DEBUG ===')
      }, 200)
    } catch (error: any) {
      toast({ 
        title: 'Erro ao fazer login', 
        description: error.message, 
        variant: 'destructive' 
      })
    }
  }

  const handleLogout = async () => {
    // Fazer logout do Supabase também
    await supabase.auth.signOut()
    
    setIsEditMode(false)
    setAdminCreds(null)
    setLastAction(null)
    setShowUndo(false)
  }

  const showUndoButton = (action: typeof lastAction) => {
    setLastAction(action)
    setShowUndo(true)
  }

  const handleUndo = async () => {
    if (!lastAction || !adminCreds) return

    try {
      if (lastAction.type === 'delete') {
        // Restaura pesquisador excluído
        const { error } = await supabase.functions.invoke('admin-researchers', {
          body: {
            action: 'restore',
            data: lastAction.data,
          },
        })

        if (error) throw error

        await fetchDbResearchers()
        toast({ title: 'Desfeito', description: 'Exclusão desfeita com sucesso.' })
      } else if (lastAction.type === 'update') {
        // Restaura nome anterior
        const { error } = await supabase.functions.invoke('admin-researchers', {
          body: {
            action: 'update',
            id: lastAction.data.id,
            name: lastAction.data.oldName,
          },
        })

        if (error) throw error

        await fetchDbResearchers()
        toast({ title: 'Desfeito', description: 'Edição desfeita com sucesso.' })
      }

      setLastAction(null)
      setShowUndo(false)
    } catch (error: any) {
      toast({ title: 'Erro ao desfazer', description: error.message, variant: 'destructive' })
    }
  }

  const handleDeleteResearcher = async (id: string) => {
    if (!adminCreds) {
      toast({ title: 'Acesso negado', description: 'Faça login administrativo.', variant: 'destructive' })
      return
    }

    const researcherToDelete = dbResearchers.find(r => r.id === id)
    setDbResearchers((prev) => prev.filter((r: any) => r.id !== id))

    try {
      const { error } = await supabase.functions.invoke('admin-researchers', {
        body: {
          action: 'delete',
          id,
        },
      })

      if (error) throw error

      showUndoButton({
        type: 'delete',
        data: researcherToDelete,
        timestamp: Date.now()
      })

      toast({ title: 'Excluído', description: 'Pesquisador removido com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
      await fetchDbResearchers()
    }
  }

  const handleSetChief = async (id: string, programKey: string) => {
    if (!adminCreds) {
      toast({ title: 'Acesso negado', description: 'Faça login administrativo.', variant: 'destructive' })
      return
    }

    try {
      const current = dbResearchers.find((r: any) => r.id === id)
      const isCurrentlyChief = !!current?.is_chief

      if (isCurrentlyChief) {
        const { error } = await supabase
          .from('researchers')
          .update({ is_chief: false })
          .eq('id', id)
        if (error) throw error
        await fetchDbResearchers()
        toast({ title: 'Atualizado', description: 'Programa agora está sem coordenador.' })
      } else {
        const { error } = await supabase.rpc('set_researcher_as_chief', {
          _researcher_id: id,
          _program: programKey
        })
        if (error) throw error
        await fetchDbResearchers()
        toast({ title: 'Atualizado', description: 'Coordenador do programa definido com sucesso.' })
      }
    } catch (error: any) {
      toast({ title: 'Erro ao definir coordenador', description: error.message, variant: 'destructive' })
    }
  }


  const handleUpdateResearcher = async (id: string, name: string) => {
    if (!adminCreds) {
      toast({ title: 'Acesso negado', description: 'Faça login administrativo.', variant: 'destructive' })
      return
    }

    const oldName = dbResearchers.find(r => r.id === id)?.name || ''
    setDbResearchers((prev) => prev.map((r: any) => (r.id === id ? { ...r, name } : r)))

    try {
      const { error } = await supabase.functions.invoke('admin-researchers', {
        body: {
          action: 'update',
          id,
          name,
        },
      })

      if (error) throw error

      showUndoButton({
        type: 'update',
        data: { id, oldName, newName: name },
        timestamp: Date.now()
      })

      toast({ title: 'Atualizado', description: 'Nome atualizado com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      await fetchDbResearchers()
    }
  }

  const getResearchersByProgram = (programKey: string) => {
    const programResearchers = dbResearchers
      .filter(r => r.program === programKey)
      .map(r => ({
        name: r.name,
        route: `/researchers/dynamic/${r.id}`,
        chief: r.is_chief || false,
        isChief: r.is_chief || false,
        id: r.id,
        isDatabase: true,
        programKey: programKey
      }))

    // Ordenar alfabeticamente, mantendo chefe primeiro se existir
    const chief = programResearchers.find(r => r.chief)
    const rest = programResearchers
      .filter(r => !r.chief)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
    
    return chief ? [chief, ...rest] : rest
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'visible' }}>
      <Header />
      <div className={`${styles.researchers} researchers hide-earth`} style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
        <div className={styles.Programs}>
          <ul>{t('researchers.title')}</ul>
          <div className={styles.box}>
            <div className={styles.Oil}>
              <h1>{t('researchers.oil')}</h1>
              {getResearchersByProgram('oil').map((r, index) => (
                <EditableResearcher 
                  key={r.route || index}
                  researcher={r}
                  isEditMode={isEditMode}
                  onUpdate={(id, name) => handleUpdateResearcher(id, name)}
                  onDelete={handleDeleteResearcher}
                  onSetChief={handleSetChief}
                  dbResearchers={dbResearchers}
                />
              ))}
            </div>
            
            <div className={styles.Environment}> 
              <h1>{t('researchers.environment')}</h1>
              {getResearchersByProgram('environment').map((r, index) => (
                <EditableResearcher 
                  key={r.route || index}
                  researcher={r}
                  isEditMode={isEditMode}
                  onUpdate={(id, name) => handleUpdateResearcher(id, name)}
                  onDelete={handleDeleteResearcher}
                  onSetChief={handleSetChief}
                  dbResearchers={dbResearchers}
                />
              ))}
            </div>

            <div className={styles.Mineral}>
              <h1>{t('researchers.mineral')}</h1>
              {getResearchersByProgram('mineral').map((r, index) => (
                <EditableResearcher 
                  key={r.route || index}
                  researcher={r}
                  isEditMode={isEditMode}
                  onUpdate={(id, name) => handleUpdateResearcher(id, name)}
                  onDelete={handleDeleteResearcher}
                  onSetChief={handleSetChief}
                  dbResearchers={dbResearchers}
                />
              ))}
            </div>

            <div className={styles.Oceanography}> 
              <h1>{t('researchers.oceanography')}</h1>
              {getResearchersByProgram('oceanography').map((r, index) => (
                <EditableResearcher 
                  key={r.route || index}
                  researcher={r}
                  isEditMode={isEditMode}
                  onUpdate={(id, name) => handleUpdateResearcher(id, name)}
                  onDelete={handleDeleteResearcher}
                  onSetChief={handleSetChief}
                  dbResearchers={dbResearchers}
                />
              ))}
            </div>

            <div className={styles.Coast}> 
              <h1>{t('researchers.coast')}</h1>
              {getResearchersByProgram('coast').map((r, index) => (
                <EditableResearcher 
                  key={r.route || index}
                  researcher={r}
                  isEditMode={isEditMode}
                  onUpdate={(id, name) => handleUpdateResearcher(id, name)}
                  onDelete={handleDeleteResearcher}
                  onSetChief={handleSetChief}
                  dbResearchers={dbResearchers}
                />
              ))}
            </div>
          </div>
        </div>
        
        <EditButton 
          onClick={() => setShowLogin(true)}
          isEditMode={isEditMode}
          onLogout={handleLogout}
        />
        
        {/* Botão de Desfazer */}
        {isEditMode && showUndo && lastAction && (
          <div className="fixed bottom-20 right-4 z-50">
            <div className="bg-card text-card-foreground border border-border rounded-lg p-3 shadow-lg flex items-center gap-3">
              <span className="text-sm">
                {lastAction.type === 'delete' ? 'Pesquisador excluído' : 'Nome alterado'}
              </span>
              <button
                onClick={handleUndo}
                className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors"
              >
                Desfazer
              </button>
              <button
                onClick={() => setShowUndo(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <AdminLogin
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      </div>
    </div>
  )
}
