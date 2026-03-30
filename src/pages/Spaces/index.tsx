import { Link } from 'react-router-dom';
import './spaces-no-scroll.css';
import styles from './Spaces.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export function Spaces() {
  const { t } = useLanguage();
  
  return (
    <div className={`${styles.pageContainer} spaces-page`}>
      <Header/>
      <main className={`${styles.spaces} spaces`}>
        <h1 className={styles.title}>{t('spaces.title')}</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/spaces/auditory">
            <div className={styles.auditory}>
              <h2>{t('spaces.auditory')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/spaces/meeting-room">
            <div className={styles.meetingroom}>
              <h2>{t('spaces.meetingRoom')}</h2>
            </div>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  )
}
