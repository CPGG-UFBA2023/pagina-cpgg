import styles from './firstmeeting.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { BackButtonPhotos } from '../../../components/BackButtonPhotos'
import { useLanguage } from '@/contexts/LanguageContext'

const photo1 = 'https://imgur.com/lvESJHN.jpg'
const photo2 = 'https://imgur.com/QaTS5bR.jpg'
const photo3 = 'https://imgur.com/zobqr2b.jpg'
const photo4 = 'https://imgur.com/ANSaXpu.jpg'
const photo5 = 'https://imgur.com/HK3MFA9.jpg'
const photo6 = 'https://imgur.com/YgBtjzG.jpg'
const photo7 = 'https://imgur.com/vaudMVm.jpg'
const photo8 = 'https://imgur.com/vaudMVm.jpg'
const photo9 = 'https://imgur.com/bUI0F8f.jpg'
const photo10 = 'https://imgur.com/8iLDZ3Z.jpg'
const photo11 = 'https://imgur.com/cFsgQ9e.jpg'
const photo12 = 'https://imgur.com/IQgebg3.jpg'
const photo13 = 'https://imgur.com/tLVri9b.jpg'
const photo14 = 'https://imgur.com/y630kmm.jpg'
const photo15 = 'https://imgur.com/AX8qxQN.jpg'
const photo16 = 'https://imgur.com/5Hyv0FX.jpg'
const photo17 = 'https://imgur.com/dnm4jOl.jpg'
const photo18 = 'https://imgur.com/NRq0yZH.jpg'
const photo19 = 'https://imgur.com/LQXVKTW.jpg'
const photo20 = 'https://imgur.com/T4Y0ouG.jpg'
const photo21 = 'https://imgur.com/kwpibYz.jpg'
const photo22 = 'https://imgur.com/DbgG0FT.jpg'




export function FirstMeeting() {
  const { t } = useLanguage()
  return (
    <div className={styles.pageContainer}>
      <Header />
      <BackButtonPhotos />
      <div className={styles.FirstMeeting}>
          <ul>{t('photos.firstMeetingTitle')}</ul>
          <div className={styles.box}>
          <div className={styles.gallery}>
            <div className={styles.photo1}>
              <img src={photo1} alt='Foto1' />
            </div>
            <div className={styles.photo2}>
              <img src={photo2} alt='Foto2' />
            </div>
            <div className={styles.photo3}>
              <img src={photo3} alt='Foto3' />
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

            
          </div>
          </div>
        </div>

      <Footer />
    </div>
  )
}
