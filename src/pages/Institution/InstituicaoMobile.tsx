import { Link } from 'react-router-dom';
import styles from './InstituicaoMobile.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export function InstituicaoMobile() {
  const { t } = useLanguage();
  return (
    <div className={`${styles.pageContainer} instituicao-mobile-page`}>
      <Header/>
      <main className={styles.main}>
        <h1 className={styles.title}>{t('nav.institution')}</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/cpgg">
            <div className={styles.cpggButton}>
              <h2>{t('nav.cpgg')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/history">
            <div className={styles.historyButton}>
              <h2>{t('nav.history')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Regulations">
            <div className={styles.regulationsButton}>
              <h2>{t('nav.regulations')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Photos">
            <div className={styles.photosButton}>
              <h2>{t('nav.photos')}</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/atas">
            <div className={styles.regulationsButton}>
              <h2>{t('nav.minutes')}</h2>
            </div>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  )
}
