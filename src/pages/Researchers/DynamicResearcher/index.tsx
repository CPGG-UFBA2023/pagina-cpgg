import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { DynamicResearcherProfile } from '../../../components/DynamicResearcherProfile'
import { ResearcherEditButton } from '../../../components/ResearcherEditButton'
import { ResearcherPhoto } from '../../../components/ResearcherPhoto'
import { BackButton } from '../../../components/BackButton'
import { getResearcherPhoto } from '../../../data/researcher-photos'
import styles from '../Personal_pages/Landim/Landim.module.css'

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
      const firstName = researcherName.split(' ')[0].toLowerCase()
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email, photo_url, user_id')
        .ilike('first_name', firstName)
        .maybeSingle()

      // Se o perfil tem user_id, tentar buscar email do usuário autenticado
      if (userProfile?.user_id) {
        const { data: { user } } = await supabase.auth.getUser()
        
        // Se o usuário logado é o dono do perfil, usar seu email
        if (user?.id === userProfile.user_id && user?.email) {
          setUserEmail(user.email)
        } else {
          // Caso contrário, usar o email do perfil
          setUserEmail(userProfile.email || 'Email não disponível')
        }
      } else if (userProfile?.email) {
        setUserEmail(userProfile.email)
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
      // Força o DynamicResearcherProfile a recarregar
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

  const photoUrl = userPhotoUrl || getResearcherPhoto(researcher.name)

  return (
    <div className={styles.Container}>
      <Header />
      <main className={styles.Professor}>
        <BackButton />
        <div className={styles.box1}>
          <h1 className={styles.researcherName}>{researcher.name}</h1>
          <DynamicResearcherProfile 
            key={refreshKey}
            researcherName={researcher.name}
            staticDescription={researcher.description}
            staticPhotoUrl={photoUrl}
          />
          <div 
            className={styles.box2}
            style={{
              background: photoUrl 
                ? `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url('${photoUrl}') center/cover`
                : '#f5f5f5',
              minHeight: '180px',
              border: photoUrl ? '2px solid rgba(255,255,255,.2)' : '2px dashed #999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!photoUrl && (
              <span style={{ 
                color: '#666', 
                fontSize: '12px', 
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                Sem foto
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '20px' }}>
            <ResearcherEditButton 
              researcherName={researcher.name} 
              inline 
              onSave={handleRefreshProfile}
            />
          </div>
          {researcher.lattes_link && (
            <>
              <ul>Link para Currículo Lattes</ul>
              <nav>
                <a href={researcher.lattes_link} target="_blank" rel="noopener noreferrer">
                  Currículo
                </a>
              </nav>
            </>
          )}
          <b>e-mail</b>
          <p>{userEmail || researcher.email}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}