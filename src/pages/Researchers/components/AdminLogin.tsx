import { useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => void
}

export function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()

  if (!isOpen) return null

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

    setLoading(true)

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
      setLoading(false)
    }
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

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setCaptchaToken(null)
    recaptchaRef.current?.reset()
    onClose()
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          maxWidth: '28rem',
          width: '100%',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <X size={20} color="#000" />
        </button>

        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#000'
        }}>
          {isForgotPassword ? 'Recuperar Senha' : 'Login Administrativo'}
        </h2>
        
        {!isForgotPassword ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label htmlFor="email" style={{ color: '#000' }}>Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ color: '#000' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label htmlFor="password" style={{ color: '#000' }}>Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ color: '#000' }}
              />
            </div>
            
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'left', marginTop: '4px', marginBottom: '-8px' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
            
            <Button
              type="button"
              variant="link"
              onClick={() => setIsForgotPassword(true)}
              style={{ padding: 0, height: 'auto', textAlign: 'left', justifyContent: 'flex-start' }}
            >
              Esqueci minha senha
            </Button>
            
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !captchaToken} 
                style={{ flex: 1 }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Digite seu email para receber um link de recuperação de senha.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label htmlFor="reset-email" style={{ color: '#000' }}>Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{ color: '#000' }}
              />
            </div>
            
            <Button
              type="button"
              variant="link"
              onClick={() => setIsForgotPassword(false)}
              style={{ padding: 0, height: 'auto', textAlign: 'left', justifyContent: 'flex-start' }}
            >
              Voltar para o login
            </Button>
            
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                style={{ flex: 1 }}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}