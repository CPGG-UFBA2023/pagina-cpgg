import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen } from 'lucide-react'
import { Header } from '../../components/Header/'
import { Footer } from '../../components/Footer/'
import { AdminLoginProduction } from './components/AdminLoginProduction'
import { EditButtonProduction } from './components/EditButtonProduction'
import { ScientificPublicationEditor } from './components/ScientificPublicationEditor'
import { useToast } from '@/hooks/use-toast'
import styles from './Production.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface ScientificPublication {
  id: string
  authors: string
  year: string
  journal_name: string
  article_title: string
  pages: string
  volume: string
  created_at: string
}

export function Production() {
  const { t } = useLanguage()
  const [publications, setPublications] = useState<ScientificPublication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPublications()
    const savedAuth = localStorage.getItem('scientificPublicationsAuth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from('scientific_publications')
        .select('*')
        .order('year', { ascending: false })

      if (error) throw error

      setPublications(data || [])
    } catch (error) {
      console.error('Erro ao buscar publicações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true)
    try {
      // Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast({
          title: "Erro de autenticação",
          description: "Email ou senha incorretos.",
          variant: "destructive"
        })
        return
      }

      // Verificar se é coordenação ou secretaria
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .in('role', ['secretaria', 'coordenacao'])
        .single()

      if (error || !data) {
        await supabase.auth.signOut()
        toast({
          title: "Erro de autenticação",
          description: "Você não tem permissão para editar.",
          variant: "destructive"
        })
        return
      }

      setIsAuthenticated(true)
      setShowLoginDialog(false)
      localStorage.setItem('scientificPublicationsAuth', 'true')
      toast({
        title: "Login realizado com sucesso",
        description: "Agora você pode gerenciar as publicações científicas."
      })
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro",
        description: "Erro interno do servidor.",
        variant: "destructive"
      })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('scientificPublicationsAuth')
    toast({
      title: "Logout realizado",
      description: "Você saiu do modo de edição."
    })
  }

  if (isLoading) {
    return <div className={styles.loading}>{t('news.loading')}</div>
  }

  return (
    <div className={styles.Container}>
      <Header />
      <div className={`${styles.container} scientific-publications-page production`}>
        <div className={styles.header}>
          <BookOpen size={32} color="white" />
          <h1>{t('production.heading')}</h1>
          <p>{t('production.subtitle')}</p>
        </div>

        {isAuthenticated ? (
          <ScientificPublicationEditor 
            publications={publications} 
            onPublicationsUpdate={fetchPublications}
          />
        ) : (
          <>
            {publications.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={48} />
                <p>{t('production.empty')}</p>
              </div>
            ) : (
              <ScrollArea className={styles.scrollArea}>
                <div className={styles.publicationsGrid}>
                  {publications.map((publication) => (
                    <Card key={publication.id} className={styles.publicationCard}>
                      <CardContent className="pt-6">
                        <p className={styles.publicationText}>
                          {publication.authors} ({publication.year}) - {publication.article_title}. {publication.journal_name}, {t('production.volume')} {publication.volume}, {t('production.page')} {publication.pages}.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}

        <EditButtonProduction
          onClick={() => setShowLoginDialog(true)}
          isEditMode={isAuthenticated}
          onLogout={handleLogout}
        />

        <AdminLoginProduction
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLogin={handleLogin}
          isLoading={loginLoading}
        />
      </div>
      <Footer />
    </div>
  )
}