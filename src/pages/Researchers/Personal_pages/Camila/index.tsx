import styles from './Camila.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Camila() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p> Camila Brasil Louro da Silveira </p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Camila Brasil Louro da Silveira"
            staticDescription={`Sou oceanógrafa, Professora Adjunta do Departamento de Oceanografia na Universidade Federal da Bahia. Tenho grau de Doutorado e Mestrado em Oceanografia pela Universidade Federal de Pernambuco. Atuo na área de monitoramento, mapeamento e conservação, sensoriamento remoto e geoprocessamento aplicado ao ambiente marinho e costeiro, principalmente em recifes de coral, e na obtenção e tratamento de dados de campo. Possui experiência em expedições Reef Check Brasil na APA Costa dos Corais (PE/AL), PARNAMAR Fernando de Noronha, PARNAMAR Abrolhos, entre outras.`}
            belowPhoto={<ResearcherEditButton researcherName="Camila Brasil Louro da Silveira" inline />}
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="https://lattes.cnpq.br/1170306174154163" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>camilasilveira@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}