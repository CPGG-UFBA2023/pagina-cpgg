import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './auditory.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Button } from '../../../components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

import auditory1 from '../../../assets/Photos/Auditory/Auditorio1-new.jpg'
import auditory2 from '../../../assets/Photos/Auditory/Auditorio2-new.jpg'

export function Auditory() {
  const { t } = useLanguage()
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
            <ul>{t('spaces.auditoriumTitle')}</ul>
            <div className={styles.gallery}>
              <div className={styles.auditory1}>
                 <img src={auditory1} alt="Foto1" />
              </div>
              <div className={styles.auditory2}>
                <img src={auditory2} alt="Foto2" />
              </div>
            </div>

            <div className={styles.textContent}>
               {t('spaces.auditoriumDescription')}
            </div>

            <nav className={styles.btnWrap}>
               <Button
                 asChild
                 className="bg-[#592cbb] border-none text-white rounded-full hover:bg-[#7a4fd6] transition-all duration-300 flex items-center justify-center px-8 py-3 text-base font-semibold shadow-lg"
               >
                 <Link to="/reservations/reservation-auditory" className="flex items-center justify-center">{t('spaces.auditoriumReserve')}</Link>
               </Button>
            </nav>
          </div>
        </div>
      <Footer />
    </div>
  )
}
