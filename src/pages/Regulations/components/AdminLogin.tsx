import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ReCAPTCHA from 'react-google-recaptcha'

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()

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
          title: "Erro de Login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        })
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
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
      setCaptchaToken(null)
      recaptchaRef.current?.reset()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
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
      <DialogContent className="sm:max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email:</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Senha:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !captchaToken}
              className="flex-1"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}