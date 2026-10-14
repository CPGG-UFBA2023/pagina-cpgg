import styles from './Joelson.module.css'
import { Header } from '../../../../components/Header'
import { Footer } from '../../../../components/Footer'
import { ResearcherEditButton } from '../../../../components/ResearcherEditButton'
import { DynamicResearcherProfile } from '../../../../components/DynamicResearcherProfile'
import { BackButton } from '../../../../components/BackButton'

export function Joelson() {
  return (
    <div className={styles.Container}>
      <Header />
      <div>
        <div className={styles.Professor} >
          <BackButton />
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}><span>Joelson da Conceição Batista</span><ResearcherEditButton researcherName="Joelson da Conceição Batista" inline /></p>
          <div className={styles.box1}>
          <DynamicResearcherProfile 
            researcherName="Joelson da Conceição Batista"
            staticDescription="Possui graduação em Engenharia Elétrica pelo Instituto Federal da Bahia e em Geofísica pela Universidade Federal da Bahia, mestrado e doutorado em Geofísica pela Universidade Federal da Bahia. Trabalhou como geofísico sênior na Georadar Levantamentos Geofísicos (2010 - 2014) e foi pesquisador - bolsista Pós Doutorado do Instituto Nacional de Pesquisas Espaciais (2014 - 2015), onde desenvolveu pesquisas na área de Geociências, com ênfase em Indução Eletromagnética Terrestre, atuando com os métodos magnetotelúrico. Além disso, é professor no Departamento de Geofísica, IGEO-UFBA, onde ministra disciplinas na área de Geofísica Aplicada. Tem experiência na área de Geociências, com ênfase em Geofísica Aplicada, atuando principalmente nos seguintes temas: Petrofísica, Métodos sísmicos, potenciais, elétricos e eletromagnéticos."
          />
            <ul> Link para Currículo Lattes</ul>

            <nav>
             <a href="https://lattes.cnpq.br/8901234567890123" target="_blank" rel="noopener noreferrer">Currículo</a>
           </nav>
           <b> e-mail</b>
           <p>joelson@ufba.br</p> 
            <div className={styles.box2}>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}