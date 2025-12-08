import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ResearcherProfileProvider } from './ResearcherProfileContext'

interface DynamicResearcherProfileProps {
  researcherName: string
  staticDescription: string
  staticPhotoUrl?: string
  belowPhoto?: React.ReactNode
}

export function DynamicResearcherProfile({ 
  researcherName, 
  staticDescription,
  staticPhotoUrl,
  belowPhoto
}: DynamicResearcherProfileProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [researcherName])

  const fetchUserProfile = async () => {
    try {
      const firstName = researcherName.split(' ')[0].toLowerCase()
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('first_name', firstName)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Usa dados do usuário se disponível, senão usa dados estáticos
  const description = userProfile?.description || staticDescription
  const photoUrl = userProfile?.photo_url || staticPhotoUrl

  // Debug log
  console.log('DynamicResearcherProfile:', {
    researcherName,
    hasUserProfile: !!userProfile,
    hasUserDescription: !!userProfile?.description,
    hasStaticDescription: !!staticDescription,
    descriptionLength: description?.length || 0
  })

  if (isLoading) {
    return <p>Carregando perfil...</p>
  }

  return (
    <ResearcherProfileProvider value={{ staticDescription, photoUrl, belowPhoto }}>
      {description ? (
        <p className="researcher-description" style={{ 
          fontSize: '12pt', 
          textAlign: 'justify',
          marginBottom: '20px',
          lineHeight: '1.6',
          color: '#fff'
        }}>
          {description}
        </p>
      ) : (
        <p className="researcher-description" style={{ 
          fontSize: '12pt', 
          fontStyle: 'italic',
          color: '#fff',
          marginBottom: '20px'
        }}>
          Descrição não disponível
        </p>
      )}
    </ResearcherProfileProvider>
  )
}
