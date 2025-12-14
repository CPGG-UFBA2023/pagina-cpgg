import { Link } from 'react-router-dom';
import styles from './SobreNos.module.css';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export function SobreNos() {
  const { t } = useLanguage();
  
  return (
    <div className={`${styles.pageContainer} sobrenos-page`}>
      <Header/>
      <main className={styles.sobreNos}>
        <h1 className={styles.title}>Sobre Nós</h1>

        <div className={styles.container}>
          <Link className={styles.card} to="/instituicao-mobile">
            <div className={styles.institutionButton}>
              <h2>Instituição</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/researchers">
            <div className={styles.personnelButton}>
              <h2>Pessoal</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/research-projects">
            <div className={styles.projectsButton}>
              <h2>Projetos de Pesquisa</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/production">
            <div className={styles.productionButton}>
              <h2>Produção Científica</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Recipes">
            <div className={styles.recipesButton}>
              <h2>Receitas</h2>
            </div>
          </Link>

          <Link className={styles.card} to="/Map">
            <div className={styles.mapButton}>
              <h2>Map</h2>
            </div>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  )
}