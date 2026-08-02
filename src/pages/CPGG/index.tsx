import styles from './CPGG.module.css'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import cpggAerial from '../../assets/Photos/CPGG/cpgg-aerial.jpg'
import { getTotalResearchersCount } from '../../data/researchers'
import { useLanguage } from '@/contexts/LanguageContext'

export function CPGG() {
  const totalResearchers = getTotalResearchersCount()
  const { t } = useLanguage()

  const photos = [
    { img: cpggAerial, legend: 'Sede do CPGG vista de cima' },
    { img: 'https://i.imgur.com/fQMNk9Y.jpg', legend: t('cpgg.legend2') },
    { img: 'https://i.imgur.com/RKAvYyR.jpg', legend: t('cpgg.legend3') },
    { img: 'https://i.imgur.com/7oNBqkd.jpg', legend: t('cpgg.legend1') },
  ]

  return (
    <div className={`${styles.pageContainer} cpgg-page-container`}>
      <Header />
      <main className={`${styles.cpgg} cpgg`}>
        <div className={styles.box}>
          <h1 className={styles.heading}>{t('cpgg.title')}</h1>

          <div className={styles.content}>
            <aside className={styles.gallery}>
              {photos.map((p, i) => (
                <figure className={styles.photoCard} key={i}>
                  <img className={styles.figImg} src={p.img} alt={p.legend} loading="lazy" />
                  <figcaption className={styles.legend}>{p.legend}</figcaption>
                </figure>
              ))}
            </aside>

            <div className={styles.text}>
              <p>{t('cpgg.description1')}</p>
              <p>{t('cpgg.description2')}</p>
              <p>{t('cpgg.description3')}</p>
              <p>{t('cpgg.description4').replace('{count}', totalResearchers.toString())}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
