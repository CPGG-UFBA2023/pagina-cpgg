import styles from './lagep.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

export function Lagep() {
  return (
    <>
      <Header />
      <div className={styles.lagep}>
        <div className={styles.Title}>
          <ul> LAGEP </ul>
          <a>Laboratório de Geofísica e Exploração de Petróleo</a>
          <div className={styles.box}>
            <p>
              O LAGEP é o Laboratório de Geofísica e Exploração de Petróleo que pertence ao CPGG, amplamente reconhecido por suas pesquisas científicas aplicadas à indústria petrolífera e de energia, focando principalmente em:
            </p>
            <ul>
              <li>Processamento e imageamento sísmico (desenvolvimento de algoritmos e softwares em linguagens como Fortran para melhorar a qualidade de dados geofísicos).</li>
              <li>Atenuação de múltiplas e filtragem em dados sísmicos convencionais e de alta resolução.</li>
              <li>Migração e modelagem geofísica, auxiliando na identificação de reservatórios e estruturas geológicas profundas.</li>
            </ul>
            <br />
            <b> Coordenador do LAGEP</b>
            <span> Prof. Milton José Porsani</span>

            <div className={styles.box1}>
              <h4 className={styles.legend1}>Sala 1 - Almoxarifado com equipamentos de geofísica</h4>
            </div>
            <div className={styles.box2}>
              <h4 className={styles.legend2}>Sala 1 - Sala de Dados</h4>
            </div>
            <div className={styles.box3}>
              <h4 className={styles.legend3}>Sala 3 - Eletrônica</h4>
            </div>
            <div className={styles.box4}>
              <h4 className={styles.legend4}>Sala de apoio do LAGEP</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
