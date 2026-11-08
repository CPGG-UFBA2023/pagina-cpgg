import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccessPermissions } from '@/hooks/useAccessPermissions'
import { permissionGroups } from '@/lib/accessPermissions'
import { supabase } from '@/integrations/supabase/client'
import logo from '@/assets/cpgg-logo.jpg'
import styles from './access.module.css'

export function AdminWorkspace() {
  const { permissions } = useAccessPermissions()
  const navigate = useNavigate()
  return <div className={styles.page}><div className={styles.inner}>
    <div className={styles.header}><img src={logo} alt="CPGG" className={styles.logo} /><div className="flex gap-2 flex-wrap"><Button variant="outline" onClick={() => navigate('/adm')}><ArrowLeft size={16} className="mr-2" />Adm</Button><Button variant="outline" onClick={async () => { await supabase.auth.signOut(); sessionStorage.removeItem('admin_user'); navigate('/adm') }}><LogOut size={16} className="mr-2" />Sair</Button></div></div>
    <h1 className={styles.title}>Painel administrativo</h1>
    {permissionGroups.map(group => {
      const items = group.items.filter(([key]) => permissions[key] === true)
      if (!items.length) return null
      return <section key={group.label} className={styles.group}><h2 className={styles.groupTitle}>{group.label}</h2><div className={styles.links}>{items.map(([key, label, path]) => <Button variant={key === 'access' ? 'default' : 'outline'} className={styles.link} key={key} onClick={() => navigate(path)}>{key === 'access' && <ShieldCheck size={18} className="mr-2" />}{label}</Button>)}</div></section>
    })}
    {permissions.people && <Button variant="outline" onClick={() => navigate('/adm/coordenacao/pesquisadores')}>Gerenciar pesquisadores</Button>}
    {permissions.equipment && <Button variant="outline" className="ml-2" onClick={() => navigate('/adm/coordenacao/equipamentos-laiga')}>Equipamentos LAIGA</Button>}
  </div></div>
}