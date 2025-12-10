import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HomeButton } from '../../components/HomeButton';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './login.module.css';
const logocpgg = 'https://imgur.com/6HRTVzo.png';

// Site key do reCAPTCHA - esta é uma chave pública
const RECAPTCHA_SITE_KEY = '6Le6DFYrAAAAAOBKZlf3UZLGKD1Tgm4sSQ7g2WSX';

export function Login() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });
      
      if (error) {
        console.error('Error verifying captcha:', error);
        return false;
      }
      
      return data?.success === true;
    } catch (err) {
      console.error('Error calling verify-recaptcha:', err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to home if user is logged in
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect to home if already logged in
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Verificar reCAPTCHA
      if (!captchaToken) {
        toast({
          title: "Verificação necessária",
          description: "Por favor, complete a verificação \"Não sou um robô\".",
          variant: "destructive",
        });
        setLoginLoading(false);
        return;
      }

      // Verificar token no servidor
      const isValidCaptcha = await verifyCaptcha(captchaToken);
      if (!isValidCaptcha) {
        toast({
          title: "Verificação falhou",
          description: "A verificação de segurança falhou. Tente novamente.",
          variant: "destructive",
        });
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        setLoginLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Erro ao fazer login",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao fazer login",
            description: error.message,
            variant: "destructive",
          });
        }
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
      } else if (data.user) {
        // Busca o perfil do usuário para obter a rota do pesquisador
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('researcher_route')
          .eq('user_id', data.user.id)
          .single()

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError)
          toast({
            title: "Login realizado",
            description: "Bem-vindo de volta!",
          });
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else if (profile.researcher_route) {
          toast({
            title: "Login realizado",
            description: "Redirecionando para sua página...",
          });
          setTimeout(() => {
            window.location.href = profile.researcher_route
          }, 1000)
        } else {
          toast({
            title: "Login realizado",
            description: "Bem-vindo de volta!",
          });
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        }
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já existe",
            description: "Este email já está cadastrado. Tente fazer login.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password should be at least 6 characters')) {
          toast({
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao criar conta",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Conta criada",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setSignupLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao enviar email de recuperação. Verifique o email digitado.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Link enviado com sucesso!",
        description: "Um link para redefinir sua senha foi enviado para o email cadastrado. Verifique sua caixa de entrada.",
      });
      
      setResetEmail('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar email. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={styles.login}>
      <HomeButton />
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        
        <div className={styles.formsContainer}>
          {/* Formulário de Login */}
          <div className={styles.formBox}>
            <div className={styles.formTitle}>
              <p>Fazer Login</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <input 
                type="email" 
                placeholder="Email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loginLoading}
              />
              <input 
                type="password" 
                placeholder="Senha" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                disabled={loginLoading}
                minLength={6}
              />
              <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
              <button type="submit" disabled={loginLoading || !captchaToken}>
                {loginLoading ? 'Carregando...' : 'Entrar'}
              </button>
            </form>

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
          </div>

          {/* Formulário de Cadastro */}
          <div className={styles.formBox}>
            <div className={styles.formTitle}>
              <p>Criar Nova Conta</p>
            </div>

            <form onSubmit={handleSignUp} className={styles.form}>
              <input 
                type="email" 
                placeholder="Email" 
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                disabled={signupLoading}
              />
              <input 
                type="password" 
                placeholder="Senha (mín. 6 caracteres)" 
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                disabled={signupLoading}
                minLength={6}
              />
              <button type="submit" disabled={signupLoading}>
                {signupLoading ? 'Carregando...' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
