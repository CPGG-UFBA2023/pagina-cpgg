import { Link } from 'react-router-dom'
import styles from './laiga.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import earth from '../../../assets/earth-imgur.png'
import { useLanguage } from '@/contexts/LanguageContext'

export function Laiga() {
  const { t } = useLanguage()
  
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.laiga}>
        <div className={styles.Title} >
          <div className={styles.box}>
            <div className={styles.photoGrid}>
              <div className={styles.box1}>
                <h4 className={styles.legend1}>{t('laiga.room1')}</h4>
              </div>
              <div className={styles.box2}>
                <h4 className={styles.legend2}>{t('laiga.room2')}</h4>
              </div>
              <div className={styles.box3}>
                <h4 className={styles.legend3}>{t('laiga.room3')}</h4>
              </div>
              <div className={styles.box4}>
                <h4 className={styles.legend4}>{t('laiga.room4')}</h4>
              </div>
            </div>
            <div className={styles.content}>
              <ul>{t('laiga.title')}</ul>
              <a className={styles.subtitle}>{t('laiga.subtitle')}</a>
              <p>{t('laiga.description1')}</p>
              <p>{t('laiga.description2')}</p>
              <p>{t('laiga.description3')}</p>
              <p>{t('laiga.description4')}</p>
              <p>
                {t('laiga.description5')}
                <br />
                <a
                  href="https://pnipe.mcti.gov.br/search?term=Laiga"
                  target="_blank"
                  className={styles.purpleLink}
                >
                  {t('laiga.pnipeSite')}
                </a>
              </p>
              <p>{t('laiga.availability')}</p>
              <b className={styles.purpleText}>{t('laiga.chief')}</b>
              <span>{t('laiga.chiefName')}</span>
              <div className={styles.requerimentoButton}>
                <Link to="/labs/laiga/reservation-form" className={styles.buttonLink}>
                  {t('laiga.requestButton')}
                </Link>
                <Link to="/labs/laiga/repositorio/login" className={styles.buttonLink}>
                  Repositório
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}