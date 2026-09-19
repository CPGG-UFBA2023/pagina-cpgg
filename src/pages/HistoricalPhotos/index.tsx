import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { BackButtonPhotos } from '../../components/BackButtonPhotos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AdminLoginEvents } from '../Photos/EventManager/components/AdminLoginEvents'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import styles from './HistoricalPhotos.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface HistoricalAlbum {
  id: string
  name: string
  event_date: string | null
  display_date: boolean
}

export function HP() {
  const { t } = useLanguage()
  const [albums, setAlbums] = useState<HistoricalAlbum[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', event_date: '' })
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id,name,event_date,display_date')
      .eq('category', 'historical')
      .order('event_date', { ascending: true })
    if (!error) setAlbums(data || [])
  }

  useEffect(() => {
    fetchAlbums()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: role } = await supabase.rpc('get_admin_role')
      setIsAuthenticated(role === 'coordenacao' || role === 'ti' || role === 'secretaria')
    })
  }, [])

  const requestCreate = () => {
    if (!isAuthenticated) setShowLogin(true)
    else setShowCreate(true)
  }

  const createAlbum = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const { data: createdAlbum, error } = await supabase.from('events').insert([{
      name: form.name.trim(),
      event_date: form.event_date || null,
      category: 'historical',
      display_date: Boolean(form.event_date),
    }]).select('id').single()
    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível criar o subálbum.', variant: 'destructive' })
      return
    }
    if (!createdAlbum) {
      toast({ title: 'Erro', description: 'O subálbum foi criado, mas não pôde ser aberto.', variant: 'destructive' })
      return
    }
    setForm({ name: '', event_date: '' })
    setShowCreate(false)
    toast({ title: 'Subálbum criado', description: 'Agora adicione e organize as fotos.' })
    navigate(`/Photos/HistoricalPhotos/Album/${createdAlbum.id}?edit=1`)
  }

  const deleteAlbum = async (album: HistoricalAlbum) => {
    if (!confirm(`Apagar o subálbum “${album.name}” e todas as fotos dele?`)) return
    const { error } = await supabase.from('events').delete().eq('id', album.id).eq('category', 'historical')
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível apagar o subálbum.', variant: 'destructive' })
      return
    }
    fetchAlbums()
  }

  return (
    <div className={`${styles.pageContainer} historical-photos-page`}>
      <Header />
      <BackButtonPhotos />
      <main className={`middle ${styles.hp}`}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('photos.historicalTitle')}</h1>
          <Button size="sm" onClick={requestCreate}><Plus className="w-4 h-4 mr-1" /> Novo subálbum</Button>
        </div>
        <div className={styles.container}>
          {albums.map((album, index) => (
            <div className={styles.cardWrapper} key={album.id}>
              <Link className={styles.card} to={`/Photos/HistoricalPhotos/Album/${album.id}`}>
                <div className={index % 2 === 0 ? styles.Latin : styles.Yeda}>
                  <h2>{album.name}</h2>
                </div>
              </Link>
              {isAuthenticated && (
                <Button aria-label={`Apagar ${album.name}`} className={styles.deleteButton} size="sm" variant="destructive" onClick={() => deleteAlbum(album)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className={styles.compactDialog}>
          <DialogHeader><DialogTitle>Novo subálbum histórico</DialogTitle></DialogHeader>
          <form onSubmit={createAlbum} className="space-y-4 overflow-y-auto">
            <div><Label htmlFor="historical-name">Nome do evento</Label><Input id="historical-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label htmlFor="historical-date">Data do evento (opcional)</Label><Input id="historical-date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Criar'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminLoginEvents isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={() => { setIsAuthenticated(true); setShowLogin(false); setShowCreate(true) }} />
      <Footer />
    </div>
  )
}