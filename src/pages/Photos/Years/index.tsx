import styles from './fiftiethyears.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BackButtonPhotos } from '../../../components/BackButtonPhotos'
import { useLanguage } from '@/contexts/LanguageContext'

import photo1 from '../../../assets/Photos/Years/Foto1.png'
import photo2 from '../../../assets/Photos/Years/Foto2.png'
import photo3 from '../../../assets/Photos/Years/Foto3.png'
import photo4 from '../../../assets/Photos/Years/Foto4.png'
import photo5 from '../../../assets/Photos/Years/Foto5.png'
import photo6 from '../../../assets/Photos/Years/Foto6.png'
import photo7 from '../../../assets/Photos/Years/Foto7.png'
import photo8 from '../../../assets/Photos/Years/Foto8.png'
import photo9 from '../../../assets/Photos/Years/Foto9.png'
import photo10 from '../../../assets/Photos/Years/Foto10.png'
import photo11 from '../../../assets/Photos/Years/Foto11.png'
import photo12 from '../../../assets/Photos/Years/Foto12.png'
import photo13 from '../../../assets/Photos/Years/Foto13.png'
import photo14 from '../../../assets/Photos/Years/Foto14.png'
import photo15 from '../../../assets/Photos/Years/Foto15.png'
import photo16 from '../../../assets/Photos/Years/Foto16.png'
import photo17 from '../../../assets/Photos/Years/Foto17.png'
import photo18 from '../../../assets/Photos/Years/Foto18.png'
import photo19 from '../../../assets/Photos/Years/Foto19.png'
import photo20 from '../../../assets/Photos/Years/Foto20.png'
import photo21 from '../../../assets/Photos/Years/Foto21.png'
import photo22 from '../../../assets/Photos/Years/Foto22.png'
import photo23 from '../../../assets/Photos/Years/Foto23.png'
import photo24 from '../../../assets/Photos/Years/Foto24.png'
import photo25 from '../../../assets/Photos/Years/Foto25.png'
import photo26 from '../../../assets/Photos/Years/Foto26.png'
import photo27 from '../../../assets/Photos/Years/Foto27.png'
import photo28 from '../../../assets/Photos/Years/Foto28.png'
import photo29 from '../../../assets/Photos/Years/Foto29.png'
import photo30 from '../../../assets/Photos/Years/Foto30.png'


export function Years() {
  const { t } = useLanguage()
  return (
    <div className={styles.pageContainer}>
      <Header />
      <BackButtonPhotos />
      <div className={styles.Years}>
          <ul>{t('photos.fiftyYearsTitle')}</ul>
          <div className={styles.box}>
          <div className={styles.gallery}>
            <div className={styles.photo1}>
              <img src={photo1} alt={`${t('photos.photoAlt')} 1`} />
            </div>
            <div className={styles.photo2}>
              <img src={photo2} alt={`${t('photos.photoAlt')} 2`} />
            </div>
            <div className={styles.photo3}>
              <img src={photo3} alt={`${t('photos.photoAlt')} 3`} />
            </div>
            <div className={styles.photo4}>
              <img src={photo4} alt='Foto4' />
            </div>
            <div className={styles.photo5}>
              <img src={photo5} alt='Foto5' />
            </div>
            <div className={styles.photo6}>
              <img src={photo6} alt='Foto6' />
            </div>
            <div className={styles.photo7}>
              <img src={photo7} alt='Foto7' />
            </div>
            <div className={styles.photo8}>
              <img src={photo8} alt='Foto8' />
            </div>
            <div className={styles.photo9}>
              <img src={photo9} alt='Foto9' />
            </div>
            <div className={styles.photo10}>
              <img src={photo10} alt='Foto10' />
            </div>
            <div className={styles.photo11}>
              <img src={photo11} alt='Fot11' />
            </div>
            <div className={styles.photo12}>
              <img src={photo12} alt='Foto12' />
            </div>
            <div className={styles.photo13}>
              <img src={photo13} alt='Foto13' />
            </div>
            <div className={styles.photo14}>
              <img src={photo14} alt='Foto14' />
            </div>
            <div className={styles.photo15}>
              <img src={photo15} alt='Foto15' />
            </div>
            <div className={styles.photo16}>
              <img src={photo16} alt='Foto16' />
            </div>
            <div className={styles.photo17}>
              <img src={photo17} alt='Foto17' />
            </div>
            <div className={styles.photo18}>
              <img src={photo18} alt='Foto18' />
            </div>
            <div className={styles.photo19}>
              <img src={photo19} alt='Foto19' />
            </div>
            <div className={styles.photo20}>
              <img src={photo20} alt='Foto20' />
            </div>
            <div className={styles.photo21}>
              <img src={photo21} alt='Foto21' />
            </div>
            <div className={styles.photo22}>
              <img src={photo22} alt='Foto22' />
            </div>
            <div className={styles.photo23}>
              <img src={photo23} alt='Foto23' />
            </div>
            <div className={styles.photo24}>
              <img src={photo24} alt='Foto24' />
            </div>
            <div className={styles.photo25}>
              <img src={photo25} alt='Foto25' />
            </div>
            <div className={styles.photo26}>
              <img src={photo26} alt='Foto26' />
            </div>
            <div className={styles.photo27}>
              <img src={photo27} alt='Foto27' />
            </div>
            <div className={styles.photo28}>
              <img src={photo28} alt='Foto28' />
            </div>
            <div className={styles.photo29}>
              <img src={photo29} alt='Foto29' />
            </div>

            <div className={styles.photo30}>
              <img src={photo30} alt='Foto30' />
            </div>
            
            
          </div>
          </div>
        </div>

      <Footer />
    </div>
  )
}
