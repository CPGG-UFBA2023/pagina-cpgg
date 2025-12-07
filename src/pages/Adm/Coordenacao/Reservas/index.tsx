import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { LogOut, Download, FileText, BarChart3, Calendar, User, MapPin, Clock, ArrowLeft, Edit, Save, X, Trash2, Undo2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import logocpgg from '@/assets/cpgg-logo.jpg'
import styles from './reservas.module.css'

interface Reservation {
  id: string
  nome: string
  sobrenome: string
  email: string
  uso: string
  tipo_reserva: string
  inicio: string
  termino: string
  status: string
  created_at: string
  equipamento?: string
}

interface AdminUser {
  id: string
  email: string
  role: string
}

export function ReservasAdmin() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [physicalSpaceReservations, setPhysicalSpaceReservations] = useState<Reservation[]>([])
  const [laboratoryReservations, setLaboratoryReservations] = useState<Reservation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLab, setFilterLab] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Reservation>>({})
  const [deletedReservations, setDeletedReservations] = useState<Reservation[]>([])
  const [lastDeleteType, setLastDeleteType] = useState<string | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  useEffect(() => {
    const userData = sessionStorage.getItem('admin_user')
    if (userData) {
      setAdminUser(JSON.parse(userData))
    } else {
      navigate('/adm/coordenacao')
    }
  }, [navigate])

  useEffect(() => {
    if (adminUser) {
      fetchReservations()
    }
  }, [adminUser])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchTerm, filterLab, filterStatus])

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setReservations(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar reservas:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar reservas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterReservations = () => {
    let filtered = reservations

    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.uso.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterLab !== 'all') {
      filtered = filtered.filter(reservation =>
        reservation.tipo_reserva === filterLab
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(reservation =>
        reservation.status === filterStatus
      )
    }

    setFilteredReservations(filtered)

    // Separate into physical spaces and laboratories
    const physicalSpaces = ['auditorio', 'sala_reuniao']
    const laboratories = ['laiga_equipments', 'lagep', 'lamod']

    const physicalSpaceFiltered = filtered.filter(reservation =>
      physicalSpaces.includes(reservation.tipo_reserva)
    )

    const laboratoryFiltered = filtered.filter(reservation =>
      laboratories.includes(reservation.tipo_reserva)
    )

    setPhysicalSpaceReservations(physicalSpaceFiltered)
    setLaboratoryReservations(laboratoryFiltered)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_user')
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    })
    navigate('/adm')
  }

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      await fetchReservations()
      toast({
        title: "Sucesso",
        description: "Status da reserva atualizado",
      })
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da reserva",
        variant: "destructive",
      })
    }
  }

  const handleEditReservation = (reservation: Reservation) => {
    setEditingId(reservation.id)
    setEditData({ ...reservation })
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editData) return

    try {
      const { error } = await supabase
        .from('reservations')
        .update(editData)
        .eq('id', editingId)

      if (error) throw error

      await fetchReservations()
      setEditingId(null)
      setEditData({})
      toast({
        title: "Sucesso",
        description: "Reserva atualizada com sucesso",
      })
    } catch (error: any) {
      console.error('Erro ao atualizar reserva:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar reserva",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar esta reserva?')) {
      return
    }

    try {
      // Find the reservation to delete and store it for undo
      const reservationToDelete = reservations.find(r => r.id === id)
      if (!reservationToDelete) return

      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Store for undo
      setDeletedReservations([reservationToDelete])
      setLastDeleteType('individual')

      await fetchReservations()
      toast({
        title: "Sucesso",
        description: "Reserva apagada com sucesso",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndoDelete}
            className="gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Desfazer
          </Button>
        ),
      })
    } catch (error: any) {
      console.error('Erro ao apagar reserva:', error)
      toast({
        title: "Erro",
        description: "Erro ao apagar reserva",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReservationsByType = async (type: string) => {
    const typeLabels: Record<string, string> = {
      physical: 'espaços físicos',
      laboratory: 'laboratórios',
      all: 'TODAS as reservas',
      auditorio: 'Auditório',
      sala_reuniao: 'Sala de Reuniões',
      laiga_equipments: 'LAIGA',
      lagep: 'LAGEP',
      lamod: 'LAMOD'
    }

    if (!confirm(`Tem certeza que deseja apagar as reservas de ${typeLabels[type] || type}?`)) {
      return
    }

    try {
      const physicalSpaces = ['auditorio', 'sala_reuniao']
      const laboratories = ['laiga_equipments', 'lagep', 'lamod']
      
      let reservationsToDelete: Reservation[] = []
      
      if (type === 'physical') {
        reservationsToDelete = reservations.filter(r => physicalSpaces.includes(r.tipo_reserva))
      } else if (type === 'laboratory') {
        reservationsToDelete = reservations.filter(r => laboratories.includes(r.tipo_reserva))
      } else if (type === 'all') {
        reservationsToDelete = [...reservations]
      } else {
        // Specific type (auditorio, sala_reuniao, laiga_equipments, lagep, lamod)
        reservationsToDelete = reservations.filter(r => r.tipo_reserva === type)
      }

      if (reservationsToDelete.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há reservas para apagar nesta categoria",
        })
        return
      }

      // Store for undo
      setDeletedReservations(reservationsToDelete)
      setLastDeleteType(type)

      const idsToDelete = reservationsToDelete.map(r => r.id)

      const { error } = await supabase
        .from('reservations')
        .delete()
        .in('id', idsToDelete)

      if (error) throw error

      await fetchReservations()
      toast({
        title: "Sucesso",
        description: `${reservationsToDelete.length} reservas de ${typeLabels[type] || type} foram apagadas`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndoDelete}
            className="gap-1"
          >
            <Undo2 className="w-3 h-3" />
            Desfazer
          </Button>
        ),
      })
    } catch (error: any) {
      console.error('Erro ao apagar reservas:', error)
      toast({
        title: "Erro",
        description: "Erro ao apagar reservas",
        variant: "destructive",
      })
    }
  }

  const handleUndoDelete = async () => {
    if (deletedReservations.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há reservas para restaurar",
      })
      return
    }

    try {
      // Reinsert all deleted reservations
      const { error } = await supabase
        .from('reservations')
        .insert(deletedReservations.map(r => ({
          id: r.id,
          nome: r.nome,
          sobrenome: r.sobrenome,
          email: r.email,
          uso: r.uso,
          tipo_reserva: r.tipo_reserva,
          inicio: r.inicio,
          termino: r.termino,
          status: r.status,
          created_at: r.created_at,
          equipamento: r.equipamento
        })))

      if (error) throw error

      setDeletedReservations([])
      setLastDeleteType(null)
      await fetchReservations()
      
      toast({
        title: "Sucesso",
        description: `${deletedReservations.length} reservas foram restauradas`,
      })
    } catch (error: any) {
      console.error('Erro ao restaurar reservas:', error)
      toast({
        title: "Erro",
        description: "Erro ao restaurar reservas",
        variant: "destructive",
      })
    }
  }

  const generatePDF = async (sectionType: 'physical' | 'laboratory') => {
    const targetId = sectionType === 'physical' ? 'physical-section' : 'labs-section'
    const element = document.getElementById(targetId)
    if (!element) return

    // Expandir a tabela para capturar todas as linhas
    const tableId = sectionType === 'physical' ? 'physical-spaces-table' : 'laboratories-table'
    const tableEl = document.getElementById(tableId) as HTMLElement | null
    const prevMaxHeight = tableEl?.style.maxHeight
    const prevOverflowY = tableEl?.style.overflowY
    if (tableEl) {
      tableEl.style.maxHeight = 'none'
      tableEl.style.overflowY = 'visible'
    }

    try {
      const pdf = new jsPDF('l', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const marginTop = 25
      const marginBottom = 20
      const availableHeight = pdfHeight - marginTop - marginBottom

      const title = sectionType === 'physical' 
        ? 'Relatório de Reservas - Espaços Físicos - CPGG'
        : 'Relatório de Reservas - Laboratórios - CPGG'

      // Primeira página - Cabeçalho e Gráficos
      pdf.setFontSize(16)
      pdf.text(title, pdfWidth / 2, 15, { align: 'center' })

      // Capturar os gráficos
      const chartsSelector = sectionType === 'physical' 
        ? '#physical-section .grid.grid-cols-1.md\\:grid-cols-2.gap-6.mb-6'
        : '#labs-section .grid.grid-cols-1.md\\:grid-cols-2.gap-6.mb-6'
      
      const chartsContainer = document.querySelector(chartsSelector) as HTMLElement
      if (chartsContainer) {
        const chartsCanvas = await html2canvas(chartsContainer, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
        })

        const chartsImgData = chartsCanvas.toDataURL('image/png')
        const chartsRatio = Math.min(pdfWidth / chartsCanvas.width, (availableHeight * 0.6) / chartsCanvas.height)
        const chartsWidth = chartsCanvas.width * chartsRatio
        const chartsHeight = chartsCanvas.height * chartsRatio
        const chartsX = (pdfWidth - chartsWidth) / 2

        pdf.addImage(chartsImgData, 'PNG', chartsX, marginTop, chartsWidth, chartsHeight)
      }

      // Nova página para a tabela (dados legíveis em 12pt)
      pdf.addPage()

      const autoTable = (await import('jspdf-autotable')).default as any

      const head = sectionType === 'physical'
        ? [['Nome', 'Email', 'Espaço', 'Uso', 'Início', 'Término', 'Status', 'Solicitação']]
        : [['Nome', 'Email', 'Laboratório/Espaço', 'Uso', 'Início', 'Término', 'Status', 'Solicitação', 'Equipamento']]

      const sanitizeName = (nome: string, sobrenome: string) => `${nome} ${sobrenome}`
        .replace(/\[?LAIGA\]?/gi, ' ')
        .replace(/LAIGA\s*-\s*/gi, ' ')
        .replace(/-\s*LAIGA/gi, ' ')
        .replace(/LAIGA\s*:/gi, ' ')
        .replace(/:\s*LAIGA/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      const body = (sectionType === 'physical'
        ? physicalSpaceReservations
        : laboratoryReservations).map((r) => {
          const nome = sanitizeName(r.nome, r.sobrenome)
          const inicio = formatDate(r.inicio)
          const termino = formatDate(r.termino)
          const solicitacao = formatDate(r.created_at)
          if (sectionType === 'physical') {
            const espaco = r.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala de Reunião'
            return [nome, r.email, espaco, r.uso, inicio, termino, r.status, solicitacao]
          } else {
            const lab = r.tipo_reserva === 'laiga_equipments' ? 'LAIGA' : (r.tipo_reserva || '').toUpperCase()
            return [nome, r.email, lab, r.uso, inicio, termino, r.status, solicitacao, r.equipamento || '-']
          }
        })

      autoTable(pdf, {
        head,
        body,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 3 },
        headStyles: { fillColor: [230, 230, 230] },
        columnStyles: {
          0: { cellWidth: 45 }, // Nome
          1: { cellWidth: 45 }, // Email
        },
        margin: { top: 25, bottom: 15, left: 10, right: 10 },
        didDrawPage: (data: any) => {
          const pageWidth = pdf.internal.pageSize.getWidth()
          const pageHeight = pdf.internal.pageSize.getHeight()
          pdf.setFontSize(16)
          pdf.text(title, pageWidth / 2, 15, { align: 'center' })
          pdf.setFontSize(10)
          pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, pageHeight - 5)
          const totalPages = pdf.getNumberOfPages()
          pdf.text(`Página ${data.pageNumber} de ${totalPages}`, pageWidth - 30, pageHeight - 5)
        },
      })

      const filename = sectionType === 'physical' 
        ? 'relatorio-espacos-fisicos.pdf'
        : 'relatorio-laboratorios.pdf'
      
      pdf.save(filename)
      toast({ title: 'Sucesso', description: 'PDF gerado com sucesso!' })

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({ title: 'Erro', description: 'Erro ao gerar PDF', variant: 'destructive' })
    } finally {
      if (tableEl) {
        tableEl.style.maxHeight = prevMaxHeight || ''
        tableEl.style.overflowY = prevOverflowY || ''
      }
    }
  }

  // Dados para gráficos - Espaços Físicos
  const getPhysicalSpaceReservationsByType = () => {
    const typeCount = physicalSpaceReservations.reduce((acc, reservation) => {
      const type = reservation.tipo_reserva || 'Não especificado'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeCount).map(([name, value]) => ({ 
      name: name === 'auditorio' ? 'Auditório' : name === 'sala_reuniao' ? 'Sala de Reunião' : name, 
      value 
    }))
  }

  // Dados para gráficos - Laboratórios
  const getLaboratoryReservationsByType = () => {
    const typeCount = laboratoryReservations.reduce((acc, reservation) => {
      const type = reservation.tipo_reserva || 'Não especificado'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeCount).map(([name, value]) => ({ 
      name: name === 'laiga_equipments' ? 'LAIGA' : name.toUpperCase(), 
      value 
    }))
  }

  const getReservationsByUser = (reservations: Reservation[]) => {
    const userCount = reservations.reduce((acc, reservation) => {
      const userRaw = `${reservation.nome} ${reservation.sobrenome}`
      const user = userRaw
        .replace(/\[?LAIGA\]?/gi, ' ')
        .replace(/LAIGA\s*-\s*/gi, ' ')
        .replace(/-\s*LAIGA/gi, ' ')
        .replace(/LAIGA\s*:/gi, ' ')
        .replace(/:\s*LAIGA/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      acc[user] = (acc[user] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(userCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  }

  const getReservationsByUsage = (reservations: Reservation[]) => {
    const usageCount = reservations.reduce((acc, reservation) => {
      const usage = reservation.uso || 'Não especificado'
      acc[usage] = (acc[usage] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(usageCount).map(([name, value]) => ({ name, value }))
  }

  const getReservationsByMonth = (reservations: Reservation[]) => {
    const monthCount = reservations.reduce((acc, reservation) => {
      const date = new Date(reservation.created_at)
      const month = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthCount).map(([name, value]) => ({ name, value }))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'default'
      case 'rejeitada':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/adm/coordenacao/dashboard')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgba(147, 106, 235, 0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(147, 106, 235, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(147, 106, 235, 1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 106, 235, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(147, 106, 235, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 106, 235, 0.3)'
        }}
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG Logo" />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/adm/coordenacao/dashboard')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div style={{ marginTop: '205px', marginBottom: '0' }}>
        <h1 style={{ 
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          color: 'white',
          margin: '0',
          marginBottom: '2rem',
          padding: '0',
          paddingBottom: '15px',
          whiteSpace: 'nowrap',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          Gerenciamento de Reservas
        </h1>
      </div>

      <div className={styles.content}>
        <Tabs defaultValue="physical-spaces" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="physical-spaces">
              <MapPin className="w-4 h-4 mr-2" />
              Espaços Físicos ({physicalSpaceReservations.length})
            </TabsTrigger>
            <TabsTrigger value="laboratories">
              <FileText className="w-4 h-4 mr-2" />
              Laboratórios ({laboratoryReservations.length})
            </TabsTrigger>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
          </TabsList>

          {/* Espaços Físicos Tab */}
          <TabsContent value="physical-spaces" id="physical-section" className="space-y-4">
            <div className={styles.filters}>
              <Input
                placeholder="Buscar por nome, email ou uso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <select
                value={filterLab}
                onChange={(e) => setFilterLab(e.target.value)}
                className={styles.select}
              >
                <option value="all">Todos os Espaços</option>
                <option value="auditorio">Auditório</option>
                <option value="sala_reuniao">Sala de Reunião</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.select}
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="rejeitada">Rejeitada</option>
              </select>

              <Button onClick={() => generatePDF('physical')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('auditorio')} variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Auditório
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('sala_reuniao')} variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Sala Reuniões
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('physical')} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Todos Espaços
              </Button>
              
              {deletedReservations.length > 0 && (lastDeleteType === 'physical' || lastDeleteType === 'auditorio' || lastDeleteType === 'sala_reuniao') && (
                <Button onClick={handleUndoDelete} variant="outline" className="gap-1">
                  <Undo2 className="w-4 h-4" />
                  Desfazer ({deletedReservations.length})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Espaço Físico</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPhysicalSpaceReservationsByType()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPhysicalSpaceReservationsByType().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Usuários - Espaços Físicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getReservationsByUser(physicalSpaceReservations)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservas de Espaços Físicos ({physicalSpaceReservations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="physical-spaces-table" className={styles.tableContainer}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Espaço</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Término</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Solicitação</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {physicalSpaceReservations.map((reservation) => {
                        const isEditing = editingId === reservation.id
                        return (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Input
                                    value={editData.nome || ''}
                                    onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                                    placeholder="Nome"
                                    className="w-20 text-sm"
                                  />
                                  <Input
                                    value={editData.sobrenome || ''}
                                    onChange={(e) => setEditData({ ...editData, sobrenome: e.target.value })}
                                    placeholder="Sobrenome"
                                    className="w-20 text-sm"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {`${reservation.nome} ${reservation.sobrenome}`
                                    .replace(/\[?LAIGA\]?/gi, ' ')
                                    .replace(/LAIGA\s*-\s*/gi, ' ')
                                    .replace(/-\s*LAIGA/gi, ' ')
                                    .replace(/LAIGA\s*:/gi, ' ')
                                    .replace(/:\s*LAIGA/gi, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                  }
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editData.email || ''}
                                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                  placeholder="Email"
                                  className="w-24 text-sm"
                                />
                              ) : (
                                reservation.email
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <select
                                  value={editData.tipo_reserva || ''}
                                  onChange={(e) => setEditData({ ...editData, tipo_reserva: e.target.value })}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="auditorio">Auditório</option>
                                  <option value="sala_reuniao">Sala de Reunião</option>
                                </select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {reservation.tipo_reserva === 'auditorio' ? 'Auditório' : 'Sala de Reunião'}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editData.uso || ''}
                                  onChange={(e) => setEditData({ ...editData, uso: e.target.value })}
                                  placeholder="Uso"
                                  className="w-20 text-sm"
                                />
                              ) : (
                                reservation.uso
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  type="datetime-local"
                                  value={editData.inicio ? new Date(editData.inicio).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditData({ ...editData, inicio: e.target.value })}
                                  className="w-32 text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(reservation.inicio)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  type="datetime-local"
                                  value={editData.termino ? new Date(editData.termino).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditData({ ...editData, termino: e.target.value })}
                                  className="w-32 text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(reservation.termino)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <select
                                  value={editData.status || ''}
                                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="aprovada">Aprovada</option>
                                  <option value="rejeitada">Rejeitada</option>
                                </select>
                              ) : (
                                <Badge variant={getStatusBadgeVariant(reservation.status)}>
                                  {reservation.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(reservation.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEdit}
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleEditReservation(reservation)}
                                     >
                                       <Edit className="w-3 h-3" />
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="destructive"
                                       onClick={() => handleDeleteReservation(reservation.id)}
                                     >
                                       <Trash2 className="w-3 h-3" />
                                     </Button>
                                     {reservation.status === 'pendente' && (
                                       <>
                                         <Button
                                           size="sm"
                                           onClick={() => updateReservationStatus(reservation.id, 'aprovada')}
                                         >
                                           Aprovar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => updateReservationStatus(reservation.id, 'rejeitada')}
                                        >
                                          Rejeitar
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Laboratórios Tab */}
          <TabsContent value="laboratories" id="labs-section" className="space-y-4">
            <div className={styles.filters}>
              <Input
                placeholder="Buscar por nome, email ou uso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              
              <select
                value={filterLab}
                onChange={(e) => setFilterLab(e.target.value)}
                className={styles.select}
              >
                <option value="all">Todos os Laboratórios</option>
                <option value="laiga_equipments">LAIGA</option>
                <option value="lagep">LAGEP</option>
                <option value="lamod">LAMOD</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.select}
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovada">Aprovada</option>
                <option value="rejeitada">Rejeitada</option>
              </select>

              <Button onClick={() => generatePDF('laboratory')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('laiga_equipments')} variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar LAIGA
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('lagep')} variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar LAGEP
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('lamod')} variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar LAMOD
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('laboratory')} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Todos Labs
              </Button>
              
              {deletedReservations.length > 0 && (lastDeleteType === 'laboratory' || lastDeleteType === 'laiga_equipments' || lastDeleteType === 'lagep' || lastDeleteType === 'lamod') && (
                <Button onClick={handleUndoDelete} variant="outline" className="gap-1">
                  <Undo2 className="w-4 h-4" />
                  Desfazer ({deletedReservations.length})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Laboratório</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getLaboratoryReservationsByType()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getLaboratoryReservationsByType().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Top Usuários - {filterLab === 'all' ? 'Laboratórios' : 
                      filterLab === 'laiga_equipments' ? 'LAIGA' : 
                      filterLab.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getReservationsByUser(laboratoryReservations)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservas de Laboratórios ({laboratoryReservations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div id="laboratories-table" className={styles.tableContainer}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Laboratório/Espaço</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Término</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Solicitação</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laboratoryReservations.map((reservation) => {
                        const isEditing = editingId === reservation.id
                        return (
                          <TableRow key={reservation.id}>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Input
                                    value={editData.nome || ''}
                                    onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                                    placeholder="Nome"
                                    className="w-20 text-sm"
                                  />
                                  <Input
                                    value={editData.sobrenome || ''}
                                    onChange={(e) => setEditData({ ...editData, sobrenome: e.target.value })}
                                    placeholder="Sobrenome"
                                    className="w-20 text-sm"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {`${reservation.nome} ${reservation.sobrenome}`
                                    .replace(/\[?LAIGA\]?/gi, ' ')
                                    .replace(/LAIGA\s*-\s*/gi, ' ')
                                    .replace(/-\s*LAIGA/gi, ' ')
                                    .replace(/LAIGA\s*:/gi, ' ')
                                    .replace(/:\s*LAIGA/gi, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim()
                                  }
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editData.email || ''}
                                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                  placeholder="Email"
                                  className="w-24 text-sm"
                                />
                              ) : (
                                reservation.email
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <select
                                  value={editData.tipo_reserva || ''}
                                  onChange={(e) => setEditData({ ...editData, tipo_reserva: e.target.value })}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="laiga_equipments">LAIGA</option>
                                  <option value="lagep">LAGEP</option>
                                  <option value="lamod">LAMOD</option>
                                </select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {reservation.tipo_reserva === 'laiga_equipments' ? 'LAIGA' : reservation.tipo_reserva.toUpperCase()}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editData.uso || ''}
                                  onChange={(e) => setEditData({ ...editData, uso: e.target.value })}
                                  placeholder="Uso"
                                  className="w-20 text-sm"
                                />
                              ) : (
                                reservation.uso
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  type="datetime-local"
                                  value={editData.inicio ? new Date(editData.inicio).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditData({ ...editData, inicio: e.target.value })}
                                  className="w-32 text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(reservation.inicio)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  type="datetime-local"
                                  value={editData.termino ? new Date(editData.termino).toISOString().slice(0, 16) : ''}
                                  onChange={(e) => setEditData({ ...editData, termino: e.target.value })}
                                  className="w-32 text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(reservation.termino)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <select
                                  value={editData.status || ''}
                                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="aprovada">Aprovada</option>
                                  <option value="rejeitada">Rejeitada</option>
                                </select>
                              ) : (
                                <Badge variant={getStatusBadgeVariant(reservation.status)}>
                                  {reservation.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(reservation.created_at)}</TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editData.equipamento || ''}
                                  onChange={(e) => setEditData({ ...editData, equipamento: e.target.value })}
                                  placeholder="Equipamento"
                                  className="w-20 text-sm"
                                />
                              ) : (
                                reservation.equipamento || 'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEdit}
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleEditReservation(reservation)}
                                     >
                                       <Edit className="w-3 h-3" />
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="destructive"
                                       onClick={() => handleDeleteReservation(reservation.id)}
                                     >
                                       <Trash2 className="w-3 h-3" />
                                     </Button>
                                     {reservation.status === 'pendente' && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => updateReservationStatus(reservation.id, 'aprovada')}
                                        >
                                          Aprovar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => updateReservationStatus(reservation.id, 'rejeitada')}
                                        >
                                          Rejeitar
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão Geral Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="text-sm font-medium text-muted-foreground self-center">Espaços:</span>
              <Button onClick={() => handleDeleteReservationsByType('auditorio')} variant="outline" size="sm" className="gap-1">
                <Trash2 className="w-3 h-3" />
                Auditório
              </Button>
              <Button onClick={() => handleDeleteReservationsByType('sala_reuniao')} variant="outline" size="sm" className="gap-1">
                <Trash2 className="w-3 h-3" />
                Sala Reuniões
              </Button>
              <Button onClick={() => handleDeleteReservationsByType('physical')} variant="outline" size="sm" className="gap-1 text-destructive border-destructive">
                <Trash2 className="w-3 h-3" />
                Todos Espaços
              </Button>
              
              <span className="text-sm font-medium text-muted-foreground self-center ml-4">Labs:</span>
              <Button onClick={() => handleDeleteReservationsByType('laiga_equipments')} variant="outline" size="sm" className="gap-1">
                <Trash2 className="w-3 h-3" />
                LAIGA
              </Button>
              <Button onClick={() => handleDeleteReservationsByType('lagep')} variant="outline" size="sm" className="gap-1">
                <Trash2 className="w-3 h-3" />
                LAGEP
              </Button>
              <Button onClick={() => handleDeleteReservationsByType('lamod')} variant="outline" size="sm" className="gap-1">
                <Trash2 className="w-3 h-3" />
                LAMOD
              </Button>
              <Button onClick={() => handleDeleteReservationsByType('laboratory')} variant="outline" size="sm" className="gap-1 text-destructive border-destructive">
                <Trash2 className="w-3 h-3" />
                Todos Labs
              </Button>
              
              <Button onClick={() => handleDeleteReservationsByType('all')} variant="destructive" size="sm" className="gap-1 ml-4">
                <Trash2 className="w-3 h-3" />
                Apagar Todas
              </Button>
              
              {deletedReservations.length > 0 && (
                <Button onClick={handleUndoDelete} variant="secondary" size="sm" className="gap-1">
                  <Undo2 className="w-3 h-3" />
                  Desfazer ({deletedReservations.length})
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{physicalSpaceReservations.length}</div>
                      <div className={styles.statLabel}>Espaços Físicos</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{laboratoryReservations.length}</div>
                      <div className={styles.statLabel}>Laboratórios</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>
                        {filteredReservations.filter(r => r.status === 'pendente').length}
                      </div>
                      <div className={styles.statLabel}>Pendentes</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>
                        {filteredReservations.filter(r => r.status === 'aprovada').length}
                      </div>
                      <div className={styles.statLabel}>Aprovadas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Espaços Físicos', value: physicalSpaceReservations.length },
                          { name: 'Laboratórios', value: laboratoryReservations.length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#8884d8" />
                        <Cell fill="#00C49F" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Tipo de Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getReservationsByUsage(filteredReservations)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reservas por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getReservationsByMonth(filteredReservations)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}