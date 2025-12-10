import { useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { HomeButton } from '../../../components/HomeButton'
import { useRecaptcha, RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from './secretaria.module.css'
const logocpgg = 'https://i.imgur.com/6HRTVzo.png';

export function Secretaria() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { verifyRecaptcha, isVerifying } = useRecaptcha()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar reCAPTCHA
    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, complete a verificação reCAPTCHA.",
        variant: "destructive"
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
          variant: "destructive"
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
          title: "Erro de login",
          description: "Email ou senha incorretos.",
          variant: "destructive"
        })
        recaptchaRef.current?.reset()
        return
      }

      // Verificar se é secretaria
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('role', 'secretaria')
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de secretaria.",
          variant: "destructive"
        })
        recaptchaRef.current?.reset()
        return
      }

      // Login bem-sucedido
      sessionStorage.setItem('admin_user', JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        role: adminData.role
      }))
      toast({
        title: "Login realizado!",
        description: "Bem-vinda à área da secretaria.",
      })
      console.log('Login Secretaria bem-sucedido')
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar login. Tente novamente.",
        variant: "destructive"
      })
      recaptchaRef.current?.reset()
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
    <div className={styles.secretaria}>
      <HomeButton />
      <form className={styles.box} onSubmit={handleSubmit}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        <div className={styles.upper}>
          <p>Login - Secretaria</p>
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
            disabled={isLoading || isVerifying}
          />
          
          <label htmlFor="password">Senha:</label>
          <input 
            type="password" 
            id="password"
            placeholder="Digite sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isLoading || isVerifying}
          />
        </div>
        
        <div className={styles.recaptchaContainer}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            theme="light"
          />
        </div>
        
        <button type="submit" className={styles.button} disabled={isLoading || isVerifying}>
          {isLoading || isVerifying ? 'Entrando...' : 'Entrar'}
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