import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Labs.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { EditButton } from '../Researchers/components/EditButton';
import { EditableLaboratory } from '../../components/EditableLaboratory';
import { AdminLoginLabs } from '../../components/AdminLoginLabs';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import earth from '../../assets/earth-labs.png'
import { useLanguage } from '@/contexts/LanguageContext'

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

type LastAction =
  | { type: 'delete'; lab: Laboratory }
  | { type: 'update'; previous: Laboratory; current: Laboratory }

export  function Labs() {
  const { t } = useLanguage()
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [lastAction, setLastAction] = useState<LastAction | null>(null)
  const { toast } = useToast()
  useEffect(() => {
    fetchLaboratories()
  }, [])

  const fetchLaboratories = async () => {
    try {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      console.log('Fetched laboratories:', data?.length || 0)
      setLaboratories(data || [])
    } catch (error) {
      console.error('Erro ao buscar laboratórios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLaboratory = (updatedLab: Laboratory, previousLab: Laboratory) => {
    setLaboratories(prev => 
      prev.map(lab => lab.id === updatedLab.id ? updatedLab : lab)
    )
    setLastAction({ type: 'update', previous: previousLab, current: updatedLab })
  }

  const handleDeleteLaboratory = (lab: Laboratory) => {
    setLaboratories(prev => prev.filter(l => l.id !== lab.id))
    setLastAction({ type: 'delete', lab })
  }

  const handleLogin = () => {
    setShowAdminLogin(true)
  }

  const handleAdminLogin = (email: string, password: string) => {
    console.log('Login successful, setting isEditing to true')
    setIsEditing(true)
    setShowAdminLogin(false)
  }

  const handleLogout = () => {
    setIsEditing(false)
  }
  const handleUndo = async () => {
    if (!lastAction) return
    try {
      setIsLoading(true)
      if (lastAction.type === 'delete') {
        const { error } = await supabase.from('laboratories').insert(lastAction.lab)
        if (error) throw error
        setLaboratories(prev => [...prev, lastAction.lab])
        toast({ title: 'Desfeito', description: 'Laboratório restaurado.' })
      } else if (lastAction.type === 'update') {
        const { error } = await supabase
          .from('laboratories')
          .update({
            name: lastAction.previous.name,
            acronym: lastAction.previous.acronym,
            chief_name: lastAction.previous.chief_name,
            description: lastAction.previous.description,
            pnipe_address: lastAction.previous.pnipe_address,
          })
          .eq('id', lastAction.previous.id)
        if (error) throw error
        setLaboratories(prev => prev.map(l => l.id === lastAction.previous.id ? lastAction.previous : l))
        toast({ title: 'Desfeito', description: 'Edição revertida.' })
      }
      setLastAction(null)
    } catch (e: any) {
      console.error('Erro ao desfazer:', e)
      toast({ title: 'Erro', description: e.message || 'Não foi possível desfazer', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }
  return (
      <>
      <Header/>
          <div className={`${styles.labs} labs`}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>{t('labs.title')}</h1>
              <EditButton 
                onClick={handleLogin}
                isEditMode={isEditing}
                onLogout={handleLogout}
              />
            </div>

              <div className={styles.container}>
                   {/* Laboratórios dinâmicos do banco de dados */}
                   {laboratories.map((lab, index) => {
                     console.log('Rendering lab:', lab.name, 'isEditing:', isEditing)
                     const isLaiga = lab.acronym === 'LAIGA'
                     return (
                     <div key={lab.id} className={`${styles.card} ${isEditing ? styles.dynamicLab : ''} ${isEditing ? styles.dynamicLabEditing : ''} ${isLaiga ? styles.laigaCard : ''}`}>
                       {isEditing ? (
                         <EditableLaboratory
                           laboratory={lab}
                           isEditing={isEditing}
                           onUpdate={handleUpdateLaboratory}
                           onDelete={handleDeleteLaboratory}
                         />
                        ) : (
                          <Link to={`/labs/${lab.acronym.toLowerCase()}`} className={styles.labLink}>
                            <div className={isLaiga ? styles.Laiga : styles.others}>
                              <h2>{lab.acronym}</h2>
                              <h2>{lab.name}</h2>
                            </div>
                          </Link>
                        )}
                     </div>
                   )})}

                  {isEditing && laboratories.length === 0 && (
                    <div className="col-span-2 text-sm opacity-80">
                      Nenhum laboratório cadastrado ainda. Use a página da Coordenação para cadastrar.
                    </div>
                  )}
              </div>
              
              {/* Imagem da Terra movida para fora do container para evitar sobreposição */}
          </div>

          <AdminLoginLabs
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
          />
          <div className="fixed bottom-4 left-4 z-50">
            {lastAction && (
              <Button variant="secondary" onClick={handleUndo}>
                Desfazer
              </Button>
            )}
          </div>
          <Footer/>
      </>
  )
}