import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Edit, Save, X, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Laboratory {
  id: string
  acronym: string
  name: string
}

interface Equipment {
  id: string
  laboratory_id: string
  name: string
  description?: string | null
  brand?: string | null
  model?: string | null
  serial_number?: string | null
  location?: string | null
  responsible_person?: string | null
  status: string
  observations?: string | null
}

type NewEquipment = Omit<Equipment, 'id'>

const emptyForm = (laboratory_id = ''): NewEquipment => ({
  laboratory_id,
  name: '',
  description: '',
  brand: '',
  model: '',
  serial_number: '',
  location: '',
  responsible_person: '',
  status: 'available',
  observations: '',
})

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponível',
  in_use: 'Em Uso',
  maintenance: 'Manutenção',
  unavailable: 'Indisponível',
}

export function EquipamentosLabs() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [labs, setLabs] = useState<Laboratory[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [form, setForm] = useState<NewEquipment>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Equipment>>({})

  useEffect(() => {
    const userData = sessionStorage.getItem('admin_user')
    if (!userData) {
      navigate('/adm/coordenacao')
      return
    }
    const parsed = JSON.parse(userData)
    if (parsed.role !== 'coordenacao' && parsed.role !== 'secretaria') {
      navigate('/adm/coordenacao')
      return
    }
    fetchAll()
  }, [navigate])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: labsData, error: labsErr }, { data: eqData, error: eqErr }] = await Promise.all([
        supabase.from('laboratories').select('id, acronym, name').order('acronym'),
        supabase.from('laboratory_equipments').select('*').order('name'),
      ])
      if (labsErr) throw labsErr
      if (eqErr) throw eqErr
      setLabs(labsData || [])
      setEquipments(eqData || [])
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome do equipamento é obrigatório', variant: 'destructive' })
      return
    }
    try {
      const payload = { ...form, laboratory_id: addingFor! }
      const { data, error } = await supabase
        .from('laboratory_equipments')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      setEquipments(prev => [...prev, data as Equipment])
      setAddingFor(null)
      setForm(emptyForm())
      toast({ title: 'Sucesso', description: 'Equipamento adicionado.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este equipamento?')) return
    try {
      const { error } = await supabase.from('laboratory_equipments').delete().eq('id', id)
      if (error) throw error
      setEquipments(prev => prev.filter(e => e.id !== id))
      toast({ title: 'Excluído', description: 'Equipamento removido.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const startEdit = (eq: Equipment) => {
    setEditingId(eq.id)
    setEditData({ ...eq })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    try {
      const { error } = await supabase
        .from('laboratory_equipments')
        .update(editData)
        .eq('id', editingId)
      if (error) throw error
      setEquipments(prev => prev.map(e => (e.id === editingId ? { ...e, ...editData } as Equipment : e)))
      setEditingId(null)
      setEditData({})
      toast({ title: 'Salvo', description: 'Equipamento atualizado.' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return <div style={{ padding: 40, color: 'white' }}>Carregando...</div>
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', color: 'white' }}>
      <Button
        onClick={() => navigate('/adm/coordenacao/dashboard')}
        style={{ marginBottom: 20, backgroundColor: '#592cbb', color: 'white' }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
      </Button>

      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 'bold', marginBottom: 30, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        Equipamentos dos Laboratórios
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        {labs.map(lab => {
          const labEquips = equipments.filter(e => e.laboratory_id === lab.id)
          const isAdding = addingFor === lab.id
          return (
            <Card key={lab.id} style={{ background: 'rgba(255,255,255,0.95)', color: '#222' }}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FlaskConical size={20} color="#592cbb" />
                    {lab.acronym} — {lab.name}
                    <span style={{ fontSize: 13, color: '#666', fontWeight: 'normal' }}>
                      ({labEquips.length} equipamento{labEquips.length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                  {!isAdding && (
                    <Button
                      size="sm"
                      onClick={() => { setAddingFor(lab.id); setForm(emptyForm(lab.id)) }}
                      style={{ backgroundColor: '#592cbb', color: 'white' }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Adicionar equipamento
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isAdding && (
                  <div style={{ border: '2px dashed #592cbb', padding: 16, borderRadius: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    <Input placeholder="Nome*" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder="Marca" value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} />
                    <Input placeholder="Modelo" value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} />
                    <Input placeholder="Nº de Série" value={form.serial_number || ''} onChange={e => setForm({ ...form, serial_number: e.target.value })} />
                    <Input placeholder="Localização" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
                    <Input placeholder="Responsável" value={form.responsible_person || ''} onChange={e => setForm({ ...form, responsible_person: e.target.value })} />
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea placeholder="Descrição" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} style={{ gridColumn: '1 / -1' }} />
                    <Textarea placeholder="Observações" value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} style={{ gridColumn: '1 / -1' }} />
                    <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                      <Button size="sm" onClick={handleAdd} style={{ backgroundColor: '#592cbb', color: 'white' }}>
                        <Save className="w-4 h-4 mr-1" /> Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddingFor(null); setForm(emptyForm()) }}>
                        <X className="w-4 h-4 mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {labEquips.length === 0 && !isAdding && (
                  <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>Nenhum equipamento cadastrado.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {labEquips.map(eq => (
                    <div key={eq.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
                      {editingId === eq.id ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                          <Input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Nome" />
                          <Input value={editData.brand || ''} onChange={e => setEditData({ ...editData, brand: e.target.value })} placeholder="Marca" />
                          <Input value={editData.model || ''} onChange={e => setEditData({ ...editData, model: e.target.value })} placeholder="Modelo" />
                          <Input value={editData.serial_number || ''} onChange={e => setEditData({ ...editData, serial_number: e.target.value })} placeholder="Nº Série" />
                          <Input value={editData.location || ''} onChange={e => setEditData({ ...editData, location: e.target.value })} placeholder="Localização" />
                          <Input value={editData.responsible_person || ''} onChange={e => setEditData({ ...editData, responsible_person: e.target.value })} placeholder="Responsável" />
                          <Select value={editData.status || 'available'} onValueChange={v => setEditData({ ...editData, status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Descrição" style={{ gridColumn: '1 / -1' }} />
                          <Textarea value={editData.observations || ''} onChange={e => setEditData({ ...editData, observations: e.target.value })} placeholder="Observações" style={{ gridColumn: '1 / -1' }} />
                          <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
                            <Button size="sm" onClick={handleSaveEdit} style={{ backgroundColor: '#592cbb', color: 'white' }}>
                              <Save className="w-4 h-4 mr-1" /> Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditData({}) }}>
                              <X className="w-4 h-4 mr-1" /> Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 240 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15 }}>{eq.name}</div>
                            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                              {[eq.brand, eq.model].filter(Boolean).join(' · ')}
                              {eq.serial_number ? ` · S/N: ${eq.serial_number}` : ''}
                            </div>
                            {eq.description && <div style={{ fontSize: 13, marginTop: 4 }}>{eq.description}</div>}
                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                              {eq.location && <>📍 {eq.location} </>}
                              {eq.responsible_person && <> · 👤 {eq.responsible_person} </>}
                              · <span style={{ fontWeight: 600 }}>{STATUS_LABEL[eq.status] || eq.status}</span>
                            </div>
                            {eq.observations && <div style={{ fontSize: 12, color: '#777', marginTop: 4, fontStyle: 'italic' }}>{eq.observations}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Button size="sm" variant="outline" onClick={() => startEdit(eq)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(eq.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
