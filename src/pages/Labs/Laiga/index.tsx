import { Link } from 'react-router-dom'
import styles from './laiga.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import earth from '../../../assets/earth-imgur.png'
import { useLanguage } from '@/contexts/LanguageContext'
import { LabPhotosEditor, useLabPhotos } from '@/components/LabPhotosEditor'

const GRAD = 'linear-gradient(180deg, rgba(2,0,36,0.05) 0%, rgba(63,9,121,0.35) 100%)'

export function Laiga() {
  const { t } = useLanguage()
  const { photos, refetch } = useLabPhotos('LAIGA')

  const photoStyle = (index: number) => {
    const url = photos[`photo${index}_url`]
    if (!url) return undefined
    return {
      backgroundImage: `${GRAD}, url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    } as React.CSSProperties
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <LabPhotosEditor
        acronym="LAIGA"
        onSaved={refetch}
        slots={[
          { index: 1, label: 'Foto 1' },
          { index: 2, label: 'Foto 2' },
          { index: 3, label: 'Foto 3' },
          { index: 4, label: 'Foto 4' },
        ]}
      />
      <div className={styles.laiga}>
        <div className={styles.Title} >
          <div className={styles.box}>
            <div className={styles.photoGrid}>
              <div className={styles.box1} style={photoStyle(1)}>
                <h4 className={styles.legend1}>{photos.photo1_legend || t('laiga.room1')}</h4>
              </div>
              <div className={styles.box2} style={photoStyle(2)}>
                <h4 className={styles.legend2}>{photos.photo2_legend || t('laiga.room2')}</h4>
              </div>
              <div className={styles.box3} style={photoStyle(3)}>
                <h4 className={styles.legend3}>{photos.photo3_legend || t('laiga.room3')}</h4>
              </div>
              <div className={styles.box4} style={photoStyle(4)}>
                <h4 className={styles.legend4}>{photos.photo4_legend || t('laiga.room4')}</h4>
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
