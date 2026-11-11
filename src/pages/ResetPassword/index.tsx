import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HomeButton } from '@/components/HomeButton';
import { Button } from '@/components/ui/button';
import styles from './ResetPassword.module.css';

const logocpgg = 'https://imgur.com/6HRTVzo.png';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const recoveryLink = useRef(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery');
  const submitting = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && event === 'PASSWORD_RECOVERY' && session) {
        recoveryLink.current = true;
        setIsValidSession(true);
        setChecking(false);
      }
    });
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!mounted) return;
      setIsValidSession(recoveryLink.current && Boolean(user) && !error);
      setChecking(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSession || submitting.current) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, digite a mesma senha nos dois campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    submitting.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Sua senha foi alterada. Redirecionando para o login...",
      });

      // Fazer logout para forçar novo login com a nova senha
      await supabase.auth.signOut();
      
      navigate('/login', { replace: true });

    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className={styles.container}>
        <HomeButton />
        <div className={styles.content}>
          <div className={styles.logo}>
            <img src={logocpgg} alt="CPGG" />
          </div>
          <p className={styles.message}>{checking ? 'Verificando link de recuperação...' : 'Link inválido ou expirado. Solicite um novo link de recuperação.'}</p>
          {!checking && <Button onClick={() => navigate('/sign')}>Solicitar novo link</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HomeButton />
      <div className={styles.content}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>
        
        <div className={styles.formBox}>
          <h1 className={styles.title}>Redefinir Senha</h1>
          <p className={styles.subtitle}>Digite sua nova senha abaixo</p>

          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">Nova Senha</label>
              <input
                id="newPassword"
                type="password"
                placeholder="Digite sua nova senha (mín. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
