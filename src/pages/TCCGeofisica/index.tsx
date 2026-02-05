import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { EditButtonTCC } from './components/EditButtonTCC'
import { TCCUploadModal } from './components/TCCUploadModal'
import { AdminLoginTCC } from './components/AdminLoginTCC'
import { Upload, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import styles from './TCCGeofisica.module.css'

interface TCC {
  id: string
  student_name: string
  pdf_url: string
}

const AUTH_KEY = 'tccGeofisicaAuth'

export function TCCGeofisica() {
  const [tccs, setTccs] = useState<TCC[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchTCCs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tcc_geofisica')
        .select('*')
        .order('student_name', { ascending: true })

      if (error) {
        console.error('Error fetching TCCs:', error)
      } else {
        setTccs(data || [])
      }
    } catch (err) {
      console.error('Unexpected error fetching TCCs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTCCs()
  }, [])

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setIsAuthenticated(false)
            localStorage.removeItem(AUTH_KEY)
            return
          }

          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .single()

          if (adminData?.role !== 'coordenacao') {
            setIsAuthenticated(false)
            localStorage.removeItem(AUTH_KEY)
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err)
        setIsAuthenticated(false)
        localStorage.removeItem(AUTH_KEY)
      }
    }
    checkAuth()
  }, [isAuthenticated])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    localStorage.setItem(AUTH_KEY, 'true')
    setShowLoginModal(false)
    toast.success('Login realizado com sucesso!')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      localStorage.removeItem(AUTH_KEY)
      toast.success('Logout realizado')
    } catch (err) {
      console.error('Error during logout:', err)
      toast.error('Erro ao fazer logout')
    }
  }

  const handleDelete = async (tcc: TCC) => {
    if (!confirm(`Deseja excluir o TCC de ${tcc.student_name}?`)) return

    try {
      // Extract filename from URL
      const urlParts = tcc.pdf_url.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete from storage
      await supabase.storage.from('tcc-geofisica').remove([fileName])

      // Delete from database
      const { error } = await supabase
        .from('tcc_geofisica')
        .delete()
        .eq('id', tcc.id)

      if (error) throw error

      toast.success('TCC excluído com sucesso')
      fetchTCCs()
    } catch (err) {
      console.error('Error deleting TCC:', err)
      toast.error('Erro ao excluir TCC')
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.content}>
        <h1 className={styles.title}>
          Trabalho Final de Graduação do curso de Geofísica
        </h1>

        {/* Admin toolbar */}
        {isAuthenticated && (
          <div className={styles.toolbar}>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Upload de TCCs
            </Button>
            <span className={styles.count}>
              {tccs.length} TCC(s) cadastrado(s)
            </span>
          </div>
        )}

        {loading ? (
          <p className={styles.emptyMessage}>Carregando...</p>
        ) : tccs.length > 0 ? (
          <ul className={styles.studentList}>
            {tccs.map((tcc) => (
              <li key={tcc.id} className={styles.studentItem}>
                <a 
                  href={tcc.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.studentLink}
                >
                  <FileText size={18} className={styles.pdfIcon} />
                  {tcc.student_name}
                </a>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tcc)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>
            Lista de alunos será adicionada em breve.
          </p>
        )}
      </main>

      <EditButtonTCC 
        onClick={() => setShowLoginModal(true)}
        isEditMode={isAuthenticated}
        onLogout={handleLogout}
      />

      <AdminLoginTCC
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      <TCCUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          fetchTCCs()
          setShowUploadModal(false)
        }}
      />
    </div>
  )
}
