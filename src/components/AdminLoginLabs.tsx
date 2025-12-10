import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useRecaptcha, RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha'
import ReCAPTCHA from 'react-google-recaptcha'

interface AdminLoginLabsProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
}

export function AdminLoginLabs({ isOpen, onClose, onLogin }: AdminLoginLabsProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { verifyRecaptcha, isVerifying } = useRecaptcha()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
          title: "Erro de autenticação",
          description: "Email ou senha incorretos.",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
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
          description: "Usuário sem permissão.",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        return
      }

      toast({
        title: "Login realizado",
        description: "Modo de edição ativado.",
      })
      
      setEmail('')
      setPassword('')
      onLogin(email, password)
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login.",
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto" aria-describedby="admin-login-desc">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <p id="admin-login-desc" className="sr-only">Entre com suas credenciais para habilitar o modo de edição de laboratórios.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              disabled={isLoading || isVerifying}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
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
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isVerifying}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isVerifying}
            >
              {isLoading || isVerifying ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}