import { useState } from 'react'
import styles from './ltmrx.module.css'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import drxPhoto from '../../../assets/Photos/ltmrx-drx.png'
import frxPhoto from '../../../assets/Photos/ltmrx-frx.png'

export function LtmRx() {
  const [showRequest, setShowRequest] = useState(false)

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.ltmrx}>
        <div className={styles.Title}>
          <div className={styles.box}>
            <ul>LTM-RX</ul>
            <a>Laboratório de Tecnologia Mineral - Raios X</a>

            {!showRequest ? (
              <>
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

                <div className={styles.requerimentoButton}>
                  <button onClick={() => setShowRequest(true)} className={styles.buttonLink}>
                    Solicitação de Análise
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  É necessário o envio de uma cópia do projeto de pesquisa onde estão previstas as análises de DRX e/ou FRX. Após aprovação do pedido pelos responsáveis do laboratório, as amostras deverão ser entregues, juntamente com o Termo de Compromisso assinado pelo(a) professor(a) orientador(a)/responsável, no Laboratório de Tecnologia Mineral – Raios X, que fica no Complexo Laboratorial de Preparação e Análise de Amostras (LAPAG) Instituto de Geociências/UFBA, Bloco B, 1º andar, sala 202B.
                </p>
                <p>
                  A realização das análises será por lote com no máximo 10 amostras. Todas as análises deverão ser preferencialmente acompanhadas pelo usuário, exceto em caso de prestação de serviço.
                </p>
                <p>
                  Os custos das análises seguem tabela em vigor e disponível na pasta compartilhada. A contrapartida será calculada a partir da demanda de análise solicitada e poderá ser negociada somente com a coordenação do laboratório.
                </p>
                <p>
                  Os trabalhos a serem publicados e que utilizarem análises realizadas no laboratório, deverão – OBRIGATORIAMENTE - fazer a menção ao Laboratório de Tecnologia Mineral - RAIOS X / LAPAG / IGEO.
                </p>

                <p className={styles.routinesTitle}>OBSERVAÇÕES IMPORTANTES:</p>
                <ul className={styles.routineList}>
                  <li>As amostras devem ser acondicionadas em embalagem adequada (potes com tampa ou eppendorfs) e identificadas com etiquetas. A IDENTIFICAÇÃO DEVE SER REALIZADA PELO USUÁRIO.</li>
                  <li>Amostras de pós devem ser previamente preparadas, peneiradas em malha #200 mesh e homogêneas. O RAIOS X LAPAG não dispõe de infraestrutura (almofarizes/pistilos/peneiras) e incentiva os alunos na preparação de suas amostras.</li>
                  <li>As amostras deverão ser entregues juntamente com o Termo de Compromisso (disponível na pasta compartilhada) preenchido e assinado pelo orientador, no Laboratório de Tecnologia Mineral – Raios X, Instituto de Geociências, Bloco B, 1º andar, Sala 202B.</li>
                  <li>É necessário um mínimo de 5g por amostra.</li>
                  <li>Amostras em desacordo com as observações supracitadas serão devolvidas ao solicitante.</li>
                </ul>

                <p>
                  Contato: <a href="mailto:raiosx-lapag@ufba.br" className={styles.purpleLink}>raiosx-lapag@ufba.br</a>
                  <br />
                  Fone: (71) 3283-8634
                </p>

                <p>
                  Acesse o formulário de solicitação:
                  <br />
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeZPFkGX2DYb1vzf9nYEzWn9DMMu_zMcEPAZoYJDEZJRiZOiA/viewform"
                    target="_blank"
                    className={styles.purpleLink}
                  >
                    Formulário de Solicitação de Análises (DRX)
                  </a>
                </p>

                <div className={styles.requerimentoButton}>
                  <button onClick={() => setShowRequest(false)} className={styles.buttonLink}>
                    Voltar
                  </button>
                </div>
              </>
            )}

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
