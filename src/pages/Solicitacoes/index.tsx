import { Link } from 'react-router-dom';
import styles from './Solicitacoes.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export function Solicitacoes() {
  const { t } = useLanguage();
  
  return (
    <div className={`${styles.pageContainer} solicitacoes-page`}>
      <Header/>
      <main className={styles.solicitacoes}>
        <h1 className={styles.title}>{t('requests.title')}</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/spaces">
            <div className={styles.spacesButton}>
              <h2>{t('nav.spacesReservations')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/cpgg2">
            <div className={styles.labsButton}>
              <h2>{t('nav.labsReservations')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/repairs-services">
            <div className={styles.repairsButton}>
              <h2>{t('requests.repairs')}</h2>
            </div>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  )
}
