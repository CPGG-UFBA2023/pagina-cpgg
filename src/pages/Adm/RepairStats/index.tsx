import { resolveAdminSession } from '@/hooks/useAccessPermissions'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import logocpgg from '@/assets/cpgg-logo.jpg'
import styles from './stats.module.css'

interface RepairRequest {
  id: string
  nome: string
  sobrenome: string
  email: string
  problem_type: string
  problem_description: string
  status: string
  created_at: string
  updated_at: string
}

interface AdminUser {
  id: string
  email: string
  role: string
}

export function RepairStats() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  const COLORS = {
    infraestrutura: '#FF6B6B',
    ti: '#4ECDC4',
    pendente: '#FFA500',
    em_andamento: '#4169E1',
    resolvido: '#32CD32',
    rejeitado: '#DC143C'
  }

  useEffect(() => {
    void resolveAdminSession('reservations').then(user => {
      if (!user) { navigate('/adm/coordenacao'); return }
      setAdminUser(user)
      loadRequests()
    })
  }, [navigate])

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('repair_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar solicitações:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estatísticas.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Estatísticas por tipo de problema
  const getRequestsByType = () => {
    const typeCount = requests.reduce((acc, req) => {
      const type = req.problem_type === 'infraestrutura' ? 'Infraestrutura' : 'T.I.'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
  }

  // Estatísticas por status
  const getRequestsByStatus = () => {
    const statusCount = requests.reduce((acc, req) => {
      const statusMap: Record<string, string> = {
        pendente: 'Pendente',
        em_andamento: 'Em Andamento',
        resolvido: 'Resolvido',
        rejeitado: 'Rejeitado'
      }
      const status = statusMap[req.status] || req.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }))
  }

  // Estatísticas por mês
  const getRequestsByMonth = () => {
    const monthCount = requests.reduce((acc, req) => {
      const date = new Date(req.created_at)
      const month = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthCount)
      .sort(([a], [b]) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateA.getTime() - dateB.getTime()
      })
      .map(([name, value]) => ({ name, value }))
  }

  const getTotalStats = () => {
    const infraCount = requests.filter(r => r.problem_type === 'infraestrutura').length
    const tiCount = requests.filter(r => r.problem_type === 'ti').length

    return { infraCount, tiCount }
  }

  const handleClearStats = async () => {
    if (!confirm('Tem certeza que deseja ZERAR todas as estatísticas? Esta ação não pode ser desfeita e todas as solicitações serão permanentemente deletadas.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('repair_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (error) throw error

      await loadRequests()
      toast({
        title: 'Sucesso',
        description: 'Todas as estatísticas foram zeradas.',
      })
    } catch (error: any) {
      console.error('Erro ao zerar estatísticas:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao zerar estatísticas. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const stats = getTotalStats()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/adm/coordenacao/dashboard')} 
        className={styles.backButton}
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className={styles.header}>
        <img src={logocpgg} alt="CPGG Logo" className={styles.logo} />
        <h1>Estatísticas de Solicitações de Serviços</h1>
        <Button 
          onClick={handleClearStats}
          variant="destructive"
          className={styles.clearButton}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Zerar Estatísticas
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <AlertCircle className={styles.icon} style={{ color: COLORS.infraestrutura }} />
              Infraestrutura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statNumber}>{stats.infraCount}</p>
            <p className={styles.statLabel}>solicitações</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardHeader>
            <CardTitle className={styles.cardTitle}>
              <AlertCircle className={styles.icon} style={{ color: COLORS.ti }} />
              T.I.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statNumber}>{stats.tiCount}</p>
            <p className={styles.statLabel}>solicitações</p>
          </CardContent>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <CardHeader>
            <CardTitle>Solicitações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getRequestsByType()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getRequestsByType().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Infraestrutura' ? COLORS.infraestrutura : COLORS.ti} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={styles.chartCard}>
          <CardHeader>
            <CardTitle>Solicitações por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRequestsByStatus()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {getRequestsByStatus().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Pendente' ? COLORS.pendente :
                        entry.name === 'Em Andamento' ? COLORS.em_andamento :
                        entry.name === 'Resolvido' ? COLORS.resolvido :
                        COLORS.rejeitado
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className={styles.fullWidthCard}>
        <CardHeader>
          <CardTitle>Solicitações por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getRequestsByMonth()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#936AEB" name="Solicitações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}