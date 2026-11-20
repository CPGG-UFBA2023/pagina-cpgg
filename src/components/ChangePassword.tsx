import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createPasswordChange } from '@/lib/changePassword';
import styles from './ChangePassword.module.css';

export function ChangePassword() {
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const change = useRef(createPasswordChange(attributes => supabase.auth.updateUser(attributes)));
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (mounted) setSignedIn(Boolean(data.user) && !error);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    void check();
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);
  if (!signedIn || location.pathname === '/reset-password') return null;
  return <>
    <Button variant="outline" className={`${styles.trigger} gap-2 bg-background text-foreground shadow-sm`} onClick={() => { setMessage(''); setOpen(true); }}><KeyRound className="h-4 w-4" />Alterar senha</Button>
    <Dialog open={open} onOpenChange={value => { if (!pending) { setOpen(value); setCurrent(''); setPassword(''); setConfirmation(''); } }}>
      <DialogContent className={styles.dialog}>
        <DialogHeader><DialogTitle>Alterar senha</DialogTitle><DialogDescription>Senha atual e nova senha</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={async event => {
          event.preventDefault();
          if (pending) return;
          setPending(true); setMessage('');
          try {
            const { error, skipped } = await change.current(current, password, confirmation);
            if (skipped) return;
            if (error) { setMessage('Não foi possível alterar a senha. Confira a senha atual e a confirmação da nova senha.'); return; }
            setCurrent(''); setPassword(''); setConfirmation(''); setMessage('Senha alterada com sucesso.');
          } catch { setMessage('Não foi possível alterar a senha. Tente novamente.'); }
          finally { setPending(false); }
        }}>
          <label className="grid gap-2" htmlFor="change-current">Senha atual<Input id="change-current" type="password" autoComplete="current-password" required disabled={pending} value={current} onChange={e => setCurrent(e.target.value)} /></label>
          <label className="grid gap-2" htmlFor="change-new">Nova senha<Input id="change-new" type="password" autoComplete="new-password" minLength={6} required disabled={pending} value={password} onChange={e => setPassword(e.target.value)} /></label>
          <label className="grid gap-2" htmlFor="change-confirm">Confirmar nova senha<Input id="change-confirm" type="password" autoComplete="new-password" minLength={6} required disabled={pending} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
          {message && <p role="status" className="text-sm text-foreground">{message}</p>}
          <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar nova senha'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}