import { Link } from 'react-router-dom'
import styles from './CPGG2.module.css'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import earth from '../../components/Figures/earth-new.jpg'
import { useLanguage } from '@/contexts/LanguageContext'

export function CPGG2() {
  const { t } = useLanguage()
  
  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={`${styles.cpgg} cpgg`}>
        <div className={styles.Title}>
          <ul>Laboratórios e Reservas</ul>
          
          <div className={styles.cardContainer}>
            <Link to="/labs/laiga" className={styles.labCard}>
              <div className={styles.Laiga}>
                <h2>LAIGA</h2>
                <h2>Laboratório Integrado de Geofísica Aplicada</h2>
              </div>
            </Link>
            <Link to="/labs/lemar" className={styles.labCard}>
              <div className={styles.Lemar}>
                <h2>LEMAR</h2>
                <h2>Laboratório de Espectrometria de Massas de Alta Resolução</h2>
              </div>
            </Link>
            <Link to="/labs/ltm-rx" className={styles.labCard}>
              <div className={styles.LtmRx}>
                <h2>LTM-RX</h2>
                <h2>Laboratório de Tecnologia Mineral</h2>
              </div>
            </Link>
            <Link to="/labs/lamod" className={styles.labCard}>
              <div className={styles.Lamod}>
                <h2>LAMOD</h2>
                <h2>Laboratório de Modelagem Física</h2>
              </div>
            </Link>
            <Link to="/labs/LabFis" className={styles.labCard}>
              <div className={styles.LabFis}>
                <h2>LabFis</h2>
                <h2>Laboratório de Propriedades Físicas das Rochas</h2>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
