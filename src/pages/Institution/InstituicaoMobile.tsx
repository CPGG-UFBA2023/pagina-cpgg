import { Link } from 'react-router-dom';
import styles from './InstituicaoMobile.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export function InstituicaoMobile() {
  return (
    <div className={`${styles.pageContainer} instituicao-mobile-page`}>
      <Header/>
      <main className={styles.main}>
        <h1 className={styles.title}>Instituição</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/cpgg">
            <div className={styles.cpggButton}>
              <h2>O CPGG</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/history">
            <div className={styles.historyButton}>
              <h2>Nossa História</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Regulations">
            <div className={styles.regulationsButton}>
              <h2>Regimento e Normas</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Photos">
            <div className={styles.photosButton}>
              <h2>Fotos</h2>
            </div>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  )
}
