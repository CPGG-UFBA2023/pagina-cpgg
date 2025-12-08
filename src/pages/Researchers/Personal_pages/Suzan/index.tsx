import styles from './Suzan.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'

export function Suzan() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <p> Suzan Souza de Vasconcelos </p>
          <div className={styles.box1}>
          Licenciada em Matemática pela Universidade Federal do Pará (2005), Mestra em Geofísica na área de concentração de Gravimetria e Magnetometria pela Universidade Federal do Pará (2007). Bacharel em Enfermagem pela Universidade do Estado do Pará (2008). Foi professora de Biofísica no curso de graduação em Enfermagem na Universidade da Amazônia (2009). Exerceu a função de coordenadora de atividades na disciplina de Geofísica no Projeto "Univesp - Licenciatura em Ciências", polo de São Carlos (2013). Doutora em Geofísica pela Universidade do Estado de São Paulo (2014) na área de Métodos Elétricos, com ênfase na Inversão de dados de Potencial Espontâneo e Modelagem de fluxo de água no meio poroso. Atuou como pesquisadora visitante no Lenep- Laboratório de engenharia e exploração de petróleo, bolsista do PRH-PB 226, no laboratório de petrofísica (2014). Admitida como professora 40h DE no Departamento de Geofísica do IGEO/UFBA (2015) onde atualmente é professora adjunta, nível 4. Atua como pesquisadora no Núcleo de Estudos Hidrogeológicos e do Meio Ambiente (NEHMA) em projetos de estudos de aterros sanitários e água subterrânea. Colaboradora nos projetos de extensão "Geoarretadas", "Seminário de água" e "MUGEO-Museu de Geociências". Cargos: Vice-chefe do DGf/UFBA de 31/05/2016 a 26/09/22. Chefe do DGf/UFBA desde 27/09/22. Conselheira da Regional Nordeste da SBGF- Sociedade Brasileira de Geofísica 2021-2025.
            <nav>
             <a href="https://lattes.cnpq.br/2470011858113025" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>suzan.vasconcelos@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}