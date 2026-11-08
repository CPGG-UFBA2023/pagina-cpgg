import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAccessPermissions } from '@/hooks/useAccessPermissions'
import { permissionGroups, mayChangePermission, type Permissions, type PermissionKey } from '@/lib/accessPermissions'
import { supabase } from '@/integrations/supabase/client'
import logo from '@/assets/cpgg-logo.jpg'
import styles from './access.module.css'

interface Person { id: string; user_id: string | null; name: string; email: string | null; category: string; permissions: Permissions }
interface Change { person: Person; key: PermissionKey; allowed: boolean }

export function AccessManagement() {
  const [people, setPeople] = useState<Person[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<Change | null>(null)
  const { permissions, userId } = useAccessPermissions()
  const { toast } = useToast()
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase.rpc('list_access_people')
    if (loadError) setError('Não foi possível carregar os acessos. Verifique sua autorização e tente novamente.')
    else if (Array.isArray(data)) setPeople(data as unknown as Person[])
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  const save = async ({ person, key, allowed }: Change) => {
    if (!userId || !person.user_id || !mayChangePermission(permissions, userId, person.user_id, key, allowed)) return
    setSaving(`${person.id}:${key}`)
    const { error: saveError } = await supabase.rpc('set_access_permission', { _user_id: person.user_id, _permission: key, _allowed: allowed })
    if (saveError) toast({ title: 'Alteração não realizada', description: saveError.message, variant: 'destructive' })
    else {
      await load()
      window.dispatchEvent(new Event('access-permissions-changed'))
      toast({ title: 'Permissão atualizada', description: `${person.name}: acesso ${allowed ? 'liberado' : 'removido'}.` })
    }
    setSaving(null)
  }
  const change = (person: Person, key: PermissionKey, allowed: boolean) => {
    const next = { person, key, allowed }
    if (key === 'access') setConfirmation(next)
    else void save(next)
  }
  const normalized = search.trim().toLocaleLowerCase('pt-BR')
  const filtered = people.filter(person => (category === 'all' || person.category === category) && `${person.name} ${person.email ?? ''}`.toLocaleLowerCase('pt-BR').includes(normalized))

  return <div className={styles.page}><div className={styles.inner}>
    <div className={styles.header}><img src={logo} alt="CPGG" className={styles.logo} /><Button variant="outline" onClick={() => navigate('/adm/painel')}><ArrowLeft size={16} className="mr-2" />Voltar ao painel</Button></div>
    <h1 className={styles.title}><ShieldCheck className="inline-block mr-2" size={28} />Acessos e privilégios</h1>
    <div className={styles.toolbar}>
      <div className={`relative ${styles.search}`}><Search className="absolute left-3 top-3 text-muted-foreground" size={16} /><Input aria-label="Buscar pessoa" placeholder="Buscar por nome ou e-mail" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-[190px]" aria-label="Filtrar categoria"><SelectValue /></SelectTrigger><SelectContent>{['all', 'Administração', 'Secretaria', 'TI', 'Técnico', 'Pesquisador', 'Usuário'].map(value => <SelectItem key={value} value={value}>{value === 'all' ? 'Todas as pessoas' : value}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" size="icon" aria-label="Atualizar lista" title="Atualizar lista" disabled={loading || saving !== null} onClick={() => void load()}><RefreshCw size={18} /></Button>
      <span className="text-sm text-muted-foreground">{filtered.length} pessoas</span>
    </div>
    {error ? <div role="alert" className={styles.notice}>{error}</div> : loading && people.length === 0 ? <div role="status" className={styles.notice}>Carregando pessoas…</div> : filtered.length === 0 ? <div className={styles.notice}>Nenhuma pessoa encontrada.</div> : permissionGroups.map(group => <section className={styles.group} key={group.label}>
      <h2 className={styles.groupTitle}>{group.label}</h2>
      <div className={styles.tableWrap}><table className={styles.table} aria-label={group.label}><thead><tr><th scope="col">Pessoa</th>{group.items.map(([key, label]) => <th scope="col" key={key}>{label}</th>)}</tr></thead><tbody>{filtered.map(person => <tr key={person.id}>
        <td><div className={styles.name}>{person.name}</div><div className={styles.detail}>{person.category}{!person.user_id ? ' · Sem conta cadastrada' : ''}</div><div className={styles.detail}>{person.email}</div></td>
        {group.items.map(([key, label]) => <td key={key}><Checkbox className="h-5 w-5" aria-label={`${label} — ${person.name}`} checked={person.permissions[key] === true} disabled={!person.user_id || saving !== null || permissions.access !== true || (key === 'access' && person.user_id === userId)} onCheckedChange={value => change(person, key, value === true)} />{saving === `${person.id}:${key}` && <span role="status" className="sr-only">Salvando</span>}</td>)}
      </tr>)}</tbody></table></div>
    </section>)}
    <AlertDialog open={confirmation !== null} onOpenChange={open => { if (!open) setConfirmation(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmation?.allowed ? 'Conceder administração de acessos?' : 'Remover administração de acessos?'}</AlertDialogTitle><AlertDialogDescription>{confirmation?.person.name}{confirmation?.allowed ? ' poderá conceder e remover privilégios de outras pessoas.' : ' deixará de poder alterar privilégios de outras pessoas.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (confirmation) void save(confirmation); setConfirmation(null) }}>Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div></div>
}