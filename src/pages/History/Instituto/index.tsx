import styles from './Instituto.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'

export function Instituto() {
  const { t } = useLanguage()

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.inst}>
        <div className={styles.box}>
          <h1 className={styles.heading}>{t('history.instituteTitle')}</h1>
          <div className={styles.text}>
            <p>{t('history.institute.p1')}</p>
            <p>{t('history.institute.p2')}</p>
            <p>{t('history.institute.p3')}</p>
            <p>{t('history.institute.p4')}</p>
            <p>{t('history.institute.p5')}</p>
            <p>{t('history.institute.p6')}</p>
          </div>
          <Link className={styles.backLink} to="/history">
            {t('button.back')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
