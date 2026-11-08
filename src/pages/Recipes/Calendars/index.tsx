import { useState, useEffect } from 'react'
import styles from './calendars.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { EditButtonCalendars } from './components/EditButtonCalendars'
import { AdminLoginCalendars } from './components/AdminLoginCalendars'
import { CalendarUploadModal } from './components/CalendarUploadModal'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

interface Calendar {
  id: string
  name: string
  year: number
  pdf_url: string
  display_order: number
}

export function Calendars() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCalendars()
  }, [])

  const fetchCalendars = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching calendars:', error)
      toast({ title: 'Erro', description: 'Erro ao carregar calendários', variant: 'destructive' })
    } else {
      setCalendars(data || [])
    }
    setIsLoading(false)
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast({ 
          title: 'Acesso negado', 
          description: 'Email ou senha incorretos.', 
          variant: 'destructive' 
        })
        return
      }

      const { data, error } = await supabase.rpc('can_access', { _permission: 'calendars' })

      if (error) throw error

      if (data) {
        setIsEditMode(true)
        setShowLogin(false)
        toast({ title: 'Login realizado', description: 'Modo de edição ativado.' })
      } else {
        await supabase.auth.signOut()
        toast({ 
          title: 'Acesso negado', 
          description: 'Apenas coordenação e secretaria podem editar.', 
          variant: 'destructive' 
        })
      }
    } catch (err: any) {
      toast({ title: 'Erro ao validar acesso', description: err.message ?? 'Tente novamente.', variant: 'destructive' })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsEditMode(false)
    toast({ title: 'Logout realizado', description: 'Modo de edição desativado.' })
  }

  const getNextYear = () => {
    if (calendars.length === 0) return new Date().getFullYear()
    const maxYear = Math.max(...calendars.map(c => c.year))
    return maxYear + 1
  }

  const handleUpload = async (file: File, year: number, name: string) => {
    // Check if year already exists
    const existingCalendar = calendars.find(c => c.year === year)
    if (existingCalendar) {
      throw new Error(`Já existe um calendário para o ano ${year}`)
    }

    // Upload file to storage
    const fileName = `cal${year}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('calendars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      throw new Error('Erro ao fazer upload do arquivo: ' + uploadError.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('calendars')
      .getPublicUrl(fileName)

    // Update display_order of existing calendars (shift them down)
    const updatedCalendars = calendars.map(c => ({
      ...c,
      display_order: c.display_order + 1
    }))

    // Update orders in database
    for (const cal of updatedCalendars) {
      await supabase
        .from('calendars')
        .update({ display_order: cal.display_order })
        .eq('id', cal.id)
    }

    // Insert new calendar at position 1
    const { error: insertError } = await supabase
      .from('calendars')
      .insert({
        name,
        year,
        pdf_url: urlData.publicUrl,
        display_order: 1
      })

    if (insertError) {
      throw new Error('Erro ao salvar calendário: ' + insertError.message)
    }

    toast({ title: 'Sucesso', description: 'Calendário adicionado com sucesso!' })
    fetchCalendars()
  }

  const getCalendarStyle = (index: number) => {
    const gradients = [
      'linear-gradient(90deg, rgba(2,0,36,0.95) 0%, rgba(63,9,121,0.85))',
      'linear-gradient(135deg, rgba(2,0,36,0.85), rgba(9,94,121,0.85))',
      'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(35,9,121,0.85) 35%, rgba(0,212,255,0.85) 100%)',
      'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(95,9,121,0.85) 35%, rgba(0,212,255,0.85) 100%)',
      'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,68,121,0.85) 58%, rgba(0,212,255,0.85) 100%)',
      'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(6,54,60,0.95) 100%, rgba(0,150,255,0.85) 100%)',
    ]
    return {
      background: `${gradients[index % gradients.length]}, url('https://i.imgur.com/tETHUnK.jpg') center/cover`
    }
  }

  return (
    <div className={styles.Container} style={{ overflow: 'hidden', height: '100vh', position: 'fixed', width: '100%', top: 0, left: 0 }}>
      <Header/>
      <main className={`${styles.calendars} calendars`}>
        <h1 className={styles.title}>Calendários para baixar (por H. K. Sato)</h1>

        <div className={styles.container}>
          <div className={styles.buttonsGrid}>
            {/* Add new calendar button - only visible in edit mode */}
            {isEditMode && (
              <div 
                className={`${styles.calendarCard} ${styles.addCalendarCard}`}
                onClick={() => setShowUpload(true)}
              >
                <Plus className="w-8 h-8 mb-2" />
                <h2>Calendário de {getNextYear()}</h2>
                <p className={styles.addText}>Clique para adicionar</p>
              </div>
            )}

            {/* Existing calendars */}
            {calendars.map((calendar, index) => (
              <a 
                key={calendar.id}
                className={styles.card} 
                href={calendar.pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div 
                  className={styles.calendarCard}
                  style={getCalendarStyle(index)}
                >
                  <h2>{calendar.name}</h2>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer/>

      <EditButtonCalendars 
        onClick={() => setShowLogin(true)}
        isEditMode={isEditMode}
        onLogout={handleLogout}
      />

      <AdminLoginCalendars
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />

      <CalendarUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
        nextYear={getNextYear()}
      />
    </div>
  )
}
