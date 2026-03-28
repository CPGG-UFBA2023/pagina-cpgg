import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { PhotoDropZone } from '@/components/PhotoDropZone'
import { UserCheck, Settings, Users, FlaskConical, LogOut, Newspaper, FileText, BookOpen, UserMinus, Image, Calendar, FileSpreadsheet, ClipboardList, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import logocpgg from '@/assets/cpgg-logo.jpg'
import styles from './dashboard.module.css'

// Dashboard component for coordination administration

interface AdminUser {
  id: string
  email: string
  role: string
}

export function CoordenacaoDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [secretariaEmail, setSecretariaEmail] = useState('')
  const [secretariaPassword, setSecretariaPassword] = useState('')
  const [tiEmail, setTiEmail] = useState('')
  const [tiName, setTiName] = useState('')
  
  // Estados para atualização de TI
  const [tiUpdateEmail, setTiUpdateEmail] = useState('')
  const [tiUpdateNewEmail, setTiUpdateNewEmail] = useState('')
  const [tiUpdateNewName, setTiUpdateNewName] = useState('')
  
  // Estados para atualização de Secretária
  const [secretariaUpdateEmail, setSecretariaUpdateEmail] = useState('')
  const [secretariaUpdateNewEmail, setSecretariaUpdateNewEmail] = useState('')
  const [secretariaUpdateNewName, setSecretariaUpdateNewName] = useState('')
  const [secretariaUpdateNewPassword, setSecretariaUpdateNewPassword] = useState('')
  
  // Estados para cadastro de pesquisador
  const [researcherName, setResearcherName] = useState('')
  const [researcherProgram, setResearcherProgram] = useState('')
  const [researcherLattes, setResearcherLattes] = useState('')
  const [researcherInstitution, setResearcherInstitution] = useState('UFBA')
  const [researcherDescription, setResearcherDescription] = useState('')
  
  // Estados para laboratórios
  const [labName, setLabName] = useState('')
  const [labAcronym, setLabAcronym] = useState('')
  const [labChief, setLabChief] = useState('')
  const [labChiefEmail, setLabChiefEmail] = useState('')
  const [labDescription, setLabDescription] = useState('')
  const [labPnipe, setLabPnipe] = useState('')
  const [labPhoto1, setLabPhoto1] = useState<File | null>(null)
  const [labPhoto2, setLabPhoto2] = useState<File | null>(null)
  const [labPhoto3, setLabPhoto3] = useState<File | null>(null)
  const [labPhoto1Legend, setLabPhoto1Legend] = useState('')
  const [labPhoto2Legend, setLabPhoto2Legend] = useState('')
  const [labPhoto3Legend, setLabPhoto3Legend] = useState('')
  
  // Estados para notícias
  const [newsTitle, setNewsTitle] = useState('')
  const [newsContent, setNewsContent] = useState('')
  const [newsPhoto1, setNewsPhoto1] = useState<File | null>(null)
  const [newsPhoto2, setNewsPhoto2] = useState<File | null>(null)
  const [newsPhoto3, setNewsPhoto3] = useState<File | null>(null)
  const [newsCoverPhoto, setNewsCoverPhoto] = useState<string>('1')
  const [newsPosition, setNewsPosition] = useState<string>('')

  // Estados para normas/regulamentos
  const [regulationName, setRegulationName] = useState('')
  const [regulationPdfUrl, setRegulationPdfUrl] = useState('')
  
  // Estados para eventos
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventPhotos, setEventPhotos] = useState<File[]>([])
  
  // Estados para atualização de credenciais
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Mapeamento dos programas
  const programMapping = {
    'oil': 'Exploração de Petróleo',
    'environment': 'Recursos Hidricos e Ambientais',
    'mineral': 'Petrologia, Metalogênese e Exp. Mineral',
    'oceanography': 'Oceanografia Física',
    'coast': 'Geologia Marinha e Costeira'
  }

  useEffect(() => {
    const userData = sessionStorage.getItem('admin_user')
    if (userData) {
      setAdminUser(JSON.parse(userData))
    } else {
      navigate('/adm/coordenacao')
    }

    // Sobrescrever background do body
    document.body.style.backgroundImage = 'url("https://i.imgur.com/ZwnmRF6.png")'
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundRepeat = 'no-repeat'

    return () => {
      // Restaurar background original ao sair
      document.body.style.backgroundImage = 'url("https://imgur.com/zBzhTLu")'
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundAttachment = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundRepeat = ''
    }
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_user')
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    navigate('/adm')
  }

  const handleUpdateCredentials = async () => {
    if (!currentEmail || !currentPassword) {
      toast({
        title: "Erro",
        description: "Email atual e senha atual são obrigatórios",
        variant: "destructive",
      })
      return
    }

    if (!newEmail && !newPassword) {
      toast({
        title: "Erro",
        description: "Informe pelo menos um novo valor (email ou senha)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Validar credenciais atuais fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      })

      if (signInError) {
        throw new Error('Email ou senha atual incorretos')
      }

      // Preparar objeto de atualização
      const updates: { email?: string; password?: string } = {}
      if (newEmail && newEmail !== currentEmail) {
        updates.email = newEmail
      }
      if (newPassword) {
        updates.password = newPassword
      }

      // Atualizar credenciais no Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser(updates)

      if (updateError) throw updateError

      // Se o email foi alterado, atualizar também na tabela admin_users
      if (updates.email) {
        const { error: adminUpdateError } = await supabase
          .from('admin_users')
          .update({ email: newEmail })
          .eq('email', currentEmail)

        if (adminUpdateError) {
          console.error('Erro ao atualizar admin_users:', adminUpdateError)
        }
      }

      toast({
        title: "Sucesso!",
        description: "Credenciais atualizadas com sucesso. Você será redirecionado para fazer login novamente.",
      })

      // Limpar campos
      setCurrentEmail('')
      setNewEmail('')
      setCurrentPassword('')
      setNewPassword('')

      // Fazer logout após 2 segundos
      setTimeout(() => {
        handleLogout()
      }, 2000)
    } catch (error: any) {
      console.error('Erro ao atualizar credenciais:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar credenciais",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSecretaria = async () => {
    if (!secretariaEmail || !secretariaPassword) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert({ 
          email: secretariaEmail, 
          password: secretariaPassword, 
          role: 'secretaria' 
        }, {
          onConflict: 'email'
        })

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Usuário da secretária cadastrado com sucesso.",
      })
      setSecretariaEmail('')
      setSecretariaPassword('')
    } catch (error: any) {
      console.error('Erro ao cadastrar secretária:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar secretária",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterTI = async () => {
    if (!tiEmail || !tiName) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert({ 
          email: tiEmail, 
          full_name: tiName,
          role: 'ti' 
        }, {
          onConflict: 'email'
        })

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Usuário de TI cadastrado com sucesso.",
      })
      setTiEmail('')
      setTiName('')
    } catch (error: any) {
      console.error('Erro ao cadastrar técnico em TI:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar técnico em TI",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTI = async () => {
    if (!tiUpdateEmail) {
      toast({
        title: "Erro",
        description: "Email atual é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!tiUpdateNewEmail && !tiUpdateNewName) {
      toast({
        title: "Erro",
        description: "Informe pelo menos um novo valor (email ou nome)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const updates: { email?: string; full_name?: string } = {}
      if (tiUpdateNewEmail) {
        updates.email = tiUpdateNewEmail
      }
      if (tiUpdateNewName) {
        updates.full_name = tiUpdateNewName
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('email', tiUpdateEmail)
        .eq('role', 'ti')

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Dados do técnico de TI atualizados com sucesso.",
      })
      
      setTiUpdateEmail('')
      setTiUpdateNewEmail('')
      setTiUpdateNewName('')
    } catch (error: any) {
      console.error('Erro ao atualizar técnico em TI:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar técnico em TI",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSecretaria = async () => {
    if (!secretariaUpdateEmail) {
      toast({
        title: "Erro",
        description: "Email atual é obrigatório",
        variant: "destructive",
      })
      return
    }

    if (!secretariaUpdateNewEmail && !secretariaUpdateNewName && !secretariaUpdateNewPassword) {
      toast({
        title: "Erro",
        description: "Informe pelo menos um novo valor (email, nome ou senha)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Atualizar dados na tabela admin_users
      const updates: { email?: string; full_name?: string } = {}
      if (secretariaUpdateNewEmail) {
        updates.email = secretariaUpdateNewEmail
      }
      if (secretariaUpdateNewName) {
        updates.full_name = secretariaUpdateNewName
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('admin_users')
          .update(updates)
          .eq('email', secretariaUpdateEmail)
          .eq('role', 'secretaria')

        if (error) throw error
      }

      // Atualizar senha se fornecida (via edge function)
      if (secretariaUpdateNewPassword) {
        // Buscar o user_id do admin
        const { data: adminData, error: fetchError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('email', secretariaUpdateEmail)
          .eq('role', 'secretaria')
          .single()

        if (fetchError) throw fetchError

        // Atualizar senha via edge function segura
        const { data: pwResult, error: pwError } = await supabase.functions.invoke(
          'admin-update-password',
          {
            body: {
              target_user_id: adminData.user_id,
              new_password: secretariaUpdateNewPassword,
            },
          }
        )

        if (pwError) throw pwError
        if (pwResult?.error) throw new Error(pwResult.error)
      }

      toast({
        title: "Sucesso!",
        description: "Dados da secretária atualizados com sucesso.",
      })
      
      setSecretariaUpdateEmail('')
      setSecretariaUpdateNewEmail('')
      setSecretariaUpdateNewName('')
      setSecretariaUpdateNewPassword('')
    } catch (error: any) {
      console.error('Erro ao atualizar secretária:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar secretária",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterResearcher = async () => {
    if (!researcherName || !researcherProgram || !researcherLattes || !researcherInstitution || !researcherDescription) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Insert into researchers table
      const { error: researcherError } = await supabase
        .from('researchers')
        .insert({
          name: researcherName,
          program: researcherProgram,
          lattes_link: researcherLattes,
          institution: researcherInstitution,
        })

      if (researcherError) throw researcherError

      // Also insert into user_profiles table with researcher_route
      const firstName = researcherName.split(' ')[0]
      // Gerar researcher_route baseado no nome (formato: primeiro-ultimo-nome)
      const nameParts = researcherName.toLowerCase().split(' ')
      const researcherRoute = nameParts.length > 1 
        ? `/pesquisadores/${nameParts[0]}-${nameParts[nameParts.length - 1]}`
        : `/pesquisadores/${nameParts[0]}`
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          full_name: researcherName,
          email: 'a_definir@temporario.com',
          institution: researcherInstitution,
          phone: '(00) 00000-0000',
          first_name: firstName,
          researcher_route: researcherRoute,
          description: researcherDescription,
        })

      if (profileError) {
        console.error('Erro ao criar perfil de usuário:', profileError)
        // Continue even if profile creation fails
      }

      toast({
        title: "Sucesso",
        description: "Pesquisador cadastrado com sucesso! O pesquisador poderá editar seu email e descrição posteriormente.",
      })

      // Limpar formulário
      setResearcherName('')
      setResearcherProgram('')
      setResearcherLattes('')
      setResearcherInstitution('UFBA')
      setResearcherDescription('')
    } catch (error: any) {
      console.error('Erro ao cadastrar pesquisador:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar pesquisador",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterLaboratory = async () => {
    if (!labName || !labAcronym || !labChief || !labChiefEmail || !labDescription || !labPnipe) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Validar email do chefe - não aceitar @ufba.br
    if (labChiefEmail.toLowerCase().includes('@ufba.br')) {
      toast({
        title: "Erro",
        description: "O email do chefe não pode ter domínio @ufba.br. Use um email alternativo (Gmail, Outlook, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(labChiefEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let photo1_url = null
      let photo2_url = null
      let photo3_url = null

      // Upload das fotos se foram fornecidas
      if (labPhoto1 || labPhoto2 || labPhoto3) {
        setUploadingPhotos(true)
        
        if (labPhoto1) {
          const fileExt = labPhoto1.name.split('.').pop()
          const fileName = `${labAcronym.toLowerCase()}_photo_1_${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('laboratory-photos')
            .upload(fileName, labPhoto1)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('laboratory-photos')
            .getPublicUrl(fileName)

          photo1_url = publicUrl
        }

        if (labPhoto2) {
          const fileExt = labPhoto2.name.split('.').pop()
          const fileName = `${labAcronym.toLowerCase()}_photo_2_${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('laboratory-photos')
            .upload(fileName, labPhoto2)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('laboratory-photos')
            .getPublicUrl(fileName)

          photo2_url = publicUrl
        }

        if (labPhoto3) {
          const fileExt = labPhoto3.name.split('.').pop()
          const fileName = `${labAcronym.toLowerCase()}_photo_3_${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('laboratory-photos')
            .upload(fileName, labPhoto3)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('laboratory-photos')
            .getPublicUrl(fileName)

          photo3_url = publicUrl
        }
      }

      const { error } = await supabase
        .from('laboratories')
        .insert({
          name: labName,
          acronym: labAcronym,
          chief_name: labChief,
          chief_alternative_email: labChiefEmail,
          description: labDescription,
          pnipe_address: labPnipe,
          photo1_url,
          photo2_url,
          photo3_url,
          photo1_legend: labPhoto1Legend || null,
          photo2_legend: labPhoto2Legend || null,
          photo3_legend: labPhoto3Legend || null,
        })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Laboratório cadastrado com sucesso!",
      })

      // Limpar formulário
      setLabName('')
      setLabAcronym('')
      setLabChief('')
      setLabChiefEmail('')
      setLabDescription('')
      setLabPnipe('')
      setLabPhoto1(null)
      setLabPhoto2(null)
      setLabPhoto3(null)
      setLabPhoto1Legend('')
      setLabPhoto2Legend('')
      setLabPhoto3Legend('')
    } catch (error: any) {
      console.error('Erro ao cadastrar laboratório:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar laboratório",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadingPhotos(false)
    }
  }

  const handleRegisterNews = async () => {
    if (!newsTitle || !newsContent || !newsPosition) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Título, Conteúdo e Posição)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setUploadingPhotos(true)

    try {
      const photos = [newsPhoto1, newsPhoto2, newsPhoto3]
      const photoUrls: (string | null)[] = [null, null, null]

      // Upload das fotos (sanitiza nome e define contentType)
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        if (photo) {
          const originalName = photo.name || `foto-${i + 1}.jpg`
          const sanitizedName = originalName
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '_')
            .replace(/_+/g, '_')
          const fileName = `${newsPosition || 'news'}/${Date.now()}-${i + 1}-${sanitizedName}`
          const { error: uploadError } = await supabase.storage
            .from('news-photos')
            .upload(fileName, photo, { contentType: photo.type || 'application/octet-stream', upsert: false })

          if (uploadError) {
            console.error('Erro upload storage:', uploadError)
            throw uploadError
          }

          const { data: { publicUrl } } = supabase.storage
            .from('news-photos')
            .getPublicUrl(fileName)

          photoUrls[i] = publicUrl
        }
      }

      // Verificar se já existe uma notícia na posição selecionada
      const { data: existingNews } = await supabase
        .from('news')
        .select('id')
        .eq('news_position', newsPosition)
        .maybeSingle()

      if (existingNews) {
        // Atualizar notícia existente
        const { error } = await supabase
          .from('news')
          .update({
            title: newsTitle,
            content: newsContent,
            photo1_url: photoUrls[0],
            photo2_url: photoUrls[1],
            photo3_url: photoUrls[2],
            cover_photo_number: parseInt(newsCoverPhoto),
          })
          .eq('id', existingNews.id)

        if (error) throw error
      } else {
        // Inserir nova notícia
        const { error } = await supabase
          .from('news')
          .insert({
            title: newsTitle,
            content: newsContent,
            photo1_url: photoUrls[0],
            photo2_url: photoUrls[1],
            photo3_url: photoUrls[2],
            cover_photo_number: parseInt(newsCoverPhoto),
            news_position: newsPosition
          })

        if (error) throw error
      }

      toast({
        title: "Sucesso",
        description: "Notícia publicada com sucesso!",
      })

      // Limpar formulário
      setNewsTitle('')
      setNewsContent('')
      setNewsPhoto1(null)
      setNewsPhoto2(null)
      setNewsPhoto3(null)
      setNewsCoverPhoto('1')
      setNewsPosition('')
    } catch (error: any) {
      console.error('Erro ao publicar notícia:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao publicar notícia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadingPhotos(false)
    }
  }

  const handleRegisterRegulation = async () => {
    if (!regulationName || !regulationPdfUrl) {
      toast({
        title: "Erro",
        description: "Nome da norma e endereço do PDF são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('regulations')
        .insert({
          name: regulationName,
          pdf_url: regulationPdfUrl,
        })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Norma/regulamento cadastrado com sucesso!",
      })

      // Limpar formulário
      setRegulationName('')
      setRegulationPdfUrl('')
    } catch (error: any) {
      console.error('Erro ao cadastrar norma:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar norma",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para registrar evento
  const handleRegisterEvent = async () => {
    if (!eventName || !eventDate || eventPhotos.length === 0) {
      toast({
        title: "Erro",
        description: "Nome, data e pelo menos uma foto são obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setUploadingPhotos(true)

      // Criar o evento primeiro
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([
          {
            name: eventName,
            event_date: eventDate,
          },
        ])
        .select()
        .single()

      if (eventError) throw eventError

      // Upload das fotos
      const uploadPromises = eventPhotos.map(async (photo, index) => {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${eventData.id}/${Date.now()}_${index}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('event-photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-photos')
          .getPublicUrl(fileName)

        return { event_id: eventData.id, photo_url: publicUrl, display_order: index }
      })

      const photoRecords = await Promise.all(uploadPromises)

      const { error: photosError } = await supabase
        .from('event_photos')
        .insert(photoRecords)

      if (photosError) throw photosError

      toast({
        title: "Sucesso!",
        description: "Evento cadastrado com sucesso!",
      })

      setEventName('')
      setEventDate('')
      setEventPhotos([])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar evento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadingPhotos(false)
    }
  }


  if (!adminUser) {
    return <div>Carregando...</div>
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src={logocpgg} alt="CPGG" />
          </div>
          <div className={styles.userInfo}>
            <span>Bem-vindo, {adminUser.email}</span>
            <Button onClick={handleLogout} variant="outline" className={styles.logoutButton}>
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </div>
        
        <div className={styles.title}>
          <h1>Painel Administrativo - Coordenação</h1>
          <p>Cadastre os usuários do sistema e pesquisadores</p>
        </div>

        <div className={styles.quickActions}>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/adm/coordenacao/pesquisadores')}
              className={styles.actionButton}
              variant="outline"
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Gerenciar Pesquisadores
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Um pesquisador entra nesta lista quando o administrador o credencia no formulário abaixo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/adm/coordenacao/usuarios')}
              className={styles.actionButton}
              variant="outline"
            >
              <Users className="w-5 h-5 mr-2" />
              Gerenciar Usuários
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-5 h-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Um pesquisador entra automaticamente na lista de usuários ao ser credenciado pelo Adm. Entretanto, seus dados só são atualizados e só poderá usar o sistema quando ele mesmo cria uma nova conta. Enquanto não cria, seus dados permanecem desatualizados</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button
            onClick={() => navigate('/adm/coordenacao/laboratorios')}
            className={styles.actionButton}
            variant="outline"
          >
            <FlaskConical className="w-5 h-5 mr-2" />
            Gerenciar Laboratórios
          </Button>
          
          <Button
            onClick={() => navigate('/adm/coordenacao/reservas')}
            className={styles.actionButton}
            variant="outline"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Gerenciar Reservas
          </Button>
          
          <Button
            onClick={() => navigate('/adm/coordenacao/equipamentos-laiga')}
            className={styles.actionButton}
            variant="outline"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Equipamentos LAIGA
          </Button>
          
          <Button
            onClick={() => navigate('/adm/repair-stats')}
            className={styles.actionButton}
            variant="outline"
          >
            <ClipboardList className="w-5 h-5 mr-2" />
            Gerenciar Solicitações
          </Button>
        </div>

        <div className={styles.formsContainer}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <UserCheck size={24} />
              <h2>Cadastrar Secretária</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-email">E-mail:</label>
              <Input
                id="secretaria-email"
                type="email"
                value={secretariaEmail}
                onChange={(e) => setSecretariaEmail(e.target.value)}
                placeholder="Digite o e-mail da secretária"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-password">Senha:</label>
              <Input
                id="secretaria-password"
                type="password"
                value={secretariaPassword}
                onChange={(e) => setSecretariaPassword(e.target.value)}
                placeholder="Digite a senha"
              />
            </div>
            <Button
              onClick={handleRegisterSecretaria}
              disabled={isLoading || !secretariaEmail || !secretariaPassword}
              className={styles.submitButton}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Secretária'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Settings size={24} />
              <h2>Atualizar Secretária</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-update-email">E-mail Atual da Secretária:</label>
              <Input
                id="secretaria-update-email"
                type="email"
                value={secretariaUpdateEmail}
                onChange={(e) => setSecretariaUpdateEmail(e.target.value)}
                placeholder="Digite o e-mail atual da secretária"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-update-new-name">Novo Nome (opcional):</label>
              <Input
                id="secretaria-update-new-name"
                type="text"
                value={secretariaUpdateNewName}
                onChange={(e) => setSecretariaUpdateNewName(e.target.value)}
                placeholder="Digite o novo nome ou deixe em branco"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-update-new-email">Novo E-mail (opcional):</label>
              <Input
                id="secretaria-update-new-email"
                type="email"
                value={secretariaUpdateNewEmail}
                onChange={(e) => setSecretariaUpdateNewEmail(e.target.value)}
                placeholder="Digite o novo e-mail ou deixe em branco"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="secretaria-update-new-password">Nova Senha (opcional):</label>
              <Input
                id="secretaria-update-new-password"
                type="password"
                value={secretariaUpdateNewPassword}
                onChange={(e) => setSecretariaUpdateNewPassword(e.target.value)}
                placeholder="Digite a nova senha ou deixe em branco"
              />
            </div>
            <Button
              onClick={handleUpdateSecretaria}
              disabled={isLoading || !secretariaUpdateEmail || (!secretariaUpdateNewEmail && !secretariaUpdateNewName && !secretariaUpdateNewPassword)}
              className={styles.submitButton}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Secretária'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Settings size={24} />
              <h2>Atualizar Credenciais da Coordenação</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="current-email">E-mail Atual:</label>
              <Input
                id="current-email"
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                placeholder="Digite seu e-mail atual"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="new-email">Novo E-mail (opcional):</label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite o novo e-mail ou deixe em branco"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="current-password">Senha Atual:</label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="new-password">Nova Senha (opcional):</label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha ou deixe em branco"
              />
            </div>
            <Button
              onClick={handleUpdateCredentials}
              disabled={isLoading || !currentEmail || !currentPassword || (!newEmail && !newPassword)}
              className={styles.submitButton}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Credenciais'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Settings size={24} />
              <h2>Cadastrar Técnico em TI</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ti-name">Nome:</label>
              <Input
                id="ti-name"
                type="text"
                value={tiName}
                onChange={(e) => setTiName(e.target.value)}
                placeholder="Digite o nome do técnico"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ti-email">E-mail:</label>
              <Input
                id="ti-email"
                type="email"
                value={tiEmail}
                onChange={(e) => setTiEmail(e.target.value)}
                placeholder="Digite o e-mail do técnico"
              />
            </div>
            <Button
              onClick={handleRegisterTI}
              disabled={isLoading || !tiEmail || !tiName}
              className={styles.submitButton}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Técnico em TI'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Settings size={24} />
              <h2>Atualizar Técnico em TI</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ti-update-email">E-mail Atual do Técnico:</label>
              <Input
                id="ti-update-email"
                type="email"
                value={tiUpdateEmail}
                onChange={(e) => setTiUpdateEmail(e.target.value)}
                placeholder="Digite o e-mail atual do técnico"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ti-update-new-name">Novo Nome (opcional):</label>
              <Input
                id="ti-update-new-name"
                type="text"
                value={tiUpdateNewName}
                onChange={(e) => setTiUpdateNewName(e.target.value)}
                placeholder="Digite o novo nome ou deixe em branco"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ti-update-new-email">Novo E-mail (opcional):</label>
              <Input
                id="ti-update-new-email"
                type="email"
                value={tiUpdateNewEmail}
                onChange={(e) => setTiUpdateNewEmail(e.target.value)}
                placeholder="Digite o novo e-mail ou deixe em branco"
              />
            </div>
            <Button
              onClick={handleUpdateTI}
              disabled={isLoading || !tiUpdateEmail || (!tiUpdateNewEmail && !tiUpdateNewName)}
              className={styles.submitButton}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Técnico em TI'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Users size={24} />
              <h2>Credenciar Pesquisador</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="researcher-name">Nome:</label>
              <Input
                id="researcher-name"
                type="text"
                value={researcherName}
                onChange={(e) => setResearcherName(e.target.value)}
                placeholder="Digite o nome do pesquisador"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="researcher-institution">Instituição:</label>
              <Input
                id="researcher-institution"
                type="text"
                value={researcherInstitution}
                onChange={(e) => setResearcherInstitution(e.target.value)}
                placeholder="Digite a instituição"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="researcher-program">Programa:</label>
              <select
                id="researcher-program"
                value={researcherProgram}
                onChange={(e) => setResearcherProgram(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  color: '#000',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecione o programa</option>
                {Object.entries(programMapping).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="researcher-lattes">Link do Lattes:</label>
              <Input
                id="researcher-lattes"
                type="url"
                value={researcherLattes}
                onChange={(e) => setResearcherLattes(e.target.value)}
                placeholder="Digite o link do currículo Lattes"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="researcher-description">Descrição:</label>
              <Textarea
                id="researcher-description"
                value={researcherDescription}
                onChange={(e) => setResearcherDescription(e.target.value)}
                placeholder="Digite uma breve descrição sobre o pesquisador"
                rows={4}
                style={{
                  fontSize: '12pt',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              * O email e descrição poderão ser editados posteriormente pelo próprio pesquisador
            </p>
            <Button
              onClick={handleRegisterResearcher}
              disabled={isLoading || !researcherName || !researcherInstitution || !researcherProgram || !researcherLattes || !researcherDescription}
              className={styles.submitButton}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Pesquisador'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <FlaskConical size={24} />
              <h2>Cadastrar Laboratório</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-name">Nome:</label>
              <Input
                id="lab-name"
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Digite o nome do laboratório"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-acronym">Sigla:</label>
              <Input
                id="lab-acronym"
                type="text"
                value={labAcronym}
                onChange={(e) => setLabAcronym(e.target.value)}
                placeholder="Digite a sigla do laboratório"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-chief">Nome do Chefe:</label>
              <Input
                id="lab-chief"
                type="text"
                value={labChief}
                onChange={(e) => setLabChief(e.target.value)}
                placeholder="Digite o nome do chefe do laboratório"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-chief-email">E-mail do Chefe (não @ufba.br):</label>
              <Input
                id="lab-chief-email"
                type="email"
                value={labChiefEmail}
                onChange={(e) => setLabChiefEmail(e.target.value)}
                placeholder="Digite um email alternativo (Gmail, Outlook, etc.)"
              />
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                ⚠️ Não use email @ufba.br. Este email receberá as demandas de serviço dos usuários.
              </p>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-description">Descrição:</label>
              <Textarea
                id="lab-description"
                value={labDescription}
                onChange={(e) => setLabDescription(e.target.value)}
                placeholder="Digite uma descrição do laboratório"
                rows={4}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lab-pnipe">Endereço PNIPE:</label>
              <Input
                id="lab-pnipe"
                type="text"
                value={labPnipe}
                onChange={(e) => setLabPnipe(e.target.value)}
                placeholder="Digite o endereço PNIPE"
              />
            </div>
            <PhotoDropZone
              id="lab-photo1"
              label="Foto 1:"
              value={labPhoto1}
              onChange={setLabPhoto1}
              className={styles.photoDropZone}
            />
            <div className={styles.inputGroup}>
              <label>Legenda da Foto 1:</label>
              <input
                type="text"
                value={labPhoto1Legend}
                onChange={(e) => setLabPhoto1Legend(e.target.value)}
                placeholder="Digite a legenda da foto 1"
              />
            </div>
            <PhotoDropZone
              id="lab-photo2"
              label="Foto 2:"
              value={labPhoto2}
              onChange={setLabPhoto2}
              className={styles.photoDropZone}
            />
            <div className={styles.inputGroup}>
              <label>Legenda da Foto 2:</label>
              <input
                type="text"
                value={labPhoto2Legend}
                onChange={(e) => setLabPhoto2Legend(e.target.value)}
                placeholder="Digite a legenda da foto 2"
              />
            </div>
            <PhotoDropZone
              id="lab-photo3"
              label="Foto 3:"
              value={labPhoto3}
              onChange={setLabPhoto3}
              className={styles.photoDropZone}
            />
            <div className={styles.inputGroup}>
              <label>Legenda da Foto 3:</label>
              <input
                type="text"
                value={labPhoto3Legend}
                onChange={(e) => setLabPhoto3Legend(e.target.value)}
                placeholder="Digite a legenda da foto 3"
              />
            </div>
            <Button
              onClick={handleRegisterLaboratory}
              disabled={isLoading || uploadingPhotos || !labName || !labAcronym || !labChief || !labChiefEmail || !labDescription || !labPnipe}
              className={styles.submitButton}
            >
              {uploadingPhotos ? 'Enviando fotos...' : isLoading ? 'Cadastrando...' : 'Cadastrar Laboratório'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Newspaper size={24} />
              <h2>Gerenciar Notícias</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="news-title">Título:</label>
              <Input
                id="news-title"
                type="text"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Digite o título da notícia"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="news-content">Conteúdo:</label>
              <Textarea
                id="news-content"
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Digite o conteúdo da notícia"
                rows={8}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="news-position">Posição na Home:</label>
              <Select value={newsPosition} onValueChange={setNewsPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="News1">Notícia 1</SelectItem>
                  <SelectItem value="News2">Notícia 2</SelectItem>
                  <SelectItem value="News3">Notícia 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PhotoDropZone
              id="news-photo1"
              label="Foto 1:"
              value={newsPhoto1}
              onChange={setNewsPhoto1}
              className={styles.photoDropZone}
            />
            <PhotoDropZone
              id="news-photo2"
              label="Foto 2:"
              value={newsPhoto2}
              onChange={setNewsPhoto2}
              className={styles.photoDropZone}
            />
            <PhotoDropZone
              id="news-photo3"
              label="Foto 3:"
              value={newsPhoto3}
              onChange={setNewsPhoto3}
              className={styles.photoDropZone}
            />
            <div className={styles.formGroup}>
              <label htmlFor="news-cover">Foto de Capa:</label>
              <Select value={newsCoverPhoto} onValueChange={setNewsCoverPhoto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Foto 1</SelectItem>
                  <SelectItem value="2">Foto 2</SelectItem>
                  <SelectItem value="3">Foto 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleRegisterNews}
              disabled={isLoading || uploadingPhotos || !newsTitle || !newsContent || !newsPosition}
              className={styles.submitButton}
            >
              {uploadingPhotos ? 'Enviando fotos...' : isLoading ? 'Publicando...' : 'Publicar Notícia'}
            </Button>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <FileText size={24} />
              <h2>Cadastrar Norma/Regulamento</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="regulation-name">Nome da Norma:</label>
              <Input
                id="regulation-name"
                type="text"
                value={regulationName}
                onChange={(e) => setRegulationName(e.target.value)}
                placeholder="Digite o nome da norma/regulamento"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="regulation-pdf">Endereço do PDF:</label>
              <Input
                id="regulation-pdf"
                type="url"
                value={regulationPdfUrl}
                onChange={(e) => setRegulationPdfUrl(e.target.value)}
                placeholder="Digite o link do PDF"
              />
            </div>
            <Button
              onClick={handleRegisterRegulation}
              disabled={isLoading || !regulationName || !regulationPdfUrl}
              className={styles.submitButton}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Norma'}
            </Button>
          </div>


          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Image size={24} />
              <h2>Cadastrar Fotos de Eventos</h2>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-name">Nome do Evento:</label>
              <Input
                id="event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Digite o nome do evento"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-date">Data do Evento:</label>
              <Input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="event-photos">Fotos do Evento (máximo 30):</label>
              <Input
                id="event-photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length > 30) {
                    toast({
                      title: "Muitas fotos",
                      description: "Máximo de 30 fotos permitido por evento.",
                      variant: "destructive",
                    })
                    return
                  }
                  setEventPhotos(files)
                }}
                className={styles.photoInput}
              />
              {eventPhotos.length > 0 && (
                <p className={styles.photoCount}>
                  {eventPhotos.length} foto(s) selecionada(s)
                </p>
              )}
            </div>
            <Button
              onClick={handleRegisterEvent}
              disabled={isLoading || uploadingPhotos || !eventName || !eventDate || eventPhotos.length === 0}
              className={styles.submitButton}
            >
              {uploadingPhotos ? 'Enviando fotos...' : isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}