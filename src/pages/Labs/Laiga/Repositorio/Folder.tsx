import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import styles from './repo.module.css'
import { HomeButton } from '@/components/HomeButton'

type Item = {
  id: string
  professor_name: string
  checkout_date: string
  returned_at: string | null
  photo_urls: string[]
  notes: string | null
}

type FolderRow = { id: string; name: string }

export function RepositorioFolder() {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const [folder, setFolder] = useState<FolderRow | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const [prof, setProf] = useState('')
  const [checkout, setCheckout] = useState(new Date().toISOString().slice(0, 10))
  const [files, setFiles] = useState<FileList | null>(null)
  const [notes, setNotes] = useState('')

  const guard = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { navigate('/labs/laiga/repositorio/login', { replace: true }); return false }
    const { data: a } = await supabase.from('laiga_repository_access').select('id').eq('user_id', session.user.id).maybeSingle()
    if (!a) { await supabase.auth.signOut(); navigate('/labs/laiga/repositorio/login', { replace: true }); return false }
    return true
  }

  const signAll = async (paths: string[]) => {
    if (paths.length === 0) return
    const { data } = await supabase.storage.from('laiga-repository').createSignedUrls(paths, 60 * 60)
    if (data) {
      setSignedUrls((prev) => {
        const next = { ...prev }
        data.forEach((s) => { if (s.signedUrl && s.path) next[s.path] = s.signedUrl })
        return next
      })
    }
  }

  const load = async () => {
    if (!folderId) return
    if (!(await guard())) return
    const { data: f } = await supabase.from('laiga_repository_folders').select('id, name').eq('id', folderId).maybeSingle()
    if (!f) { navigate('/labs/laiga/repositorio', { replace: true }); return }
    setFolder(f)
    const { data } = await supabase
      .from('laiga_repository_items')
      .select('id, professor_name, checkout_date, returned_at, photo_urls, notes')
      .eq('folder_id', folderId)
      .order('checkout_date', { ascending: false })
    const list = data ?? []
    setItems(list)
    const paths = list.flatMap((i) => i.photo_urls ?? [])
    signAll(paths)
    setLoading(false)
  }

  useEffect(() => { load() }, [folderId])

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderId || !prof.trim()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session!.user.id
      const paths: string[] = []
      if (files) {
        for (const file of Array.from(files)) {
          const ext = file.name.split('.').pop() || 'jpg'
          const path = `${folderId}/${crypto.randomUUID()}.${ext}`
          const { error } = await supabase.storage.from('laiga-repository').upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          })
          if (!error) paths.push(path)
        }
      }
      await supabase.from('laiga_repository_items').insert({
        folder_id: folderId,
        professor_name: prof.trim(),
        checkout_date: checkout,
        photo_urls: paths,
        notes: notes.trim() || null,
        created_by: uid,
      })
      setProf(''); setFiles(null); setNotes(''); setShowNew(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const toggleReturned = async (item: Item) => {
    const newReturn = item.returned_at ? null : new Date().toISOString().slice(0, 10)
    await supabase.from('laiga_repository_items').update({ returned_at: newReturn }).eq('id', item.id)
    load()
  }

  const removeItem = async (item: Item) => {
    if (!confirm(`Apagar o registro de ${item.professor_name}?`)) return
    if (item.photo_urls?.length) {
      await supabase.storage.from('laiga-repository').remove(item.photo_urls)
    }
    await supabase.from('laiga_repository_items').delete().eq('id', item.id)
    load()
  }

  if (loading) return <div className={styles.wrapper}><HomeButton /><p>Carregando...</p></div>

  return (
    <div className={styles.wrapper}>
      <HomeButton />
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{folder?.name}</h1>
          <div className={styles.subtitle}>Repositório LAIGA</div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={() => navigate('/labs/laiga/repositorio')}>← Pastas</button>
          <button className={styles.btn} onClick={() => setShowNew(true)}>+ Novo registro</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>Nenhum equipamento registrado nesta pasta ainda.</div>
      ) : (
        <div className={styles.itemList}>
          {items.map((it) => (
            <div key={it.id} className={styles.itemCard}>
              <div className={styles.itemPhotos}>
                {it.photo_urls?.length ? it.photo_urls.map((p) => (
                  <a key={p} href={signedUrls[p]} target="_blank" rel="noreferrer">
                    <img src={signedUrls[p]} alt="equipamento" />
                  </a>
                )) : <div style={{ fontSize: 12, opacity: 0.6 }}>Sem foto</div>}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.profName}>{it.professor_name}</div>
                <div className={styles.dateLine}>Retirada: {new Date(it.checkout_date + 'T00:00').toLocaleDateString('pt-BR')}</div>
                {it.returned_at ? (
                  <div className={`${styles.dateLine} ${styles.returned}`}>
                    ✓ Devolvido em {new Date(it.returned_at + 'T00:00').toLocaleDateString('pt-BR')}
                  </div>
                ) : (
                  <div className={`${styles.dateLine} ${styles.notReturned}`}>Não devolvido</div>
                )}
                {it.notes && <div className={styles.dateLine} style={{ opacity: 0.75 }}>{it.notes}</div>}
              </div>
              <div className={styles.itemActions}>
                <button className={`${styles.btn} ${styles.small}`} onClick={() => toggleReturned(it)}>
                  {it.returned_at ? 'Desmarcar' : 'Marcar devolvido'}
                </button>
                <button className={`${styles.btn} ${styles.danger} ${styles.small}`} onClick={() => removeItem(it)}>Apagar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className={styles.modalOverlay} onClick={() => setShowNew(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Novo registro de empréstimo</h2>
            <form onSubmit={addItem}>
              <div className={styles.field}>
                <label>Nome do professor</label>
                <input value={prof} onChange={(e) => setProf(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label>Data de retirada</label>
                <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label>Fotos do equipamento</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
              </div>
              <div className={styles.field}>
                <label>Observações (opcional)</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={() => setShowNew(false)} disabled={saving}>Cancelar</button>
                <button type="submit" className={styles.btn} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
