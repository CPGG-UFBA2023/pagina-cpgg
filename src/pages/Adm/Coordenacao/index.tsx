import { useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { HomeButton } from '../../../components/HomeButton'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from './coordenacao.module.css'
const logocpgg = 'https://i.imgur.com/6HRTVzo.png';

const RECAPTCHA_SITE_KEY = '6LdLmJYqAAAAAMKPR30bpPPxUP2JLOi-hBnAPk-K';

export function Coordenacao() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
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
          title: "Erro de login",
          description: "Email ou senha incorretos.",
          variant: "destructive"
        })
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        return
      }

      // Verificar se é coordenação
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('role', 'coordenacao')
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de coordenação.",
          variant: "destructive"
        })
        return
      }

      // Login bem-sucedido - salvar dados na sessão e navegar
      sessionStorage.setItem('admin_user', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: adminData.role
      }))
      toast({
        title: "Login realizado!",
        description: "Bem-vindo à área administrativa.",
      })
      navigate('/adm/coordenacao/dashboard')
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar login. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao enviar email de recuperação. Verifique o email digitado.",
          variant: "destructive"
        })
        return
      }
      
      toast({
        title: "Link enviado com sucesso!",
        description: "Um link para redefinir sua senha foi enviado para o email cadastrado. Verifique sua caixa de entrada.",
      })
      
      setResetEmail('')
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={styles.coordenacao}>
      <HomeButton />
      <form className={styles.box} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        <div className={styles.upper}>
          <p>Login - Coordenação</p>
        </div>
        <div className={styles.back}>
          <NavLink to='/adm'>← Voltar</NavLink>
        </div>
        
        <div className={styles.form}>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email"
            placeholder="Digite seu email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isLoading}
          />
          
          <label htmlFor="password">Senha:</label>
          <input 
            type="password" 
            id="password"
            placeholder="Digite sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isLoading}
          />
        </div>
        
        <div style={{ transform: 'scale(0.85)', transformOrigin: 'center', marginTop: '-10px', marginBottom: '-10px' }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
            onExpired={() => setCaptchaToken(null)}
          />
        </div>
        
        <button type="submit" className={styles.button} disabled={isLoading || !captchaToken}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className={styles.forgotPassword}>
              Esqueci minha senha
            </button>
          </DialogTrigger>
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Recuperar Senha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePasswordReset} className={styles.resetForm}>
              <div className={styles.formGroup}>
                <Label htmlFor="resetEmail">Email cadastrado:</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Digite seu email cadastrado"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className={styles.resetButton}>
                Enviar link de redefinição
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  )
}