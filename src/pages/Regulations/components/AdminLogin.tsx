import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRecaptcha, RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha'
import ReCAPTCHA from 'react-google-recaptcha'

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
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

      // Verificar se o usuário é admin coordenação
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('role', 'coordenacao')
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        toast({
          title: "Erro de Login",
          description: "Você não tem permissão de coordenação",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      toast({
        title: "Login realizado",
        description: "Bem-vindo ao modo de edição!",
      })

      onSuccess()
      onClose()
      setEmail('')
      setPassword('')
    } catch (error) {
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
    recaptchaRef.current?.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email:</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              disabled={isLoading || isVerifying}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Senha:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
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