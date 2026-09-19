import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import styles from './PessoalMobile.module.css';
import { useLanguage } from '@/contexts/LanguageContext';

export function PessoalMobile() {
  const { t } = useLanguage();
  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <h1 className={styles.title}>{t('nav.personnel')}</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/coordination">
            <div className={styles.button}>
              <h2>{t('nav.coordination')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/researchers">
            <div className={styles.button}>
              <h2>{t('nav.researchers')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/senior-researchers">
            <div className={styles.button}>
              <h2>{t('nav.seniorResearchers')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/technicians">
            <div className={styles.button}>
              <h2>{t('nav.technicians')}</h2>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
