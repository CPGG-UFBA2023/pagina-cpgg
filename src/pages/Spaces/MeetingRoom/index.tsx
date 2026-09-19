import { Link } from 'react-router-dom'
import styles from './meetingroom.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Button } from '../../../components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

import meeting1 from '../../../assets/Photos/Meetingroom/Meetings1-new.jpg'
import meeting2 from '../../../assets/Photos/Meetingroom/Meetings2-new.jpg'

export function MeetingRoom() {
  const { t } = useLanguage()
  return (
    <div className={styles.Container}>
      <Header />
      <div className={styles.MeetingRoom}>
          <div className={styles.box}>
            <ul>{t('spaces.meetingTitle')}</ul>
            <div className={styles.gallery}>
              <div className={styles.meetingroom1}>
                 <img src={meeting1} alt="Foto1" />
              </div>
              <div className={styles.meetingroom2}>
                <img src={meeting2} alt="Foto2" />
              </div>
            </div>

            <div className={styles.textContent}>
               {t('spaces.meetingDescription')}
            </div>

            <nav className={styles.btnWrap}>
               <Button
                 asChild
                 variant="outline"
                 size="sm"
                 className="bg-[#BEB6B6] border-none text-white rounded-md hover:bg-[#936aeb] transition-all duration-500 flex items-center justify-center px-6"
               >
                 <Link to="/reservations/reservation-meeting-room" className="flex items-center justify-center">{t('spaces.reserve')}</Link>
               </Button>
            </nav>
          </div>
        </div>
      <Footer />
    </div>
  )
}
