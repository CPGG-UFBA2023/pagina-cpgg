import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { ResearcherProfilePage } from '../../../components/ResearcherProfilePage'
const styles: Record<string, string> = {}


interface Researcher {
  id: string
  name: string
  program: string
  email: string
  description: string
  lattes_link: string
}

export function DynamicResearcher() {
  const { id } = useParams<{ id: string }>()
  const [researcher, setResearcher] = useState<Researcher | null>(null)
  const [loading, setLoading] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (id) {
      fetchResearcher(id)
    }
  }, [id])

  useEffect(() => {
    checkEditPermission()
  }, [researcher])

  const checkEditPermission = async () => {
    if (!researcher) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setCanEdit(false)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile && profile.full_name.toLowerCase() === researcher.name.toLowerCase()) {
        setCanEdit(true)
      } else {
        setCanEdit(false)
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      setCanEdit(false)
    }
  }

  const fetchResearcher = async (researcherId: string) => {
    try {
      const { data, error } = await supabase
        .from('researchers')
        .select('*')
        .eq('id', researcherId)
        .single()

      if (error) throw error

      setResearcher(data)
      await loadUserProfileData(data.name)
    } catch (error) {
      console.error('Erro ao buscar pesquisador:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfileData = async (researcherName: string) => {
    try {
      const { data: rows } = await supabase
        .from('user_profiles')
        .select('email, photo_url, user_id, full_name')
        .ilike('full_name', researcherName.trim())
        .limit(1)
      const userProfile = rows?.[0]
      const isRealEmail = (e?: string | null) =>
        !!e && !/provisorio|temporario|aguardando|a_definir|a-definir/i.test(e)

      if (isRealEmail(userProfile?.email)) {
        setUserEmail(userProfile!.email)
      }

      if (userProfile?.photo_url) {
        setUserPhotoUrl(userProfile.photo_url)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error)
    }
  }

  const handleRefreshProfile = async () => {
    if (researcher) {
      await loadUserProfileData(researcher.name)
      setRefreshKey(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.researcher}>
          <div className={styles.loading}>Carregando...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (!researcher) {
    return (
      <>
        <Header />
        <div className={styles.researcher}>
          <div className={styles.notFound}>Pesquisador não encontrado</div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <ResearcherProfilePage
      key={refreshKey}
      name={researcher.name}
      description={researcher.description || ''}
      email={userEmail || researcher.email}
      lattes={researcher.lattes_link}
      staticPhotoUrl={userPhotoUrl || undefined}
    />
  )
}
