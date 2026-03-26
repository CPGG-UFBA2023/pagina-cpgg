import { Link } from 'react-router-dom'
import styles from './ltmrx.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

export function LtmRx() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.ltmrx}>
        <div className={styles.Title}>
          <div className={styles.box}>
            <ul>LTM-RX</ul>
            <a>Laboratório de Tecnologia Mineral - Raios X</a>
            <p>
              O Laboratório de Tecnologia Mineral - Raios X iniciou suas atividades em maio de 2018 é parte integrante do Complexo Laboratorial de Preparação e Análise de Amostras de Geociências (LAPAG) do Instituto de Geociências / UFBA. É um laboratório multiusuário, aberto à comunidade acadêmica, e os usuários devem cadastrar previamente os projetos de pesquisas.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
