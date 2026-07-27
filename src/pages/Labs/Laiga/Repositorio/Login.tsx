import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import styles from './repo.module.css'
import { HomeButton } from '@/components/HomeButton'

export function RepositorioLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || !mounted) return
      const { data } = await supabase
        .from('laiga_repository_access')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()
      if (data && mounted) navigate('/labs/laiga/repositorio', { replace: true })
    }
    check()
    return () => { mounted = false }
  }, [navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signErr || !signIn.user) {
        setError('E-mail ou senha inválidos.')
        return
      }
      const { data: access } = await supabase
        .from('laiga_repository_access')
        .select('id')
        .eq('user_id', signIn.user.id)
        .maybeSingle()
      if (!access) {
        await supabase.auth.signOut()
        setError('Este usuário não tem acesso ao Repositório do LAIGA.')
        return
      }
      navigate('/labs/laiga/repositorio', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <HomeButton />
      <div className={styles.loginCard}>
        <h1>Repositório LAIGA</h1>
        <p>Área restrita ao coordenador e ao técnico do laboratório.</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className={styles.field}>
            <label>E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button className={styles.btn} type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
