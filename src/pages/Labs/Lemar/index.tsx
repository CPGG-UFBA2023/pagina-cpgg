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

           <b className={styles.purpleText}>Chefe:</b>
           <span>Prof. Dr. Eduardo Reis Viana Rocha Júnior</span>
           <span><a href="mailto:eduardo.junior@ufba.br" className={styles.purpleLink}>eduardo.junior@ufba.br</a></span>
           <br />
           <b className={styles.purpleText}>Vice-Chefe:</b>
           <span>Profa. Dra. Letícia Freitas Guimarães</span>
           <span><a href="mailto:guimaraesleticia@ufba.br" className={styles.purpleLink}>guimaraesleticia@ufba.br</a></span>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
