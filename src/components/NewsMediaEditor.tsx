import { useEffect, useRef, useState } from 'react'
import { FilePlus2, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AdminAuthDialog } from '@/components/AdminAuthDialog'

export interface NewsMedia {
  id: string
  photo1_url: string | null
  photo2_url: string | null
  photo3_url: string | null
  pdf1_url: string | null
  pdf1_title: string | null
  pdf2_url: string | null
  pdf2_title: string | null
  pdf3_url: string | null
  pdf3_title: string | null
}

interface Props {
  news: NewsMedia
  onSaved: () => void
}

const SLOTS = [1, 2, 3] as const

export function NewsMediaEditor({ news, onSaved }: Props) {
  const [showLogin, setShowLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [titles, setTitles] = useState<Record<number, string>>({})
  const photoInputs = useRef<Record<number, HTMLInputElement | null>>({})
  const pdfInputs = useRef<Record<number, HTMLInputElement | null>>({})
  const { toast } = useToast()

  useEffect(() => {
    setTitles({
      1: news.pdf1_title || '',
      2: news.pdf2_title || '',
      3: news.pdf3_title || '',
    })
  }, [news])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: admin } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.session.user.id)
        .maybeSingle()
      if (admin?.role === 'coordenacao' || admin?.role === 'secretaria') setIsAdmin(true)
    })
  }, [])

  const update = async (patch: Record<string, string | null>) => {
    const { error } = await supabase.from('news').update(patch).eq('id', news.id)
    if (error) throw new Error(error.message)
    onSaved()
  }

  const upload = async (file: File, prefix: string) => {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const path = `news/${prefix}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('news-photos')
      .upload(path, file, { upsert: false, contentType: file.type || undefined })
    if (error) throw new Error(error.message)
    return supabase.storage.from('news-photos').getPublicUrl(path).data.publicUrl
  }

  const run = async (key: string, fn: () => Promise<void>, okMsg: string) => {
    setBusy(key)
    try {
      await fn()
      toast({ title: 'Atualizado', description: okMsg })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Não foi possível salvar.', variant: 'destructive' })
    } finally {
      setBusy(null)
    }
  }

  const handleSuccess = (role: string) => {
    if (role === 'coordenacao' || role === 'secretaria') {
      setIsAdmin(true)
      setShowLogin(false)
      setShowPanel(true)
    } else {
      toast({ title: 'Acesso negado', description: 'Você não tem permissão para editar esta notícia.', variant: 'destructive' })
    }
  }

  const photoUrl = (i: number) => (news as any)[`photo${i}_url`] as string | null
  const pdfUrl = (i: number) => (news as any)[`pdf${i}_url`] as string | null

  return (
    <>
      <button
        type="button"
        onClick={() => (isAdmin ? setShowPanel(true) : setShowLogin(true))}
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '96px',
          zIndex: 2147483000,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#ffffff',
          background: 'linear-gradient(90deg, #592cbb 0%, #7c4dff 100%)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
        }}
      >
        <ImagePlus size={16} />
        Editar mídias
      </button>

      <AdminAuthDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleSuccess}
        requiredRole="any"
        title="Login Administrativo - Mídias da notícia"
      />

      <Dialog open={showPanel} onOpenChange={setShowPanel}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar fotos e PDFs da notícia</DialogTitle>
            <DialogDescription>
              Troque, atualize ou remova os arquivos exibidos nesta notícia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Fotos</h3>
              {SLOTS.map((i) => (
                <div key={`p${i}`} className="flex items-center gap-3 border rounded-md p-3">
                  {photoUrl(i) ? (
                    <img src={photoUrl(i)!} alt={`Foto ${i}`} className="w-20 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      vazio
                    </div>
                  )}
                  <div className="flex-1 text-sm">Foto {i}</div>
                  <input
                    ref={(el) => (photoInputs.current[i] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (!file) return
                      run(`p${i}`, async () => {
                        const url = await upload(file, `photo${i}`)
                        await update({ [`photo${i}_url`]: url })
                      }, `Foto ${i} atualizada.`)
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === `p${i}`}
                    onClick={() => photoInputs.current[i]?.click()}
                  >
                    {busy === `p${i}` ? <Loader2 className="animate-spin" size={14} /> : <ImagePlus size={14} />}
                    <span className="ml-1">{photoUrl(i) ? 'Trocar' : 'Adicionar'}</span>
                  </Button>
                  {photoUrl(i) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy === `p${i}`}
                      onClick={() => run(`p${i}`, () => update({ [`photo${i}_url`]: null }), `Foto ${i} removida.`)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">PDFs</h3>
              {SLOTS.map((i) => (
                <div key={`d${i}`} className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-sm truncate">
                      PDF {i}:{' '}
                      {pdfUrl(i) ? (
                        <a href={pdfUrl(i)!} target="_blank" rel="noopener noreferrer" className="underline">
                          ver arquivo atual
                        </a>
                      ) : (
                        <span className="text-muted-foreground">vazio</span>
                      )}
                    </div>
                    <input
                      ref={(el) => (pdfInputs.current[i] = el)}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file) return
                        run(`d${i}`, async () => {
                          const url = await upload(file, `pdf${i}`)
                          await update({
                            [`pdf${i}_url`]: url,
                            [`pdf${i}_title`]: (titles[i] || '').trim() || file.name.replace(/\.pdf$/i, ''),
                          })
                        }, `PDF ${i} atualizado.`)
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === `d${i}`}
                      onClick={() => pdfInputs.current[i]?.click()}
                    >
                      {busy === `d${i}` ? <Loader2 className="animate-spin" size={14} /> : <FilePlus2 size={14} />}
                      <span className="ml-1">{pdfUrl(i) ? 'Trocar' : 'Adicionar'}</span>
                    </Button>
                    {pdfUrl(i) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy === `d${i}`}
                        onClick={() =>
                          run(`d${i}`, () => update({ [`pdf${i}_url`]: null, [`pdf${i}_title`]: null }), `PDF ${i} removido.`)
                        }
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={titles[i] ?? ''}
                      placeholder={`Título do PDF ${i}`}
                      onChange={(e) => setTitles((prev) => ({ ...prev, [i]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      disabled={busy === `t${i}` || !pdfUrl(i)}
                      onClick={() =>
                        run(`t${i}`, () => update({ [`pdf${i}_title`]: (titles[i] || '').trim() || null }), `Título do PDF ${i} salvo.`)
                      }
                    >
                      {busy === `t${i}` ? <Loader2 className="animate-spin" size={14} /> : 'Salvar título'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
