import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Edit, Save, X } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from './SeniorResearchers.module.css'
import { researcherData, normalize } from '@/data/researchers'

const staticResearchers = Object.values(researcherData).flat()

const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b"

interface SeniorResearcher {
  id: string
  name: string
  researcher_id: string | null
}

export function SeniorResearchers() {
  const { toast } = useToast()
  const [seniors, setSeniors] = useState<SeniorResearcher[]>([])
  const [allResearchers, setAllResearchers] = useState<any[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    fetchSeniors()
    fetchAllResearchers()
  }, [])

  const fetchSeniors = async () => {
    const { data, error } = await supabase
      .from('senior_researchers')
      .select('id, name, researcher_id')
      .order('name')
    if (!error && data) setSeniors(data)
  }

  const fetchAllResearchers = async () => {
    const { data, error } = await supabase
      .from('researchers')
      .select('id, name')
      .order('name')
    if (!error && data) setAllResearchers(data)
  }

  const findMatchingResearcher = (name: string) => {
    const n = normalize(name)
    return allResearchers.find(r => normalize(r.name) === n)
  }

  const findStaticRoute = (name: string) => {
    const n = normalize(name)
    const match = staticResearchers.find(r => normalize(r.name) === n)
    return match?.route || null
  }

  const getRoute = (sr: SeniorResearcher) => {
    if (sr.researcher_id) return `/researchers/dynamic/${sr.researcher_id}`
    const match = findMatchingResearcher(sr.name)
    if (match) return `/researchers/dynamic/${match.id}`
    return findStaticRoute(sr.name)
  }

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) {
      toast({ title: 'Verificação necessária', description: 'Complete o reCAPTCHA.', variant: 'destructive' })
      return
    }
    setLoginLoading(true)
    try {
      const { data: captchaData, error: captchaError } = await supabase.functions.invoke('verify-recaptcha', { body: { token: captchaToken } })
      if (captchaError || !captchaData?.success) {
        toast({ title: 'Erro', description: 'Falha no reCAPTCHA.', variant: 'destructive' })
        recaptchaRef.current?.reset(); setCaptchaToken(null); return
      }
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
      if (authError) { toast({ title: 'Erro', description: 'Email ou senha incorretos', variant: 'destructive' }); recaptchaRef.current?.reset(); setCaptchaToken(null); return }
      const { data: adminData } = await supabase.from('admin_users').select('role').eq('user_id', authData.user.id).in('role', ['coordenacao', 'secretaria']).maybeSingle()
      if (!adminData) { await supabase.auth.signOut(); toast({ title: 'Erro', description: 'Sem permissão', variant: 'destructive' }); return }
      setIsEditMode(true); setShowLogin(false); setLoginEmail(''); setLoginPassword(''); setCaptchaToken(null); recaptchaRef.current?.reset()
      toast({ title: 'Login realizado', description: 'Modo de edição ativado.' })
    } catch { toast({ title: 'Erro', description: 'Erro interno', variant: 'destructive' }) }
    finally { setLoginLoading(false) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsEditMode(false)
  }

  // Add
  const handleAdd = async () => {
    if (!newName.trim()) return
    const match = findMatchingResearcher(newName.trim())
    const { error } = await supabase.from('senior_researchers').insert({
      name: newName.trim(),
      researcher_id: match?.id || null
    })
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return }
    setNewName('')
    await fetchSeniors()
    toast({ title: 'Adicionado', description: `${newName.trim()} adicionado à lista.` })
  }

  // Delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remover "${name}" da lista de pesquisadores seniores?`)) return
    const { error } = await supabase.from('senior_researchers').delete().eq('id', id)
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return }
    await fetchSeniors()
    toast({ title: 'Removido', description: `${name} removido da lista.` })
  }

  // Update
  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return
    const match = findMatchingResearcher(editingName.trim())
    const { error } = await supabase.from('senior_researchers').update({
      name: editingName.trim(),
      researcher_id: match?.id || null
    }).eq('id', id)
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return }
    setEditingId(null)
    await fetchSeniors()
    toast({ title: 'Atualizado', description: 'Nome atualizado com sucesso.' })
  }

  // Sorted list
  const sortedSeniors = [...seniors].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'visible' }}>
      <Header />
      <div className={`${styles.researchers} hide-earth`} style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
        <div className={styles.Programs}>
          <ul>Pesquisadores Seniores</ul>
          <div className={styles.card}>
            <p className={styles.description}>
              A denominação "pesquisador sênior" foi normatizada pelo Conselho Científico no ano de 2023 a partir da aprovação da Deliberação Normativa 02/2023, em que os critérios para tal classificação são definidos.
            </p>

            {/* Add new - only in edit mode */}
            {isEditMode && (
              <div className="flex gap-2 mb-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome do pesquisador sênior"
                  className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button size="sm" onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            )}

            <ul className={styles.list}>
              {sortedSeniors.map((sr) => {
                const route = getRoute(sr)

                if (isEditMode) {
                  if (editingId === sr.id) {
                    return (
                      <li key={sr.id} className="flex items-center gap-2 py-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 h-8 text-sm bg-white/10 border-white/30 text-white"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(sr.id)}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(sr.id)} className="text-green-400 hover:text-green-300 h-8 w-8 p-0">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/60 hover:text-white h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    )
                  }
                  return (
                    <li key={sr.id} className="flex items-center gap-2 group">
                      <span className={styles.listItem} style={{ flex: 1, cursor: 'default' }}>
                        {sr.name}
                        {route && <span className="text-green-400 text-xs ml-2">(vinculado)</span>}
                        {!route && <span className="text-yellow-400 text-xs ml-2">(sem vínculo)</span>}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(sr.id); setEditingName(sr.name) }} className="text-white/60 hover:text-white h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(sr.id, sr.name)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  )
                }

                // View mode
                return (
                  <li key={sr.id}>
                    {route ? (
                      <Link to={route} className={styles.listItem}>{sr.name}</Link>
                    ) : (
                      <span className={styles.listItem} style={{ cursor: 'default' }}>{sr.name}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Floating edit button */}
      <FloatingEditButton
        isEditMode={isEditMode}
        onClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {/* Login dialog */}
      <Dialog open={showLogin} onOpenChange={(open) => { if (!open) { setShowLogin(false); setLoginEmail(''); setLoginPassword(''); setCaptchaToken(null); recaptchaRef.current?.reset() } }}>
        <DialogContent className="sm:max-w-md max-h-[85vh]">
          <DialogHeader><DialogTitle>Login Administrativo</DialogTitle></DialogHeader>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email:</label>
              <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Digite seu email" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Senha:</label>
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Digite sua senha" required />
            </div>
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'left', marginTop: '8px', marginBottom: '-8px' }}>
              <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token) => setCaptchaToken(token)} onExpired={() => setCaptchaToken(null)} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowLogin(false)} disabled={loginLoading} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={loginLoading || !captchaToken} className="flex-1">{loginLoading ? 'Entrando...' : 'Entrar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FloatingEditButton({ isEditMode, onClick, onLogout }: { isEditMode: boolean; onClick: () => void; onLogout: () => void }) {
  useEffect(() => {
    const oldBtn = document.getElementById('floating-edit-button-senior')
    if (oldBtn) oldBtn.remove()

    const button = document.createElement('button')
    button.id = 'floating-edit-button-senior'
    button.type = 'button'
    button.title = isEditMode ? 'Sair do modo de edição' : 'Editar Pesquisadores Seniores'
    button.innerHTML = isEditMode
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>Sair`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>`

    button.style.cssText = `
      position: fixed !important; bottom: 20px !important; right: 20px !important;
      z-index: 999999999 !important; padding: ${isEditMode ? '10px 16px' : '12px'} !important;
      border-radius: ${isEditMode ? '8px' : '50%'} !important;
      background-color: ${isEditMode ? 'hsl(0 84% 60%)' : 'hsl(262 83% 58%)'} !important;
      color: white !important; border: none !important; cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important; display: flex !important;
      align-items: center !important; justify-content: center !important;
      pointer-events: auto !important; font-family: system-ui, -apple-system, sans-serif !important;
      font-size: 14px !important; font-weight: 500 !important; transition: all 0.2s ease !important;
      width: ${isEditMode ? 'auto' : '48px'} !important; height: 48px !important;
    `

    const handleClick = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); isEditMode ? onLogout() : onClick() }
    button.addEventListener('click', handleClick)
    button.addEventListener('mouseenter', () => { button.style.transform = 'scale(1.05)'; button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)' })
    button.addEventListener('mouseleave', () => { button.style.transform = 'scale(1)'; button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)' })
    document.body.appendChild(button)

    return () => { const btn = document.getElementById('floating-edit-button-senior'); if (btn) btn.remove() }
  }, [isEditMode, onClick, onLogout])

  return null
}
