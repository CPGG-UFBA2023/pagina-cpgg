import styles from './lamod.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import lamodPhoto1 from '../../../assets/lamod-photo1.png'

export function Lamod() {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.lamod}>
        <div className={styles.Title}>
          <div className={styles.box}>
            <ul>LAMOD</ul>
            <a>Laboratório de Modelagem Física</a>
            <p>
              O LAMOD, localizado no prédio do Centro de Pesquisa em Geofísica e Geologia (CPGG) do Instituto de Geociências da UFBA, é um laboratório multiusuário dedicado à modelagem física de estruturas geológicas, ocupando uma área climatizada de 40 m². Inaugurado com recursos dos projetos Rift Bahia I e II em parceria com a Petrobras S/A entre 2015 e 2018, o espaço foi projetado para ser o mais moderno do gênero no Brasil. Sua infraestrutura inclui uma área administrativa situada em um mezanino e uma área de experimentos no andar térreo.
            </p>
            <br />
            <p>
              O laboratório conta com A Mesa de Deformação NSB 2018, única no mundo em seu design e capacidade, permitindo a coleta de um volume significativo de dados experimentais. Para isso, o LAMOD dispõe de sete computadores de mesa e dois notebooks acoplados ao sistema. Sua concepção contou com visitas técnicas do coordenador, Prof. Dr. Luiz Cesar Correa Gomes, a renomados laboratórios do Brasil, como os da UFOP, UFRN e CENPES-RJ, além do Royal Holloway na Universidade de Londres.
            </p>
            <br />

            <b className={styles.purpleText}>Chefe:</b>
            <span>Prof. Dr. Luiz Cesar Correa Gomes</span>

            <div className={styles.photoBox1} style={{ backgroundImage: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${lamodPhoto1})` }}>
              <h4 className={styles.legend1}>Mesa de Deformação NSB 2018</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
