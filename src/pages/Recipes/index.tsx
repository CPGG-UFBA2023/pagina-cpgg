import { Link } from 'react-router-dom';
import styles from './Recipes.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export function Recipes() {
  const { t } = useLanguage();
  return (
      <div className={styles.Container}>
      <Header/>
          <main className={`${styles.recipes} recipes`}>
              <h1 className={styles.title}>{t('resources.title')}</h1>

              <div className={styles.container}>
                  <a className={styles.logos} href="https://raw.githubusercontent.com/CPGG-UFBA/Documentos_WEB_CPGG/main/marcas.zip">
                       <h2>{t('resources.brandAssets')}</h2>
                  </a>

                  <Link className={styles.calendars} to="/recipes/calendars">
                       <h2>{t('resources.calendars')}</h2>
                  </Link>
                  
                  <a className={styles.power} href="https://raw.githubusercontent.com/CPGG-UFBA/Documentos_WEB_CPGG/main/modelo-cpgg.ppt">
                       <h2>{t('resources.powerPoint')}</h2>
                  </a>
                  
                  <a className={styles.latex} href="https://raw.githubusercontent.com/CPGG-UFBA/Documentos_WEB_CPGG/main/slide.zip">
                       <h2>{t('resources.latex')}</h2>
                  </a>
                  
                  <Link className={styles.gmt} to="/recipes/gmt-codes">
                       <h2>{t('resources.gmt')}</h2>
                  </Link>
                  
                  <a className={styles.python} href="/src/assets/PDF/Deliberacao_normativa_2_2023.pdf">
                       <h2>{t('resources.python')}</h2>
                  </a>
              </div>
          </main>
          <Footer/>
      </div>
  )
}