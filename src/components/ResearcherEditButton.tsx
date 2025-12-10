import { useState, useEffect, useRef } from 'react'
import { Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useResearcherProfile } from '@/components/ResearcherProfileContext'
import ReCAPTCHA from 'react-google-recaptcha'

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface ResearcherEditButtonProps {
  researcherName: string
  inline?: boolean
  onSave?: () => void
}

export function ResearcherEditButton({ researcherName, inline = false, onSave }: ResearcherEditButtonProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null)
  const [editCaptchaToken, setEditCaptchaToken] = useState<string | null>(null)
  const loginRecaptchaRef = useRef<ReCAPTCHA>(null)
  const editRecaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()
  const { staticDescription } = useResearcherProfile()

  // Função para extrair primeiro nome do nome completo
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0].toLowerCase()
  }

  // Verifica se o usuário pode editar baseado no nome
  const canUserEdit = (userFirstName: string, researcherName: string) => {
    const researcherFirstName = getFirstName(researcherName)
    return userFirstName === researcherFirstName
  }

  // Carrega perfil existente do pesquisador
  useEffect(() => {
    const loadResearcherProfile = async () => {
      const firstName = getFirstName(researcherName)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('first_name', firstName)
        .maybeSingle()

      if (data) {
        const dbDesc = (data as any).description?.trim?.() || ''
        setDescription(dbDesc || staticDescription || '')
        setCurrentPhotoUrl(data.photo_url)
      } else {
        if (staticDescription) setDescription(staticDescription)
      }
    }

    loadResearcherProfile()
  }, [researcherName])

  // Fallback: se não há descrição dinâmica, usar a estática
  useEffect(() => {
    if (!description && staticDescription) {
      setDescription(staticDescription)
    }
  }, [staticDescription])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verifica reCAPTCHA
    if (!loginCaptchaToken) {
      toast({
        title: 'Verificação necessária',
        description: 'Por favor, complete o reCAPTCHA.',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)

    try {
      // Verifica o token do reCAPTCHA no servidor
      const { data: captchaResult, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: loginCaptchaToken }
      })
      
      if (captchaError || !captchaResult?.success) {
        toast({
          title: 'Erro',
          description: 'Falha na verificação do reCAPTCHA. Tente novamente.',
          variant: 'destructive'
        })
        loginRecaptchaRef.current?.reset()
        setLoginCaptchaToken(null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro",
          description: "Email ou senha inválidos",
          variant: "destructive",
        })
        return
      }

      // Busca o perfil do usuário para verificar o primeiro nome
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (profileError || !profile) {
        toast({
          title: "Erro",
          description: "Perfil não encontrado",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return
      }

      const userFirstName = getFirstName(profile.full_name)
      
      if (!canUserEdit(userFirstName, researcherName)) {
        toast({
          title: "Acesso negado",
          description: "Você só pode editar seu próprio perfil",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return
      }

      setUserProfile(profile)
      // Preserve existing description if it was already loaded
      if (!description && profile.description) {
        setDescription(profile.description)
      }
      if (!description && !profile.description && staticDescription) {
        setDescription(staticDescription)
      }
      if (!currentPhotoUrl && profile.photo_url) {
        setCurrentPhotoUrl(profile.photo_url)
      }
      setIsAuthenticated(true)
      setIsLoginOpen(false)
      setIsEditOpen(true)
      
      toast({
        title: "Acesso autorizado",
        description: "Agora você pode editar seu perfil",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!userProfile) return
    
    // Verifica reCAPTCHA
    if (!editCaptchaToken) {
      toast({
        title: 'Verificação necessária',
        description: 'Por favor, complete o reCAPTCHA.',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Verifica o token do reCAPTCHA no servidor
      const { data: captchaResult, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: editCaptchaToken }
      })
      
      if (captchaError || !captchaResult?.success) {
        toast({
          title: 'Erro',
          description: 'Falha na verificação do reCAPTCHA. Tente novamente.',
          variant: 'destructive'
        })
        editRecaptchaRef.current?.reset()
        setEditCaptchaToken(null)
        setLoading(false)
        return
      }
      
      let photoUrl = currentPhotoUrl

      // Upload da foto se houver uma nova
      if (photo) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('laboratory-photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('laboratory-photos')
          .getPublicUrl(fileName)

        photoUrl = publicUrl
      }

      // Atualiza o perfil (sem alterar o email, que deve vir sempre do auth.users)
      const { error } = await supabase
        .from('user_profiles')
        .update({
          description,
          photo_url: photoUrl,
        })
        .eq('user_id', userProfile.user_id)

      if (error) throw error

      setCurrentPhotoUrl(photoUrl)
      setIsEditOpen(false)
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      })

      // Chama callback para recarregar dados no componente pai
      if (onSave) {
        onSave()
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserProfile(null)
    setEmail('')
    setPassword('')
    setDescription('')
    setCurrentPhotoUrl(null)
    setPhoto(null)
    setIsEditOpen(false)
    setLoginCaptchaToken(null)
    setEditCaptchaToken(null)
    loginRecaptchaRef.current?.reset()
    editRecaptchaRef.current?.reset()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
      
      setResetEmail('')
      setIsForgotPassword(false)
    } catch (error: any) {
      console.error('Erro ao enviar email de reset:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botão discreto de edição */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsLoginOpen(true)}
        className={inline ? "mt-2 self-start opacity-70 hover:opacity-100 transition-opacity" : "fixed top-20 right-4 opacity-70 hover:opacity-100 transition-opacity z-50 bg-background/80 backdrop-blur-sm border"}
        title="Editar perfil"
      >
        <Edit3 className="w-4 h-4" />
      </Button>

      {/* Dialog de Login */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isForgotPassword ? 'Recuperar Senha' : 'Login do Pesquisador'}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="mb-4">
            {isForgotPassword 
              ? 'Digite seu email para receber um link de recuperação de senha.'
              : 'Faça login com suas credenciais para editar seu perfil'
            }
          </DialogDescription>
          
          {!isForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsForgotPassword(true)}
                className="p-0 h-auto text-sm"
              >
                Esqueci minha senha
              </Button>
              <div className="flex justify-center my-4">
                <ReCAPTCHA
                  ref={loginRecaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setLoginCaptchaToken(token)}
                  onExpired={() => setLoginCaptchaToken(null)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLoginOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsForgotPassword(false)}
                className="p-0 h-auto text-sm"
              >
                Voltar para o login
              </Button>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLoginOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[calc(50vh-100px)] overflow-y-auto !translate-x-[calc(-50%-150px)] !translate-y-[calc(-50%-130px)] !bg-white z-[100]">
          <DialogHeader>
            <DialogTitle>Editar Perfil - {researcherName}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="mb-4">
            Edite sua descrição e foto do perfil
          </DialogDescription>
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Digite sua descrição profissional..."
              />
            </div>
            <div>
              <Label htmlFor="photo">Foto do Perfil</Label>
              {currentPhotoUrl && (
                <div className="mb-2">
                  <img 
                    src={currentPhotoUrl} 
                    alt="Foto atual" 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-center my-4">
              <ReCAPTCHA
                ref={editRecaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setEditCaptchaToken(token)}
                onExpired={() => setEditCaptchaToken(null)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}