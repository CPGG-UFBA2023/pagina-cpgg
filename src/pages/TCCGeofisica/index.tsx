import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { EditButtonTCC } from './components/EditButtonTCC'
import { TCCUploadModal } from './components/TCCUploadModal'
import { Upload, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import styles from './TCCGeofisica.module.css'

interface TCC {
  id: string
  student_name: string
  pdf_url: string
}

export function TCCGeofisica() {
  const [tccs, setTccs] = useState<TCC[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const fetchTCCs = async () => {
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
    setLoading(false)
  }

  useEffect(() => {
    fetchTCCs()
  }, [])

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
        {isEditing && (
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
                {isEditing && (
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
      <Footer />

      <EditButtonTCC onEditModeChange={setIsEditing} />

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
