import { Link } from 'react-router-dom'
import styles from './meetingroom.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Button } from '../../../components/ui/button'

import meeting1 from '../../../assets/Photos/Meetingroom/Meetings1-new.jpg'
import meeting2 from '../../../assets/Photos/Meetingroom/Meetings2-new.jpg'

export function MeetingRoom() {
  return (
    <div className={styles.Container}>
      <Header />
      <div className={styles.MeetingRoom}>
          <div className={styles.box}>
            <ul> Sala de Reuniões do CPGG </ul>
            <div className={styles.gallery}>
              <div className={styles.meetingroom1}>
                 <img src={meeting1} alt="Foto1" />
              </div>
              <div className={styles.meetingroom2}>
                <img src={meeting2} alt="Foto2" />
              </div>
            </div>

            <div className={styles.textContent}>
              A sala de reuniões do CPGG fica localizada na sala 163 da sede do CPGG, Bloco anexo ao Instituto de Geociências da UFBA. Tem um amplo espaço de 25 m² com uma mesa central 
              quadrada e assentos para 20 pessoas. Conta com quadro branco, datashow,
              ar-condicionado. O uso prioritário é para atividades
              do CPGG, e para atender às necessidades de seus membros. Reservas podem 
              ser feitas pelo link abaixo:
            </div>

            <nav className={styles.btnWrap}>
               <Button
                 asChild
                 variant="outline"
                 size="sm"
                 className="bg-[#BEB6B6] border-none text-white rounded-md hover:bg-[#936aeb] transition-all duration-500 flex items-center justify-center px-6"
               >
                 <Link to="/reservations/reservation-meeting-room" className="flex items-center justify-center">Reservar</Link>
               </Button>
            </nav>
          </div>
        </div>
      <Footer />
    </div>
  )
}
