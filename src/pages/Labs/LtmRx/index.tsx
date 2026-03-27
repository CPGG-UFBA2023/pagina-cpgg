import { Link } from 'react-router-dom'
import styles from './ltmrx.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import drxPhoto from '../../../assets/Photos/ltmrx-drx.png'
import frxPhoto from '../../../assets/Photos/ltmrx-frx.png'

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
            <p className={styles.routinesTitle}>O laboratório oferece as seguintes rotinas analíticas:</p>
            <div className={styles.routineSection}>
              <h3>DRX (MÉTODO DO PÓ TOTAL)</h3>
              <ul className={styles.routineList}>
                <li>Identificação de fases minerais ou da estrutura cristalina de substâncias inorgânicas sintéticas;</li>
                <li>Determinação de parâmetros cristalinos;</li>
                <li>Identificação e estudo de fases minerais;</li>
                <li>Estudo de alteração e da mineralogia das zonas de oxidação;</li>
                <li>Composição normativa de solos, sedimentos e rochas sedimentares;</li>
                <li>Identificação e quantificação de fases minerais em rocha.</li>
              </ul>
            </div>
            <div className={styles.routineSection}>
              <h3>WDX - FRX</h3>
              <ul className={styles.routineList}>
                <li>Análises semi-quantitativas (sem curva de calibração).</li>
              </ul>
            </div>
            <p className={styles.routineNote}>
              Novas rotinas analíticas de interesse do laboratório poderão ser desenvolvidas em regime de parceria a fim de se atender a projetos específicos de pesquisa acadêmica, a partir de aprovação dos responsáveis pelo laboratório.
            </p>

            <p>
              Visite o site do PNIPE:
              <br />
              <a
                href="https://pnipe.mcti.gov.br/laboratory/23058"
                target="_blank"
                className={styles.purpleLink}
              >
                https://pnipe.mcti.gov.br/laboratory/23058
              </a>
            </p>

           <br />
           <b className={styles.purpleText}>Coordenador:</b>
           <span>Renato Carlos Vieira Santiago</span>
            <span>
              <a href="mailto:rcsantiago@ufba.br" className={styles.purpleLink}>
                rcsantiago@ufba.br
              </a>
            </span>

            <div className={styles.box1} style={{ background: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${drxPhoto}) center/cover` }}>
              <h4 className={styles.legend1}>Difratômetro de Raios X (DRX) BRUKER AXS, modelo D2 PHASER, para análise de fases em estudos de materiais. Energia: 8 Kev/ 30 KV máxima/corrente: 10mA.</h4>
            </div>
            <div className={styles.box2} style={{ background: `linear-gradient(90deg, rgba(2,0,36,0.1) 0%, rgba(63,9,121,0.1)), url(${frxPhoto}) center/cover` }}>
              <h4 className={styles.legend2}>Espectrômetro de Fluorescência (WDX-FRX) por dispersão de comprimento de onda – BRUKER AXS, modelo S8 TIGER, para análise de elementos químicos. Energia: 20,2 Kev/60KV máxima/corrente: 170mA.</h4>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
