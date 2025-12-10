import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRecaptcha, RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha'
import ReCAPTCHA from 'react-google-recaptcha'

interface AdminAuthDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (role: string) => void
  requiredRole?: 'coordenacao' | 'secretaria' | 'ti' | 'any'
  title?: string
}

export function AdminAuthDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  requiredRole = 'coordenacao',
  title = 'Login Administrativo'
}: AdminAuthDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { verifyRecaptcha, isVerifying } = useRecaptcha()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Verificar reCAPTCHA
    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete a verificação reCAPTCHA.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Verificar reCAPTCHA no backend
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
      if (!isRecaptchaValid) {
        toast({
          title: "Erro de verificação",
          description: "Falha na verificação reCAPTCHA. Tente novamente.",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      // Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast({
          title: "Erro de Login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      // Verificar se o usuário é admin e obter sua role
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão de administrador",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      // Verificar se a role é adequada
      if (requiredRole !== 'any' && adminData.role !== requiredRole) {
        await supabase.auth.signOut()
        toast({
          title: "Acesso Negado",
          description: `Esta área requer permissão de ${requiredRole}`,
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      // Armazenar informações de admin na sessão
      sessionStorage.setItem('admin_user', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: adminData.role
      }))

      toast({
        title: "Login realizado",
        description: "Bem-vindo ao modo administrativo!",
      })

      onSuccess(adminData.role)
      onClose()
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive",
      })
      recaptchaRef.current?.reset()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    recaptchaRef.current?.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Entre com suas credenciais de administrador para continuar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              autoComplete="email"
              disabled={isLoading || isVerifying}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
              disabled={isLoading || isVerifying}
            />
          </div>
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              theme="light"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isVerifying}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isVerifying}
              className="flex-1"
            >
              {isLoading || isVerifying ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}