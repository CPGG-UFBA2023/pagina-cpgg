import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import styles from './PessoalMobile.module.css';

export function PessoalMobile() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Pessoal</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/coordination">
            <div className={styles.button}>
              <h2>Coordenação e Conselhos</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/researchers">
            <div className={styles.button}>
              <h2>Pesquisadores</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/technicians">
            <div className={styles.button}>
              <h2>Corpo Técnico</h2>
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
