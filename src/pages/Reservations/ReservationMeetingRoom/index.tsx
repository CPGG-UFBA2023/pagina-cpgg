import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ReservationMeetingRoom.module.css'
import '../reservations-no-scroll.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { supabase } from '../../../integrations/supabase/client'
import { Button } from '../../../components/ui/button'

export function MR() {
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    uso: '',
    inicio: '',
    termino: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting.current) return
    
    // Validar se todos os campos estão preenchidos
    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.uso || !formData.inicio || !formData.termino) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    submitting.current = true
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          ...formData,
          tipoReserva: 'sala_reuniao'
        }
      });

      if (error) {
        const result = await error.context?.json?.().catch(() => null)
        throw new Error(result?.error || 'Erro ao enviar reserva. Tente novamente.')
      }
      if (!data?.success) throw new Error(data?.error || 'Erro ao enviar reserva.')

      console.log('Reserva enviada com sucesso:', data);
      // Redirecionar para página de sucesso usando React Router
      navigate('/reservations/success')
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      alert(error instanceof Error ? error.message : 'Erro ao enviar reserva. Tente novamente.');
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={`${styles.MR} reservationMeetingRoomPage`}>
          <form className={styles.box} onSubmit={handleSubmit}>
            <ul> Reserva da Sala de Reuniões do CPGG </ul>

          <div className={styles.form}> 
             <input 
               type="text" 
               placeholder="Nome" 
               value={formData.nome}
               onChange={(e) => handleInputChange('nome', e.target.value)}
               required 
             />
          </div>

          <div className={styles.form}> 
            <input 
              type="text" 
              placeholder="Sobrenome" 
              value={formData.sobrenome}
              onChange={(e) => handleInputChange('sobrenome', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <input 
              type="email" 
              placeholder="E-mail" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required 
            />
          </div>

          <div className={styles.form}> 
            <input 
              type="text" 
              placeholder="Uso para...?" 
              value={formData.uso}
              onChange={(e) => handleInputChange('uso', e.target.value)}
              required 
            />
          </div>

          <div className={styles.container}> 
            <div className={styles.dateField}>
               <label>Início</label>
              <input 
                type="datetime-local" 
                value={formData.inicio}
                onChange={(e) => handleInputChange('inicio', e.target.value)}
                required 
              />
            </div> 
            <div className={styles.dateField}>
               <label>Término</label>
              <input 
                type="datetime-local" 
                value={formData.termino}
                onChange={(e) => handleInputChange('termino', e.target.value)}
                required 
              />
            </div>
          </div>

          <Button type="submit" className={styles.button} disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>

          </form>
        </div>
        
      <Footer />
    </div>
  )
}
