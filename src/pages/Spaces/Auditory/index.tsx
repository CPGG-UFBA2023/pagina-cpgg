import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './auditory.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Button } from '../../../components/ui/button'

import auditory1 from '../../../assets/Photos/Auditory/Auditorio1-new.jpg'
import auditory2 from '../../../assets/Photos/Auditory/Auditorio2-new.jpg'

export function Auditory() {
  useEffect(() => {
    document.body.classList.add('auditory-page-body')
    return () => {
      document.body.classList.remove('auditory-page-body')
    }
  }, [])

  return (
    <div className={`${styles.Container} auditory-page`}>
      <Header />
      <div className={styles.Auditory}>
          <div className={styles.box}>
            <ul> Auditório do CPGG </ul>
            <div className={styles.gallery}>
              <div className={styles.auditory1}>
                 <img src={auditory1} alt="Foto1" />
              </div>
              <div className={styles.auditory2}>
                <img src={auditory2} alt="Foto2" />
              </div>
            </div>

            <div className={styles.textContent}>
              O auditório do CPGG se localiza na sede do CPGG, Bloco anexo ao Instituto de Geociências da UFBA. Conta com uma estrutura para 30 pessoas, quadro branco, datashow, caixa de som, iluminação diferenciada, ar-condicionados. É utilizado para seminários, defesas de tese, palestras e aulas. O uso prioritário é para atividades do CPGG, e para atender às necessidades de seus membros. Reservas podem ser feitas pelo link abaixo:
            </div>

            <nav className={styles.btnWrap}>
               <Button
                 asChild
                 variant="outline"
                 size="sm"
                 className="bg-[#BEB6B6] border-none text-white rounded-md hover:bg-[#936aeb] transition-all duration-500 flex items-center justify-center px-6"
               >
                 <Link to="/reservations/reservation-auditory" className="flex items-center justify-center">Reservar</Link>
               </Button>
            </nav>
          </div>
        </div>
      <Footer />
    </div>
  )
}
