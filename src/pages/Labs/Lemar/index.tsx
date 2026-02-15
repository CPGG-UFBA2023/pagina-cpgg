import { Link } from 'react-router-dom'
import styles from './lemar.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

export function Lemar() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.laiga}>
        <div className={styles.Title} >
          <div className={styles.box}>
          <ul>LEMAR</ul>
          <a>Laboratório de Espectrometria de Massas de Alta Resolução</a>
          <p>
              O Laboratório de Espectrometria de Massas de Alta Resolução (LEMAR) é dedicado à análise de compostos orgânicos e inorgânicos utilizando técnicas avançadas de espectrometria de massas.
            </p>
            <br></br>
            <p>
              O LEMAR possui equipamentos de última geração para análises de alta resolução, atendendo às demandas de pesquisa em geoquímica, petroquímica e ciências ambientais.
            </p>
            <br></br>
            <p>
              O laboratório oferece suporte a projetos de pesquisa internos e externos, com foco na qualidade e precisão dos resultados analíticos.
            </p>
            <br></br>

           <b className={styles.purpleText}>Responsável:</b>
           <span>A definir</span>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
