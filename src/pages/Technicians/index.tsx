import styles from './Technicians.module.css'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

export function Technicians() {
  const { t } = useLanguage()
  
  return (
    <div className={styles.Container}>
      <Header />
      <div className={`${styles.technicians} technicians`}>
        <div className={styles.Employees}>
          <ul>{t('technicians.title')}</ul>
          <div className={styles.techniciansGrid}>
            <div className={styles.box1}>
              <div className={styles.photobox1}></div>
              <div className={styles.Secretary}>
                <h1>{t('technicians.administrativeSecretary')}</h1>
                <a>Alcirlene Cruz da Fonseca</a>
              </div>
            </div>
            <div className={styles.box2}>
              <div className={styles.photobox2}></div>
              <div className={styles.TI}>
                <h1>{t('technicians.itTechnician')}</h1>
                <a>Bianca Santos de Andrade</a>
              </div>
            </div>
            <div className={styles.box3}>
              <div className={styles.photobox3}></div>
              <div className={styles.Driver}>
                <h1>{t('technicians.driver')}</h1>
                <a>José Mota da Paz</a>
              </div>
            </div>
            <div className={styles.box4}>
              <div className={styles.photobox4}></div>
              <div className={styles.Lab}>
                <h1>{t('technicians.labTechnician')}</h1>
                <a>Michel Nascimento da Silva</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.hideFooterMobile}>
        <Footer />
      </div>
    </div>
  )
}
