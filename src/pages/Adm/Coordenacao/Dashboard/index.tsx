import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/RichTextEditor'
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
  const [carouselNews, setCarouselNews] = useState<{ id: string; title: string; news_position: string }[]>([])
  const [selectedCarouselNewsId, setSelectedCarouselNewsId] = useState<string>('')
  const [newsExternalLink, setNewsExternalLink] = useState<string>('')
  const [newsPdfFile1, setNewsPdfFile1] = useState<File | null>(null)
  const [newsPdfTitle1, setNewsPdfTitle1] = useState<string>('')
  const [newsPdfFile2, setNewsPdfFile2] = useState<File | null>(null)
  const [newsPdfTitle2, setNewsPdfTitle2] = useState<string>('')
  const [newsPdfFile3, setNewsPdfFile3] = useState<File | null>(null)
  const [newsPdfTitle3, setNewsPdfTitle3] = useState<string>('')
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [loadingNews, setLoadingNews] = useState(false)
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<(string | null)[]>([null, null, null])
  const [existingPdfUrls, setExistingPdfUrls] = useState<(string | null)[]>([null, null, null])

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
      const { data, error } = await supabase.functions.invoke('admin-create-staff', {
        body: {
          email: secretariaEmail,
          password: secretariaPassword,
          role: 'secretaria',
          full_name: 'Secretaria CPGG',
        },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast({
        title: "Sucesso!",
        description: "Secretária cadastrada com acesso liberado.",
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
      const { data, error } = await supabase.functions.invoke('admin-create-staff', {
        body: { email: tiEmail, full_name: tiName, role: 'ti' },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)


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

      // Gerar email temporário ÚNICO por pesquisador (o pesquisador edita depois)
      const emailSlug = researcherName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/(^\.|\.$)/g, '')
      const tempEmail = `${emailSlug}.${Date.now()}@a-definir.temporario`

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          full_name: researcherName,
          email: tempEmail,
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

  const handleLoadExistingNews = async (newsId: string) => {
    if (!newsId) return
    setLoadingNews(true)
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setEditingNewsId(data.id)
        setNewsTitle(data.title)
        setNewsContent(data.content)
        setNewsCoverPhoto(String(data.cover_photo_number || 1))
        setNewsExternalLink(data.external_link || '')
        setNewsPdfTitle1(data.pdf1_title || '')
        setNewsPdfTitle2(data.pdf2_title || '')
        setNewsPdfTitle3(data.pdf3_title || '')
        setExistingPhotoUrls([data.photo1_url, data.photo2_url, data.photo3_url])
        setExistingPdfUrls([data.pdf1_url, data.pdf2_url, data.pdf3_url])
        setNewsPhoto1(null)
        setNewsPhoto2(null)
        setNewsPhoto3(null)
        setNewsPdfFile1(null)
        setNewsPdfFile2(null)
        setNewsPdfFile3(null)
        toast({ title: "Notícia carregada", description: "Edite os campos desejados e salve." })
      } else {
        handleClearNewsForm()
        toast({ title: "Nenhuma notícia", description: "Notícia não encontrada." })
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" })
    } finally {
      setLoadingNews(false)
    }
  }


  const handleClearNewsForm = () => {
    setEditingNewsId(null)
    setNewsTitle('')
    setNewsContent('')
    setNewsPhoto1(null)
    setNewsPhoto2(null)
    setNewsPhoto3(null)
    setNewsCoverPhoto('1')
    setNewsExternalLink('')
    setNewsPdfFile1(null)
    setNewsPdfTitle1('')
    setNewsPdfFile2(null)
    setNewsPdfTitle2('')
    setNewsPdfFile3(null)
    setNewsPdfTitle3('')
    setExistingPhotoUrls([null, null, null])
    setExistingPdfUrls([null, null, null])
  }
  const loadCarouselNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('id, title, news_position')
      .in('news_position', ['News1', 'News2', 'News3'])
      .order('news_position')
    setCarouselNews(data || [])
  }

  useEffect(() => {
    loadCarouselNews()
  }, [])

  const handleRegisterNews = async () => {
    if (!newsTitle || !newsContent) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (Título e Conteúdo)",
        variant: "destructive",
      })
      return
    }


    setIsLoading(true)
    setUploadingPhotos(true)

    try {
      const photos = [newsPhoto1, newsPhoto2, newsPhoto3]
      const photoUrls: (string | null)[] = [...existingPhotoUrls]

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        if (photo) {
          const originalName = photo.name || `foto-${i + 1}.jpg`
          const sanitizedName = originalName.toLowerCase().replace(/[^a-z0-9._-]/g, '_').replace(/_+/g, '_')
          const fileName = `news/${Date.now()}-${i + 1}-${sanitizedName}`
          const { error: uploadError } = await supabase.storage
            .from('news-photos')
            .upload(fileName, photo, { contentType: photo.type || 'application/octet-stream', upsert: false })
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('news-photos').getPublicUrl(fileName)
          photoUrls[i] = publicUrl
        }
      }

      const pdfFiles = [newsPdfFile1, newsPdfFile2, newsPdfFile3]
      const pdfUrls: (string | null)[] = [...existingPdfUrls]
      for (let i = 0; i < pdfFiles.length; i++) {
        if (pdfFiles[i]) {
          const pdfName = pdfFiles[i]!.name.toLowerCase().replace(/[^a-z0-9._-]/g, '_').replace(/_+/g, '_')
          const pdfFileName = `news/${Date.now()}-pdf${i + 1}-${pdfName}`
          const { error: pdfUploadError } = await supabase.storage
            .from('news-photos')
            .upload(pdfFileName, pdfFiles[i]!, { contentType: pdfFiles[i]!.type || 'application/pdf', upsert: false })
          if (pdfUploadError) throw pdfUploadError
          const { data: { publicUrl } } = supabase.storage.from('news-photos').getPublicUrl(pdfFileName)
          pdfUrls[i] = publicUrl
        }
      }

      const newsData: any = {
        title: newsTitle,
        content: newsContent,
        photo1_url: photoUrls[0],
        photo2_url: photoUrls[1],
        photo3_url: photoUrls[2],
        cover_photo_number: parseInt(newsCoverPhoto),
        external_link: newsExternalLink || null,
        pdf1_url: pdfUrls[0],
        pdf1_title: newsPdfTitle1 || null,
        pdf2_url: pdfUrls[1],
        pdf2_title: newsPdfTitle2 || null,
        pdf3_url: pdfUrls[2],
        pdf3_title: newsPdfTitle3 || null,
      }

      if (editingNewsId) {
        const { error } = await supabase.from('news').update(newsData).eq('id', editingNewsId)
        if (error) throw error
      } else {
        // Rotação do carrossel: a nova notícia entra como Notícia 1,
        // a antiga 1 vira 2, a 2 vira 3 e a 3 sai do carrossel (fica no arquivo).
        const { error: e3 } = await supabase
          .from('news')
          .update({ news_position: 'archive' })
          .eq('news_position', 'News3')
        if (e3) throw e3

        const { error: e2 } = await supabase
          .from('news')
          .update({ news_position: 'News3' })
          .eq('news_position', 'News2')
        if (e2) throw e2

        const { error: e1 } = await supabase
          .from('news')
          .update({ news_position: 'News2' })
          .eq('news_position', 'News1')
        if (e1) throw e1

        const { error } = await supabase
          .from('news')
          .insert({ ...newsData, news_position: 'News1' })
        if (error) throw error
      }

      toast({
        title: "Sucesso",
        description: editingNewsId ? "Notícia atualizada com sucesso!" : "Notícia publicada como Notícia 1 do carrossel!",
      })

      handleClearNewsForm()
      setSelectedCarouselNewsId('')
      await loadCarouselNews()
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

        return { event_id: eventData.id, photo_url: publicUrl, photo_order: index }
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
            onClick={() => navigate('/adm/coordenacao/equipamentos-labs')}
            className={styles.actionButton}
            variant="outline"
          >
            <FlaskConical className="w-5 h-5 mr-2" />
            Equipamentos dos Laboratórios
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
            {editingNewsId && (
              <div style={{ background: '#ede9fe', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', color: '#5b21b6', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✏️ Editando notícia existente</span>
                <Button variant="outline" size="sm" onClick={handleClearNewsForm} style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
                  Limpar e criar nova
                </Button>
              </div>
            )}
            <div style={{ background: '#f5f3ff', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', color: '#5b21b6', fontSize: '0.9rem' }}>
              A nova notícia entra automaticamente como <strong>Notícia 1</strong> do carrossel. As anteriores descem uma posição e a 4ª sai do carrossel, permanecendo no Arquivo de Notícias com link próprio.
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="news-edit">Editar notícia do carrossel (opcional):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Select value={selectedCarouselNewsId} onValueChange={(val) => { setSelectedCarouselNewsId(val); handleLoadExistingNews(val); }}>
                  <SelectTrigger className={styles.selectTrigger}>
                    <SelectValue placeholder="Selecione uma notícia publicada" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 z-[9999]">
                    {carouselNews.map((n) => (
                      <SelectItem key={n.id} value={n.id} className="text-black hover:bg-gray-100 cursor-pointer">
                        {n.news_position.replace('News', 'Notícia ')} — {n.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => { handleClearNewsForm(); setSelectedCarouselNewsId('') }}
                  disabled={loadingNews}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Nova notícia
                </Button>
              </div>
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
              <label>Conteúdo:</label>
              <RichTextEditor
                value={newsContent}
                onChange={setNewsContent}
                placeholder="Digite o conteúdo da notícia"
              />
            </div>
            {[1, 2, 3].map((num) => {
              const photo = num === 1 ? newsPhoto1 : num === 2 ? newsPhoto2 : newsPhoto3
              const setPhoto = num === 1 ? setNewsPhoto1 : num === 2 ? setNewsPhoto2 : setNewsPhoto3
              const existingUrl = existingPhotoUrls[num - 1]
              return (
                <div key={`photo-${num}`}>
                  <PhotoDropZone
                    id={`news-photo${num}`}
                    label={`Foto ${num}:${existingUrl ? ' (já existe — envie nova para substituir)' : ''}`}
                    value={photo}
                    onChange={setPhoto}
                    className={styles.photoDropZone}
                  />
                  {existingUrl && !photo && (
                    <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                      ✅ Foto atual mantida
                    </div>
                  )}
                </div>
              )
            })}
            <div className={styles.formGroup}>
              <label htmlFor="news-cover">Foto de Capa:</label>
              <Select value={newsCoverPhoto} onValueChange={setNewsCoverPhoto}>
                <SelectTrigger className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 z-[9999]">
                  <SelectItem value="1" className="text-black hover:bg-gray-100 cursor-pointer">Foto 1</SelectItem>
                  <SelectItem value="2" className="text-black hover:bg-gray-100 cursor-pointer">Foto 2</SelectItem>
                  <SelectItem value="3" className="text-black hover:bg-gray-100 cursor-pointer">Foto 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="news-link">Link Externo (opcional):</label>
              <Input
                id="news-link"
                type="url"
                value={newsExternalLink}
                onChange={(e) => setNewsExternalLink(e.target.value)}
                placeholder="https://exemplo.com/artigo"
              />
            </div>
            {[1, 2, 3].map((num) => {
              const file = num === 1 ? newsPdfFile1 : num === 2 ? newsPdfFile2 : newsPdfFile3
              const title = num === 1 ? newsPdfTitle1 : num === 2 ? newsPdfTitle2 : newsPdfTitle3
              const setFile = num === 1 ? setNewsPdfFile1 : num === 2 ? setNewsPdfFile2 : setNewsPdfFile3
              const setTitle = num === 1 ? setNewsPdfTitle1 : num === 2 ? setNewsPdfTitle2 : setNewsPdfTitle3
              const existingPdf = existingPdfUrls[num - 1]
              return (
                <div key={num} className={styles.formGroup}>
                  <label>PDF {num} (opcional):{existingPdf ? ' (já existe)' : ''}</label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Título do PDF ${num}`}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                  {file && (
                    <div className={styles.photoPreview}>📄 {file.name}</div>
                  )}
                  {existingPdf && !file && (
                    <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.25rem' }}>
                      ✅ PDF atual mantido
                    </div>
                  )}
                </div>
              )
            })}
            <Button
              onClick={handleRegisterNews}
              disabled={isLoading || uploadingPhotos || !newsTitle || !newsContent}
              className={styles.submitButton}
            >
              {uploadingPhotos ? 'Enviando fotos...' : isLoading ? 'Salvando...' : editingNewsId ? 'Salvar Alterações' : 'Publicar Notícia'}
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