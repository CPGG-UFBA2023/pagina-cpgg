import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ReCAPTCHA from 'react-google-recaptcha'

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface AdminLoginLabsProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
}

export function AdminLoginLabs({ isOpen, onClose, onLogin }: AdminLoginLabsProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaToken) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete o reCAPTCHA.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Verify reCAPTCHA
      const { data: captchaData, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: captchaToken }
      })

      if (captchaError || !captchaData?.success) {
        toast({
          title: "Erro de verificação",
          description: "Falha na verificação do reCAPTCHA. Tente novamente.",
          variant: "destructive"
        })
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
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
        setCaptchaToken(null)
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
        return
      }

      toast({
        title: "Login realizado",
        description: "Modo de edição ativado.",
      })
      
      setEmail('')
      setPassword('')
      setCaptchaToken(null)
      recaptchaRef.current?.reset()
      onLogin(email, password)
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setCaptchaToken(null)
    recaptchaRef.current?.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh]" aria-describedby="admin-login-desc">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <p id="admin-login-desc" className="sr-only">Entre com suas credenciais para habilitar o modo de edição de laboratórios.</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={isLoading}
            />
          </div>
          <div style={{ transform: 'scale(0.85)', transformOrigin: 'left', marginTop: '8px', marginBottom: '-8px' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !captchaToken}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}