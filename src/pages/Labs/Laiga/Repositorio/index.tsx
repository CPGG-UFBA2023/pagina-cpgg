import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import styles from './repo.module.css'
import { HomeButton } from '@/components/HomeButton'

type Folder = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

type AccessRow = { id: string; user_id: string; full_name: string; role: string }

export function RepositorioHome() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [folders, setFolders] = useState<Folder[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [showManage, setShowManage] = useState(false)
  const [access, setAccess] = useState<AccessRow[]>([])
  const [newUserEmail, setNewUserEmail] = useState('')
  const [manageMsg, setManageMsg] = useState<string | null>(null)

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      navigate('/labs/laiga/repositorio/login', { replace: true })
      return
    }
    setUserEmail(session.user.email ?? '')
    const { data: allowed } = await supabase.rpc('is_laiga_repo_user')
    if (!allowed) {
      await supabase.auth.signOut()
      navigate('/labs/laiga/repositorio/login', { replace: true })
      return
    }
    const { data } = await supabase
      .from('laiga_repository_folders')
      .select('id, name, created_at, updated_at')
      .order('created_at', { ascending: false })
    setFolders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const loadAccess = async () => {
    const { data } = await supabase
      .from('laiga_repository_access')
      .select('id, user_id, full_name, role')
      .order('created_at')
    setAccess(data ?? [])
  }

  const openManage = async () => {
    setManageMsg(null)
    await loadAccess()
    setShowManage(true)
  }

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('laiga_repository_folders').insert({
      name: newName.trim(),
      created_by: session?.user.id,
    })
    if (!error) {
      setNewName('')
      setShowNew(false)
      load()
    }
  }

  const deleteFolder = async (id: string, name: string) => {
    if (!confirm(`Apagar a pasta "${name}" e todos os seus itens?`)) return
    await supabase.from('laiga_repository_folders').delete().eq('id', id)
    load()
  }

  const authorizeByEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setManageMsg(null)
    const email = newUserEmail.trim().toLowerCase()
    if (!email) return
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, full_name')
      .ilike('email', email)
      .maybeSingle()
    if (!profile?.user_id) {
      setManageMsg('Nenhum usuário do CPGG encontrado com esse e-mail. Peça para se cadastrar primeiro.')
      return
    }
    const { error } = await supabase.from('laiga_repository_access').insert({
      user_id: profile.user_id,
      full_name: profile.full_name,
      role: 'member',
    })
    if (error) {
      setManageMsg(error.message.includes('duplicate') ? 'Este usuário já tem acesso.' : error.message)
      return
    }
    setNewUserEmail('')
    setManageMsg(`${profile.full_name} agora tem acesso ao repositório.`)
    loadAccess()
  }

  const revokeAccess = async (id: string, name: string) => {
    if (!confirm(`Remover o acesso de ${name}?`)) return
    await supabase.from('laiga_repository_access').delete().eq('id', id)
    loadAccess()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/labs/laiga/repositorio/login', { replace: true })
  }

  const sorted = [...folders].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'pt-BR')
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (loading) return <div className={styles.wrapper}><HomeButton /><p>Carregando...</p></div>

  return (
    <div className={styles.wrapper}>
      <HomeButton />
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Repositório LAIGA</h1>
          <div className={styles.subtitle}>Álbuns de empréstimos de equipamentos</div>
        </div>
        <div className={styles.actions}>
          <span className={styles.userChip}>{userEmail}</span>
          <button className={styles.btn} onClick={() => setShowNew(true)}>+ Nova pasta</button>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={openManage}>Usuários</button>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={logout}>Sair</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.sortGroup}>
          <span>Ordenar por:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}>
            <option value="date">Data de criação</option>
            <option value="name">Nome</option>
          </select>
        </div>
        <div className={styles.subtitle}>{folders.length} pasta(s)</div>
      </div>

      {sorted.length === 0 ? (
        <div className={styles.empty}>Nenhuma pasta ainda. Crie a primeira em "+ Nova pasta".</div>
      ) : (
        <div className={styles.grid}>
          {sorted.map((f) => (
            <div key={f.id} className={styles.folderCard} onClick={() => navigate(`/labs/laiga/repositorio/pasta/${f.id}`)}>
              <button
                className={styles.cardDelete}
                onClick={(e) => { e.stopPropagation(); deleteFolder(f.id, f.name) }}
                aria-label="Apagar pasta"
              >×</button>
              <div className={styles.folderIcon}>📁</div>
              <div className={styles.folderName}>{f.name}</div>
              <div className={styles.folderMeta}>
                Criada em {new Date(f.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className={styles.modalOverlay} onClick={() => setShowNew(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Nova pasta</h2>
            <form onSubmit={createFolder}>
              <div className={styles.field}>
                <label>Nome da pasta</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Empréstimo Prof. Fulano - abril/2026"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={() => setShowNew(false)}>Cancelar</button>
                <button type="submit" className={styles.btn}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManage && (
        <div className={styles.modalOverlay} onClick={() => setShowManage(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Usuários autorizados</h2>
            {manageMsg && <div className={styles.error} style={{ background: 'rgba(124,77,255,0.15)', borderColor: 'rgba(124,77,255,0.4)', color: '#e0d4ff' }}>{manageMsg}</div>}
            <form onSubmit={authorizeByEmail} style={{ marginBottom: 20 }}>
              <div className={styles.field}>
                <label>Autorizar novo usuário (e-mail já cadastrado no CPGG)</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ex: michel.nascimento@ufba.br"
                />
              </div>
              <button type="submit" className={styles.btn}>Autorizar</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {access.map((u) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{u.role}</div>
                  </div>
                  {u.role !== 'coordinator' && (
                    <button className={`${styles.btn} ${styles.danger} ${styles.small}`} onClick={() => revokeAccess(u.id, u.full_name)}>Remover</button>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={() => setShowManage(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
